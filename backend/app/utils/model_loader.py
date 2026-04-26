"""
Model Loader and Prediction Utilities
Handles loading TensorFlow models and making predictions
"""

import tensorflow as tf
import numpy as np
from PIL import Image
import os
import json

# Get the absolute path to the 'backend' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Point to 'app/models' inside that folder
MODELS_DIR = os.path.join(BASE_DIR, 'app', 'models')

class ModelLoader:
    """Load and manage TensorFlow models for predictions"""
    
    def __init__(self, models_dir=MODELS_DIR):
        self.models_dir = models_dir
        self.models = {}
        self.class_indices = {}
        self.load_all_models()
    
    def load_all_models(self):
        """Load all available models at startup"""
        crops = ['cassava', 'tomato']
        
        for crop in crops:
            try:
                # Try loading Keras model first
                model_path = os.path.join(self.models_dir, f'{crop}_model_final.keras')
                
                if os.path.exists(model_path):
                    print(f"Loading {crop} model from {model_path}")
                    self.models[crop] = tf.keras.models.load_model(model_path)
                    
                    # Load class indices
                    class_indices_path = os.path.join(self.models_dir, f'{crop}_class_indices.json')
                    if os.path.exists(class_indices_path):
                        with open(class_indices_path, 'r') as f:
                            self.class_indices[crop] = json.load(f)
                    else:
                        # Use default class indices if file doesn't exist
                        self.class_indices[crop] = self._get_default_classes(crop)
                    
                    print(f"✓ {crop.title()} model loaded successfully")
                    print(f"  Classes: {list(self.class_indices[crop].keys())}")
                else:
                    print(f"⚠ Warning: {crop} model not found at {model_path}")
                    print(f"  Using mock predictions for {crop}")
                    self.models[crop] = None
                    self.class_indices[crop] = self._get_default_classes(crop)
                    
            except Exception as e:
                print(f"❌ Error loading {crop} model: {e}")
                self.models[crop] = None
                self.class_indices[crop] = self._get_default_classes(crop)
    
    def _get_default_classes(self, crop):
        """Get default class indices for a crop"""
        if crop == 'cassava':
            return {
                '0': 'CBB',
                '1': 'CBSD',
                '2': 'CGM',
                '3': 'CMD',
                '4': 'Healthy'
            }
        elif crop == 'tomato':
            return {
                '0': 'Tomato___Bacterial_spot',
                '1': 'Tomato___Early_blight',
                '2': 'Tomato___Late_blight',
                '3': 'Tomato___Leaf_Mold',
                '4': 'Tomato___healthy'
            }
        return {}
    
    def preprocess_image(self, image_file, target_size=(224, 224)):
        """
        Preprocess image for model prediction
        
        Args:
            image_file: File object or path to image
            target_size: Target size for the model (width, height)
        
        Returns:
            Preprocessed image array
        """
        try:
            # Open image
            if isinstance(image_file, str):
                img = Image.open(image_file)
            else:
                img = Image.open(image_file)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize
            img = img.resize(target_size)
            
            # Convert to array
            img_array = np.array(img)
            
            # Normalize (0-1 range)
            img_array = img_array / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")
    
    def predict(self, crop, image_file, top_k=5):
        """
        Make prediction on an image
        
        Args:
            crop: 'cassava' or 'tomato'
            image_file: Image file to predict
            top_k: Number of top predictions to return
        
        Returns:
            Dictionary with prediction results
        """
        if crop not in self.models:
            raise ValueError(f"Model for {crop} not available")
        
        # Preprocess image
        img_array = self.preprocess_image(image_file)
        
        # If model is None (mock mode), return mock predictions
        if self.models[crop] is None:
            return self._mock_prediction(crop, top_k)
        
        # Make prediction
        predictions = self.models[crop].predict(img_array, verbose=0)
        
        # Get top K predictions
        top_indices = np.argsort(predictions[0])[::-1][:top_k]
        
        # Map indices to class names
        idx_to_class = {int(v): k for k, v in self.class_indices[crop].items()}
        
        results = []
        for idx in top_indices:
            class_name = idx_to_class.get(idx, f'Unknown_{idx}')
            confidence = float(predictions[0][idx]) * 100
            
            results.append({
                'disease': class_name,
                'confidence': round(confidence, 2)
            })
        
        return {
            'crop': crop,
            'predictions': results,
            'top_prediction': results[0]['disease'],
            'top_confidence': results[0]['confidence']
        }
    
    def _mock_prediction(self, crop, top_k=5):
        """
        Generate mock predictions for testing when model is not available
        """
        classes = list(self.class_indices[crop].values())
        
        # Generate random but realistic-looking predictions
        confidences = np.random.dirichlet(np.ones(len(classes))) * 100
        sorted_indices = np.argsort(confidences)[::-1]
        
        results = []
        for idx in sorted_indices[:top_k]:
            results.append({
                'disease': classes[idx],
                'confidence': round(float(confidences[idx]), 2)
            })
        
        return {
            'crop': crop,
            'predictions': results,
            'top_prediction': results[0]['disease'],
            'top_confidence': results[0]['confidence'],
            'note': 'Using mock predictions - model not loaded'
        }


# Global model loader instance
model_loader = None

def get_model_loader():
    """Get or create model loader instance"""
    global model_loader
    if model_loader is None:
        model_loader = ModelLoader()


        # --- ADD WARMUP LOGIC HERE ---
        print("🤖 Loading AI model...")
        print("🔥 Warming up TensorFlow models...")
        dummy_image = np.zeros((1, 224, 224, 3)) # Blank "fake" image
        for crop, model in model_loader.models.items():
            if model is not None:
                # Run a fake prediction so the first real one is instant
                model.predict(dummy_image, verbose=0)
        print("✅ Models are warm and ready for instant prediction!")


    return model_loader
