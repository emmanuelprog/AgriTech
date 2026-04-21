"""
Prediction History Routes
Manage prediction history (save, retrieve, delete)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import PredictionHistory
from datetime import datetime, timedelta
import json

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['POST'])
@jwt_required() 
def save_prediction():
    """
    Save a prediction to history
    
    Expected JSON:
        {
            "crop": "cassava",
            "disease": "CMD",
            "confidence": 94.5,
            "imageFilename": "image.jpg",
            "allPredictions": [...],
            "notes": "Optional notes"
        }
    
    Returns:
        Saved prediction with ID
    """
    try:

        # Get the ID from the token and convert to int for DB
        current_user_id = int(get_jwt_identity()) 
        
        data = request.get_json()
        print(f'This is the JSON file data: {data}')
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['crop', 'disease', 'confidence']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new prediction record
        prediction = PredictionHistory(
            user_id=current_user_id,
            crop=data['crop'],
            disease=data['disease'],
            confidence=data['confidence'],
            image_filename=data.get('imageFilename'),
            all_predictions=json.dumps(data.get('allPredictions', [])),
            notes=data.get('notes')
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'prediction': prediction.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """
    Get prediction history with optional filters
    
    Query parameters:
        - crop: Filter by crop type
        - limit: Number of results (default 50)
        - offset: Pagination offset (default 0)
        - days: Get history from last N days
    
    Returns:
        List of predictions
    """
    try:
        # Get query parameters
        current_user_id = int(get_jwt_identity())
        crop = request.args.get('crop')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        days = request.args.get('days')
        
        # Build query
        query = PredictionHistory.query.filter_by(user_id=current_user_id)
        
        # Filter by crop if specified
        if crop:
            query = query.filter_by(crop=crop)
        
        # Filter by date range if specified
        if days:
            cutoff_date = datetime.utcnow() - timedelta(days=int(days))
            query = query.filter(PredictionHistory.timestamp >= cutoff_date)
        
        # Order by most recent first
        query = query.order_by(PredictionHistory.timestamp.desc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        predictions = query.limit(limit).offset(offset).all()
        
        return jsonify({
            'success': True,
            'total': total,
            'limit': limit,
            'offset': offset,
            'predictions': [p.to_dict() for p in predictions]
        }), 200
    
    except Exception as e:
        #traceback.print_exc() 
        print(f"DEBUG ERROR: {e}") 
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history/<int:prediction_id>', methods=['GET'])
@jwt_required()
def get_prediction(prediction_id):
    """Get a specific prediction by ID"""
    try:
        current_user_id = int(get_jwt_identity())
        prediction = PredictionHistory.query.get(prediction_id, user_id=current_user_id)
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        return jsonify({
            'success': True,
            'prediction': prediction.to_dict()
        }), 200
    
    except Exception as e:        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history/<int:prediction_id>', methods=['PUT'])
@jwt_required()
def update_prediction(prediction_id):
    """
    Update a prediction (e.g., mark treatment as applied, add notes)
    
    Expected JSON:
        {
            "treatmentApplied": true,
            "notes": "Applied fungicide as recommended"
        }
    """
    try:
        current_user_id = int(get_jwt_identity())
        prediction = PredictionHistory.query.get(prediction_id, user_id=current_user_id)
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'treatmentApplied' in data:
            prediction.treatment_applied = data['treatmentApplied']
        
        if 'notes' in data:
            prediction.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'prediction': prediction.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history/<int:prediction_id>', methods=['DELETE'])
@jwt_required()
def delete_prediction(prediction_id):
    """Delete a prediction from history"""
    try:
        current_user_id = int(get_jwt_identity())
        prediction = PredictionHistory.query.get(prediction_id, user_id=current_user_id)
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        db.session.delete(prediction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Prediction deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history/stats', methods=['GET'])
@jwt_required()
def get_statistics():
    """
    Get statistics about prediction history
    
    Returns:
        Statistics including total predictions, by crop, by disease, etc.
    """
    try:
        # Current user
        current_user_id = int(get_jwt_identity())

        # Build query
        query = PredictionHistory.query.filter_by(user_id=current_user_id)

        # Total predictions
        total = query.count()
        
        # By crop
        cassava_count = query.filter_by(crop='cassava').count()
        tomato_count = query.filter_by(crop='tomato').count()
        
        # Recent predictions (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_count = query.filter(
            PredictionHistory.timestamp >= week_ago
        ).count()
        
        # Most common diseases
        from sqlalchemy import func
        common_diseases = db.session.query(
            PredictionHistory.disease,
            PredictionHistory.crop,
            func.count(PredictionHistory.id).label('count')
        ).group_by(
            PredictionHistory.disease,
            PredictionHistory.crop
        ).order_by(
            func.count(PredictionHistory.id).desc()
        ).limit(5).all()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'byCrop': {
                    'cassava': cassava_count,
                    'tomato': tomato_count
                },
                'recentWeek': recent_count,
                'topDiseases': [
                    {
                        'disease': d[0],
                        'crop': d[1],
                        'count': d[2]
                    }
                    for d in common_diseases
                ]
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@history_bp.route('/history/clear', methods=['DELETE'])
@jwt_required()
def clear_history():
    """
    Clear all prediction history
    Use with caution!
    """
    try:
        # Optional: Add authentication/authorization here
        # Current user
        current_user_id = int(get_jwt_identity())

        # Build query
        query = PredictionHistory.query.filter_by(user_id=current_user_id)

        count = query.count()
        query.delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Cleared {count} predictions from history'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
