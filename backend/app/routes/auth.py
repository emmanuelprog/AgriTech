"""
Authentication Routes
User registration, login, and token management
"""

import secrets # To generate a random token
import os

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from app import db, limiter
from app.models import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per hour")
def register():
    """
    Register a new user
    
    Expected JSON:
        {
            "email": "farmer@example.com",
            "username": "farmer123",
            "password": "securepassword",
            "fullName": "John Doe",
            "phone": "+234...",
            "location": "Lagos, Nigeria",
            "farmSize": 2.5
        }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'username', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            username=data['username'],
            full_name=data.get('fullName'),
            phone=data.get('phone'),
            location=data.get('location'),
            farm_size=data.get('farmSize'),
            role=data.get('role', 'farmer')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user.to_dict(),
            # 'accessToken': access_token,
            # 'refreshToken': refresh_token
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    """
    Login user
    
    Expected JSON:
        {
            "email": "farmer@example.com",
            "password": "securepassword"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'accessToken': access_token,
            'refreshToken': refresh_token
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    try:
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'success': True,
            'accessToken': access_token
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    Change user password
    
    Expected JSON:
        {
            "currentPassword": "oldpassword",
            "newPassword": "newpassword"
        }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data or 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({'error': 'Current and new password required'}), 400
        
        # Verify current password
        if not user.check_password(data['currentPassword']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Set new password
        user.set_password(data['newPassword'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update user profile
    
    Expected JSON:
        {
            "fullName": "John Doe",
            "phone": "+234...",
            "location": "Lagos",
            "farmSize": 3.5
        }
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'fullName' in data:
            user.full_name = data['fullName']
        if 'phone' in data:
            user.phone = data['phone']
        if 'location' in data:
            user.location = data['location']
        if 'farmSize' in data:
            user.farm_size = data['farmSize']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    
    if user:
        # 1. Generate and save token
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        db.session.commit()
        
        # 2. DETECT ENVIRONMENT
        # Locally, this will be http://localhost:3000
        # On Render, you will set this to https://vercel.app
        frontend_url = os.getenv('https://agri-tech-pink.vercel.app', 'http://localhost:3000')
        
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # 3. PRINT TO TERMINAL (For local/Render testing)
        print("\n" + "="*60)
        print(f"🔑 PASSWORD RESET REQUEST")
        print(f"User: {email}")
        print(f"Link: {reset_link}")
        print("="*60 + "\n")

    # Always return 200 for security
    return jsonify({
        'success': True, 
        'message': 'If the email exists, a reset link has been generated.'
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    # Find user with this token
    user = User.query.filter_by(reset_token=token).first()
    
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400
        
    # Update password and clear token
    user.set_password(new_password)
    user.reset_token = None
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Password reset successfully!'}), 200
