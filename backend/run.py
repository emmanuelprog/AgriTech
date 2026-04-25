"""
AgriTech Backend - Main Application Entry Point
Run this file to start the Flask server
"""

from app import create_app
import os
from flask import jsonify

app = create_app()

# Get the jwt instance from the app's extensions
jwt = app.extensions['flask-jwt-extended']

@jwt.invalid_token_loader
def my_invalid_token_callback(error_string):
    print(f"❌ JWT Invalid: {error_string}")
    return jsonify({'success': False, 'message': error_string}), 422

@jwt.unauthorized_loader
def my_unauthorized_callback(error_string):
    print(f"⚠️ JWT Missing: {error_string}")
    return jsonify({'success': False, 'message': 'Missing Authorization Header'}), 422

@jwt.expired_token_loader
def my_expired_token_callback(jwt_header, jwt_payload):
    print("⏰ JWT Expired")
    return jsonify({'success': False, 'message': 'Token has expired'}), 401

import traceback

@app.errorhandler(Exception)
def handle_exception(e):
    # This prints the RED text (Traceback) to your terminal
    print("\n" + "!"*60)
    print("🔥 BACKEND CRASH DETECTED")
    traceback.print_exc() 
    print("!"*60 + "\n")
    
    # This sends the error message back to your React frontend
    return jsonify({
        "success": False,
        "error": str(e),
        "type": type(e).__name__
    }), 500


if __name__ == '__main__':
        
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development' 
    
    print("\n" + "="*60)
    print("🌾 AgriTech Backend API Starting...")
    print("="*60)
    print(f"📍 Running on: https://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        #threaded=True, 
        #ssl_context='adhoc'
    )
