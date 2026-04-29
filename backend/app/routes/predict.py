"""
Prediction Routes
Handle disease prediction requests
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime

from app.utils.model_loader import get_model_loader

predict_bp = Blueprint('predict', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_treatment_data():
    """Load treatment recommendations from JSON file"""
    treatment_file = os.path.join('app', 'data', 'treatments.json')
    with open(treatment_file, 'r') as f:
        return json.load(f)

@predict_bp.route('/predict', methods=['POST'])
def predict():
    """
    Predict disease from uploaded image
    
    Expected form data:
        - image: Image file (required)
        - crop: 'cassava' or 'tomato' (required)
    
    Returns:
        JSON with prediction results and treatment recommendations
    """
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        if 'crop' not in request.form:
            return jsonify({'error': 'Crop type not specified'}), 400
        
        file = request.files['image']
        crop = request.form['crop'].lower()
        
        # Validate crop type
        if crop not in ['cassava', 'tomato']:
            return jsonify({'error': 'Invalid crop type. Must be cassava or tomato'}), 400
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg'}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join('uploads', filename)
        file.save(filepath)
        
        try:
            # Get model loader and make prediction
            loader = get_model_loader()

            prediction_result = loader.predict(crop, filepath, top_k=5)
            
            # Load treatment data
            treatment_data = load_treatment_data()
            
            # Get treatment info for top prediction
            top_disease = prediction_result['top_prediction']
            treatment_info = treatment_data.get(crop, {}).get(top_disease, {})
            
            # Build response
            response = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'crop': crop,
                'prediction': {
                    'disease': top_disease,
                    'confidence': prediction_result['top_confidence'],
                    'displayName': treatment_info.get('fullName', top_disease)
                },
                'allPredictions': prediction_result['predictions'],
                'treatment': treatment_info,
                'image': {
                    'filename': filename,
                    'uploadTime': datetime.now().isoformat()
                }
            }
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify(response), 200
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@predict_bp.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict diseases from multiple images
    
    Expected form data:
        - images[]: Multiple image files
        - crop: 'cassava' or 'tomato'
    
    Returns:
        JSON array with prediction results for each image
    """
    try:
        if 'crop' not in request.form:
            return jsonify({'error': 'Crop type not specified'}), 400
        
        crop = request.form['crop'].lower()
        
        if crop not in ['cassava', 'tomato']:
            return jsonify({'error': 'Invalid crop type'}), 400
        
        files = request.files.getlist('images[]')
        
        if not files or len(files) == 0:
            return jsonify({'error': 'No images provided'}), 400
        
        loader = get_model_loader()
        treatment_data = load_treatment_data()
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                # Save temporarily
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
                filename = f"{timestamp}_{filename}"
                filepath = os.path.join('uploads', filename)
                file.save(filepath)
                
                try:
                    # Predict
                    prediction_result = loader.predict(crop, filepath, top_k=3)
                    top_disease = prediction_result['top_prediction']
                    treatment_info = treatment_data.get(crop, {}).get(top_disease, {})
                    
                    results.append({
                        'filename': file.filename,
                        'disease': top_disease,
                        'displayName': treatment_info.get('fullName', top_disease),
                        'confidence': prediction_result['top_confidence'],
                        'severity': treatment_info.get('severity', 'unknown')
                    })
                    
                finally:
                    # Clean up
                    if os.path.exists(filepath):
                        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'crop': crop,
            'totalImages': len(results),
            'results': results
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@predict_bp.route('/warmup', methods=['GET'])
def warmup_ai():
    # Calling get_model_loader() triggers the __init__ and the 
    # model.predict(dummy_image) warmup we added earlier.
    get_model_loader() 
    return jsonify({"success": True, "message": "Models initialized"}), 200
