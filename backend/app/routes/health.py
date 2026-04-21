"""
Health Check Routes
Check API and model status
"""

from flask import Blueprint, jsonify
from app.utils.model_loader import get_model_loader

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({
        'status': 'healthy',
        'message': 'AgriTech API is running'
    }), 200

@health_bp.route('/models/status', methods=['GET'])
def models_status():
    """Check status of loaded models"""
    loader = get_model_loader()
    
    models_info = {}
    for crop in ['cassava', 'tomato']:
        model = loader.models.get(crop)
        classes = loader.class_indices.get(crop, {})
        
        models_info[crop] = {
            'loaded': model is not None,
            'num_classes': len(classes),
            'classes': list(classes.values())
        }
    
    return jsonify({
        'status': 'ok',
        'models': models_info
    }), 200
