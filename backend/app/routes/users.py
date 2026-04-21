"""
User Management Routes
Admin and user management endpoints
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import User, PredictionHistory
from functools import wraps

users_bp = Blueprint('users', __name__)

def admin_required():
    """Decorator to require admin role"""
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@users_bp.route('/', methods=['GET'])
@admin_required()
def list_users():
    """
    Get all users (Admin only)
    
    Query params:
        - page: Page number (default 1)
        - per_page: Results per page (default 20)
        - role: Filter by role
        - active: Filter by active status
    """
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        role = request.args.get('role')
        active = request.args.get('active')
        
        # Build query
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if active is not None:
            query = query.filter_by(is_active=active.lower() == 'true')
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in pagination.items],
            'pagination': {
                'page': page,
                'perPage': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@admin_required()
def get_user(user_id):
    """Get specific user details (Admin only)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_predictions = PredictionHistory.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'statistics': {
                'totalPredictions': total_predictions
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>/activate', methods=['PUT'])
@admin_required()
def activate_user(user_id):
    """Activate user account (Admin only)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User activated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>/deactivate', methods=['PUT'])
@admin_required()
def deactivate_user(user_id):
    """Deactivate user account (Admin only)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Cannot deactivate admin
        if user.role == 'admin':
            return jsonify({'error': 'Cannot deactivate admin account'}), 403
        
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deactivated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>/role', methods=['PUT'])
@admin_required()
def update_user_role(user_id):
    """
    Update user role (Admin only)
    
    Expected JSON:
        {
            "role": "farmer" | "expert" | "admin"
        }
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'role' not in data:
            return jsonify({'error': 'Role is required'}), 400
        
        valid_roles = ['farmer', 'expert', 'admin']
        if data['role'] not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {valid_roles}'}), 400
        
        user.role = data['role']
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User role updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/stats', methods=['GET'])
@admin_required()
def get_user_stats():
    """Get overall user statistics (Admin only)"""
    try:
        # Total users
        total_users = User.query.count()
        
        # Active users
        active_users = User.query.filter_by(is_active=True).count()
        
        # By role
        farmers = User.query.filter_by(role='farmer').count()
        experts = User.query.filter_by(role='expert').count()
        admins = User.query.filter_by(role='admin').count()
        
        # New users (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users = User.query.filter(User.created_at >= thirty_days_ago).count()
        
        return jsonify({
            'success': True,
            'statistics': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'byRole': {
                    'farmers': farmers,
                    'experts': experts,
                    'admins': admins
                },
                'newLast30Days': new_users
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    """Delete user account (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Cannot delete admin
        if user.role == 'admin':
            return jsonify({'error': 'Cannot delete admin account'}), 403
        
        # Delete user predictions first (cascade)
        PredictionHistory.query.filter_by(user_id=user_id).delete()
        
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
