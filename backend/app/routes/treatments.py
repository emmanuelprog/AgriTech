"""
Treatment Information Routes
Get treatment recommendations for diseases
"""

from flask import Blueprint, jsonify, request
import json
import os

treatments_bp = Blueprint('treatments', __name__)

def load_treatment_data():
    """Load treatment data from JSON file"""
    treatment_file = os.path.join('app', 'data', 'treatments.json')
    with open(treatment_file, 'r') as f:
        return json.load(f)

@treatments_bp.route('/treatments/<crop>', methods=['GET'])
def get_crop_treatments(crop):
    """
    Get all treatment information for a specific crop
    
    Args:
        crop: 'cassava' or 'tomato'
    
    Returns:
        JSON with all disease treatments for the crop
    """
    crop = crop.lower()
    
    if crop not in ['cassava', 'tomato']:
        return jsonify({'error': 'Invalid crop type'}), 400
    
    try:
        data = load_treatment_data()
        crop_data = data.get(crop, {})
        
        return jsonify({
            'crop': crop,
            'diseases': crop_data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@treatments_bp.route('/treatments/<crop>/<disease>', methods=['GET'])
def get_disease_treatment(crop, disease):
    """
    Get treatment information for a specific disease
    
    Args:
        crop: 'cassava' or 'tomato'
        disease: Disease code (e.g., 'CMD', 'Tomato___Early_blight')
    
    Returns:
        JSON with treatment information
    """
    crop = crop.lower()
    
    if crop not in ['cassava', 'tomato']:
        return jsonify({'error': 'Invalid crop type'}), 400
    
    try:
        data = load_treatment_data()
        crop_data = data.get(crop, {})
        disease_data = crop_data.get(disease, None)

        # 2. If not found, try a "fuzzy" match (ignore case and underscores)
        if not disease_data:
            search_key = disease.lower().replace('_', '').replace(' ', '')
            for key, value in crop_data.items():
                normalized_key = key.lower().replace('_', '').replace(' ', '')
                if normalized_key == search_key:
                    disease_data = value
                    break
        
        if disease_data is None:
            # Helpful debug print so you know exactly which key failed
            print(f"⚠️ MISSING DATA: No treatment found for '{disease}' in crop '{crop}'")
            return jsonify({
                'error': f'Disease {disease} not found for {crop}'
            }), 404
        
        return jsonify({
            'crop': crop,
            'disease': disease,
            'treatment': disease_data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@treatments_bp.route('/diseases/list', methods=['GET'])
def list_diseases():
    """
    List all available diseases for all crops
    
    Returns:
        JSON with disease lists organized by crop
    """
    try:
        data = load_treatment_data()
        
        disease_list = {}
        for crop in ['cassava', 'tomato']:
            crop_data = data.get(crop, {})
            disease_list[crop] = [
                {
                    'code': disease_code,
                    'name': disease_info.get('fullName', disease_code),
                    'severity': disease_info.get('severity', 'unknown')
                }
                for disease_code, disease_info in crop_data.items()
            ]
        
        return jsonify({
            'diseases': disease_list
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
