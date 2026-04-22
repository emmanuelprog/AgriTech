"""
Analytics Routes
Advanced analytics and insights for crop disease patterns
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import PredictionHistory, User
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import json

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required() 
def get_dashboard():
    """
    Get dashboard overview with key metrics
    
    Returns comprehensive analytics for the current user
    """
    try:
        print(f'Get identity value {get_jwt_identity()}') #Debugging line to check JWT identity value
        current_user_id = int(get_jwt_identity())    

        # filter query by user_id and check results
        user_query = PredictionHistory.query.filter_by(user_id=current_user_id)

        # Total predictions
        total_predictions = user_query.count()
        print(f"DEBUG: Total Predictions in Flask is {total_predictions}") #Check your terminal! 

        # Check total rows regardless of user
        #total_all_users = PredictionHistory.query.count()
        #print(f"Total rows in table: {total_all_users}")

        # Check first row's user_id
        #first_entry = user_query.first()
        #if first_entry:
        #    print(f"Found user_id in DB: {first_entry.user_id}")

        
        # Predictions by crop
        cassava_count = user_query.filter_by(            
            crop='cassava'
        ).count()
        tomato_count = user_query.filter_by(            
            crop='tomato'
        ).count()
        
        # Recent predictions (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = user_query.filter(
            and_(                
                PredictionHistory.timestamp >= week_ago
            )
        ).count()
        
        # Diseased vs Healthy        
        healthy_count = user_query.filter(
            and_(                
                PredictionHistory.disease.in_(['Healthy', 'Tomato_healthy'])
            )
        ).count()

        # Diseased count (Total minus Healthy)
        diseased_count = total_predictions - healthy_count
        
        # Most common diseases
        common_diseases = db.session.query(
            PredictionHistory.disease,
            PredictionHistory.crop,
            func.count(PredictionHistory.id).label('count')
        ).filter(
            PredictionHistory.user_id == current_user_id
        ).group_by(
            PredictionHistory.disease,
            PredictionHistory.crop
        ).order_by(
            func.count(PredictionHistory.id).desc()
        ).limit(5).all()
        
        # Average confidence
        avg_confidence = db.session.query(
            func.avg(PredictionHistory.confidence)
        ).filter(
            PredictionHistory.user_id == current_user_id
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'dashboard': {
                'totalPredictions': total_predictions,
                'byCrop': {
                    'cassava': cassava_count,
                    'tomato': tomato_count
                },
                'recentWeek': recent_count,
                'diseaseStatus': {
                    'diseased': diseased_count,
                    'healthy': healthy_count
                },
                'topDiseases': [
                    {
                        'disease': d[0],
                        'crop': d[1],
                        'count': d[2]
                    }
                    for d in common_diseases
                ],
                'averageConfidence': round(float(avg_confidence), 2)
            }
        }), 200
    
    except Exception as e:
        print(f"DEBUG ERROR: {e}") 
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trends():
    """
    Get disease trends over time
    
    Query params:
        - days: Number of days to analyze (default 30)
        - crop: Filter by crop (optional)
    """
    try:
        print("We are in get_trends function", flush=True) #Debugging line to confirm we're hitting this endpoint
        current_user_id = int(get_jwt_identity())
        days = int(request.args.get('days', 30))
        crop = request.args.get('crop')
        
        # Get date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Build query
        query = PredictionHistory.query.filter(
            and_(
                PredictionHistory.user_id == current_user_id,
                PredictionHistory.timestamp >= start_date
            )
        )
        
        if crop:
            query = query.filter_by(crop=crop)
        
        # Group by date
        daily_counts = db.session.query(
            func.date(PredictionHistory.timestamp).label('date'),
            func.count(PredictionHistory.id).label('count')
        ).filter(
            and_(
                PredictionHistory.user_id == current_user_id,
                PredictionHistory.timestamp >= start_date
            )
        )
        
        if crop:
            daily_counts = daily_counts.filter_by(crop=crop)
        
        daily_counts = daily_counts.group_by(
            func.date(PredictionHistory.timestamp)
        ).all()
        
        # Disease breakdown over time
        disease_trends = db.session.query(
            func.date(PredictionHistory.timestamp).label('date'),
            PredictionHistory.disease,
            func.count(PredictionHistory.id).label('count')
        ).filter(
            and_(
                PredictionHistory.user_id == current_user_id,
                PredictionHistory.timestamp >= start_date
            )
        )
        
        if crop:
            disease_trends = disease_trends.filter_by(crop=crop)
        
        disease_trends = disease_trends.group_by(
            func.date(PredictionHistory.timestamp),
            PredictionHistory.disease
        ).all()
        
        # Format response
        trends_by_date = {}
        print(f"DEBUG: Disease trends raw data: {disease_trends}") #Debugging line to check raw disease trends data
        for date, disease, count in disease_trends:            
            date_str = date if isinstance(date, str) else date.isoformat()
            if date_str not in trends_by_date:
                trends_by_date[date_str] = {}
            trends_by_date[date_str][disease] = count
        
        return jsonify({
            'success': True,
            'trends': {
                'period': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': days
                },
                'dailyCounts': [
                    {
                        'date': date if isinstance(date, str) else date.isoformat(),
                        'count': count
                    }
                    for date, count in daily_counts
                ],
                'diseaseBreakdown': trends_by_date
            }
        }), 200
    
    except Exception as e:
        import traceback
        print("=" * 50)
        print("An error occurred in get_trends:")
        traceback.print_exc()  # Print the full stack trace for debugging
        print(f"DEBUG ERROR: {e}", flush=True)  # Ensure the error message is printed immediately
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/disease-distribution', methods=['GET'])
@jwt_required()
def get_disease_distribution():
    """
    Get disease distribution by crop
    
    Query params:
        - crop: 'cassava' or 'tomato' (optional)
    """
    try:
        current_user_id = int(get_jwt_identity())
        crop = request.args.get('crop')
        
        # Build query
        query = db.session.query(
            PredictionHistory.crop,
            PredictionHistory.disease,
            func.count(PredictionHistory.id).label('count'),
            func.avg(PredictionHistory.confidence).label('avg_confidence')
        ).filter(
            PredictionHistory.user_id == current_user_id
        )
        
        if crop:
            query = query.filter_by(crop=crop)
        
        results = query.group_by(
            PredictionHistory.crop,
            PredictionHistory.disease
        ).all()
        
        # Format by crop
        distribution = {}
        for crop_name, disease, count, avg_conf in results:
            if crop_name not in distribution:
                distribution[crop_name] = []
            
            distribution[crop_name].append({
                'disease': disease,
                'count': count,
                'avgConfidence': round(float(avg_conf), 2),
                'percentage': 0  # Will calculate below
            })
        
        # Calculate percentages
        for crop_name in distribution:
            total = sum(d['count'] for d in distribution[crop_name])
            for disease in distribution[crop_name]:
                disease['percentage'] = round((disease['count'] / total) * 100, 2)
        
        return jsonify({
            'success': True,
            'distribution': distribution
        }), 200
    
    except Exception as e:        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/confidence-analysis', methods=['GET'])
@jwt_required()
def get_confidence_analysis():
    """Analyze prediction confidence scores"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Confidence ranges
        ranges = [
            (0, 50, 'low'),
            (50, 70, 'medium'),
            (70, 90, 'high'),
            (90, 100, 'very_high')
        ]
        
        confidence_distribution = {}
        for min_conf, max_conf, label in ranges:
            count = PredictionHistory.query.filter(
                and_(
                    PredictionHistory.user_id == current_user_id,
                    PredictionHistory.confidence >= min_conf,
                    PredictionHistory.confidence < max_conf
                )
            ).count()
            
            confidence_distribution[label] = {
                'range': f'{min_conf}-{max_conf}%',
                'count': count
            }
        
        # By crop
        by_crop = {}
        for crop in ['cassava', 'tomato']:
            avg_conf = db.session.query(
                func.avg(PredictionHistory.confidence)
            ).filter(
                and_(
                    PredictionHistory.user_id == current_user_id,
                    PredictionHistory.crop == crop
                )
            ).scalar() or 0
            
            by_crop[crop] = round(float(avg_conf), 2)
        
        return jsonify({
            'success': True,
            'confidenceAnalysis': {
                'distribution': confidence_distribution,
                'averageByCrop': by_crop
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/location-heatmap', methods=['GET'])
@jwt_required()
def get_location_heatmap():
    """Get disease hotspots by location"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get predictions with location data
        predictions = PredictionHistory.query.filter(
            and_(
                PredictionHistory.user_id == current_user_id,
                PredictionHistory.latitude.isnot(None),
                PredictionHistory.longitude.isnot(None)
            )
        ).all()
        
        # Group by location
        locations = []
        for pred in predictions:
            locations.append({
                'latitude': pred.latitude,
                'longitude': pred.longitude,
                'disease': pred.disease,
                'crop': pred.crop,
                'locationName': pred.location_name,
                'timestamp': pred.timestamp.isoformat()
            })
        
        return jsonify({
            'success': True,
            'heatmap': {
                'totalPoints': len(locations),
                'locations': locations
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/treatment-effectiveness', methods=['GET'])
@jwt_required()
def get_treatment_effectiveness():
    """Analyze treatment application rates"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Total predictions
        total = PredictionHistory.query.filter_by(user_id=current_user_id).count()
        
        # Treatments applied
        treated = PredictionHistory.query.filter_by(
            user_id=current_user_id,
            treatment_applied=True
        ).count()
        
        # By disease
        by_disease = db.session.query(
            PredictionHistory.disease,
            func.count(PredictionHistory.id).label('total'),
            func.sum(func.cast(PredictionHistory.treatment_applied, db.Integer)).label('treated')
        ).filter(
            PredictionHistory.user_id == current_user_id
        ).group_by(
            PredictionHistory.disease
        ).all()
        
        disease_stats = [
            {
                'disease': disease,
                'total': total_count,
                'treated': treated_count or 0,
                'treatmentRate': round((treated_count or 0) / total_count * 100, 2)
            }
            for disease, total_count, treated_count in by_disease
        ]
        
        return jsonify({
            'success': True,
            'treatmentStats': {
                'overall': {
                    'total': total,
                    'treated': treated,
                    'treatmentRate': round((treated / total * 100) if total > 0 else 0, 2)
                },
                'byDisease': disease_stats
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/export-report', methods=['GET'])
@jwt_required()
def export_report():
    """Export analytics report"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        # Get all analytics
        dashboard_data = get_dashboard().get_json()
        trends_data = get_trends().get_json()
        distribution_data = get_disease_distribution().get_json()
        
        report = {
            'generatedAt': datetime.utcnow().isoformat(),
            'user': {
                'username': user.username,
                'location': user.location,
                'farmSize': user.farm_size
            },
            'dashboard': dashboard_data.get('dashboard'),
            'trends': trends_data.get('trends'),
            'distribution': distribution_data.get('distribution')
        }
        
        return jsonify({
            'success': True,
            'report': report
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
