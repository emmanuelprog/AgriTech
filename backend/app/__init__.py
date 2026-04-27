"""
AgriTech Backend - Flask Application
AI-powered crop disease detection API with authentication
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os


# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
limiter = Limiter(
    key_func=get_remote_address,
    enabled=False,  # Disable rate limiting for now (set to True in production)
    default_limits=["200 per day", "500 per hour"],
    storage_uri="memory://"
)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)


    # Updates for PostgresSQL connection
    # Get the Database URL from Render (defaults to SQLite for local dev)
    db_url = os.getenv('DATABASE_URL', 'sqlite:///agritech.db')

    # 2. FIX: Render uses 'postgres://', SQLAlchemy needs 'postgresql://'
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    #app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///agritech.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days 

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    
    # Show Errors in Terminal
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.config['TRAP_HTTP_EXCEPTIONS'] = True

    
    # Initialize extensions
    #CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000",
                                                "http://localhost:5000",
                                                "https://agri-tech-pink.vercel.app"]}}, supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.predict import predict_bp
    from app.routes.health import health_bp
    from app.routes.history import history_bp
    from app.routes.treatments import treatments_bp
    from app.routes.analytics import analytics_bp
    from app.routes.users import users_bp 
    
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(treatments_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    
    # Create database tables
    with app.app_context():        
        db.create_all()
        print("✓ Database tables created successfully")
    
    return app
