"""
Model Loader and Prediction Utilities
Handles loading TensorFlow models and making predictions
"""

import tensorflow as tf
import numpy as np
from PIL import Image
import os
import json
import gc


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
        self.current_crop = None
    
    def get_model(self, crop):
        """Lazy load model only when needed to save RAM"""
        
        # 1. If requested model is already active, return it
        if self.current_crop == crop and self.models.get(crop):
            return self.models[crop], self.class_indices[crop]

        # 2. CLEAR MEMORY: Delete previous model before loading new one
        if self.current_crop is not None:
            print(f"♻️ Memory Management: Clearing {self.current_crop} to free RAM...")
            self.models = {}
            self.class_indices = {}
            tf.keras.backend.clear_session()
            gc.collect()

        # 3. LOAD THE REQUESTED MODEL
        try:
            model_path = os.path.join(self.models_dir, f'{crop}_model_final.keras')
            print(f"🤖 Loading {crop} model into memory...")
            
            if os.path.exists(model_path):
                self.models[crop] = tf.keras.models.load_model(model_path)
                self.current_crop = crop
                
                # Load indices
                idx_path = os.path.join(self.models_dir, f'{crop}_class_indices.json')
                if os.path.exists(idx_path):
                    with open(idx_path, 'r') as f:
                        self.class_indices[crop] = json.load(f)
                else:
                    self.class_indices[crop] = self._get_default_classes(crop)
                
                print(f"✅ {crop.title()} ready.")
                return self.models[crop], self.class_indices[crop]
            
            else:
                print(f"⚠ Warning: {crop} model not found. Using mock.")
                return None, self._get_default_classes(crop)

        except Exception as e:
            print(f"❌ Error during lazy load: {e}")
            return None, self._get_default_classes(crop)
    
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

        # 1. Ensure the correct model is loaded first
        model, class_indices = self.get_model(crop)

        # 2. Check if model exists (either real or mock-ready)
        if crop not in self.class_indices:
            raise ValueError(f"Class indices for {crop} not available")
        
        # Preprocess image
        img_array = self.preprocess_image(image_file)
        
        # If model is None (mock mode), return mock predictions
        if model is None:
            return self._mock_prediction(crop, top_k)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Get top K predictions
        top_indices = np.argsort(predictions[0])[::-1][:top_k]
        
        # Map indices to class names
        idx_to_class = {int(v): k for k, v in class_indices.items()}
        
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
model_loader_instance = None

def get_model_loader():
    """Get or create model loader instance"""
    global model_loader_instance
    if model_loader_instance is None:
        model_loader_instance = ModelLoader()
        print("🤖 AI System initialized (Lazy Loading enabled)")

    return model_loader_instance
