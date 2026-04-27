"""
Database Models
SQLAlchemy models for users and prediction history
"""

from app import db
from datetime import datetime
from flask_bcrypt import generate_password_hash, check_password_hash

class User(db.Model):
    """User model for authentication"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    farm_size = db.Column(db.Float)  # in hectares
    
    # User role
    role = db.Column(db.String(20), default='farmer')  # farmer, expert, admin
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    predictions = db.relationship('PredictionHistory', backref='user', lazy=True)

    # To support password reset functionality
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'fullName': self.full_name,
            'phone': self.phone,
            'location': self.location,
            'farmSize': self.farm_size,
            'role': self.role,
            'isActive': self.is_active,
            'isVerified': self.is_verified,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class PredictionHistory(db.Model):
    """Store prediction history"""
    
    __tablename__ = 'prediction_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    crop = db.Column(db.String(50), nullable=False)
    disease = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_filename = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional metadata
    all_predictions = db.Column(db.Text)  # JSON string of all predictions
    treatment_applied = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    
    # Location data
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_name = db.Column(db.String(100))
    
    # Field information
    field_name = db.Column(db.String(100))
    field_size = db.Column(db.Float)  # in hectares
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
         # We need to fetch the treatment info here so it's available in History
        from app.routes.treatments import load_treatment_data
        
        data = {
            'id': self.id,
            'userId': self.user_id,
            'crop': self.crop,
            'disease': self.disease,
            'confidence': self.confidence,
            'imageFilename': self.image_filename,
            'timestamp': self.timestamp.isoformat(),
            'allPredictions': json.loads(self.all_predictions) if self.all_predictions else [],
            'treatmentApplied': self.treatment_applied,
            'notes': self.notes,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'locationName': self.location_name,
            'fieldName': self.field_name,
            'fieldSize': self.field_size
        }

        # Add the nested prediction object (Frontend needs this)
        data['prediction'] = {
            'disease': self.disease,
            'confidence': self.confidence
        }
        
        # Fetch the treatment info for this history record
        try:
            treatments = load_treatment_data()
            # We use crop.lower() to ensure it matches your JSON keys
            crop_data = treatments.get(self.crop.lower(), {})
            data['treatment'] = crop_data.get(self.disease)
        except Exception as e:
            print(f"Error loading treatment: {e}")
            data['treatment'] = None

        # NOW return the complete data
        return data
    
    def __repr__(self):
        return f'<Prediction {self.id}: {self.crop} - {self.disease}>'

