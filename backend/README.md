# 🌾 AgriTech Backend API

Flask-based REST API for crop disease detection using AI/ML models.

## 📋 Features

- ✅ Disease prediction for Cassava and Tomato crops
- ✅ Treatment recommendations database
- ✅ Prediction history with SQLite
- ✅ Batch image processing
- ✅ Model health monitoring
- ✅ CORS-enabled for frontend integration

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip
- Trained TensorFlow models (`.keras` files)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Place your trained models in app/models/
# - cassava_model_final.keras
# - tomato_model_final.keras
# - cassava_class_indices.json
# - tomato_class_indices.json

# Run the application
python run.py
```

The API will start at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── models.py             # Database models
│   ├── routes/
│   │   ├── health.py         # Health check endpoints
│   │   ├── predict.py        # Prediction endpoints
│   │   ├── treatments.py     # Treatment info endpoints
│   │   └── history.py        # History management
│   ├── utils/
│   │   └── model_loader.py   # ML model utilities
│   ├── data/
│   │   └── treatments.json   # Treatment database
│   └── models/               # TensorFlow models (add your trained models here)
├── uploads/                  # Temporary image uploads
├── requirements.txt
├── run.py                    # Application entry point
└── .env.example             # Environment variables template
```

## 🔌 API Endpoints

### Health Check

#### GET `/api/health`
Check if API is running

**Response:**
```json
{
  "status": "healthy",
  "message": "AgriTech API is running"
}
```

#### GET `/api/models/status`
Check status of loaded models

**Response:**
```json
{
  "status": "ok",
  "models": {
    "cassava": {
      "loaded": true,
      "num_classes": 5,
      "classes": ["CBB", "CBSD", "CGM", "CMD", "Healthy"]
    },
    "tomato": {
      "loaded": true,
      "num_classes": 5,
      "classes": [...]
    }
  }
}
```

---

### Prediction

#### POST `/api/predict`
Predict disease from uploaded image

**Request:**
- `Content-Type: multipart/form-data`
- `image`: Image file (PNG, JPG, JPEG)
- `crop`: 'cassava' or 'tomato'

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-03-10T12:00:00",
  "crop": "cassava",
  "prediction": {
    "disease": "CMD",
    "confidence": 94.32,
    "displayName": "Cassava Mosaic Disease (CMD)"
  },
  "allPredictions": [
    {"disease": "CMD", "confidence": 94.32},
    {"disease": "Healthy", "confidence": 3.45},
    {"disease": "CBSD", "confidence": 1.23},
    ...
  ],
  "treatment": {
    "name": "Cassava Mosaic Disease",
    "severity": "very high",
    "symptoms": [...],
    "treatments": [...],
    "prevention": [...],
    "costEstimate": "₦8,000 - ₦20,000 per hectare"
  }
}
```

#### POST `/api/predict/batch`
Predict diseases from multiple images

**Request:**
- `Content-Type: multipart/form-data`
- `images[]`: Array of image files
- `crop`: 'cassava' or 'tomato'

**Response:**
```json
{
  "success": true,
  "crop": "cassava",
  "totalImages": 3,
  "results": [
    {
      "filename": "image1.jpg",
      "disease": "CMD",
      "displayName": "Cassava Mosaic Disease (CMD)",
      "confidence": 94.32,
      "severity": "very high"
    },
    ...
  ]
}
```

---

### Treatment Information

#### GET `/api/treatments/:crop`
Get all treatments for a crop

**Example:** `/api/treatments/cassava`

**Response:**
```json
{
  "crop": "cassava",
  "diseases": {
    "CMD": {...},
    "CBSD": {...},
    ...
  }
}
```

#### GET `/api/treatments/:crop/:disease`
Get treatment for specific disease

**Example:** `/api/treatments/cassava/CMD`

**Response:**
```json
{
  "crop": "cassava",
  "disease": "CMD",
  "treatment": {
    "name": "Cassava Mosaic Disease",
    "severity": "very high",
    "symptoms": [...],
    "treatments": [...],
    "prevention": [...],
    "costEstimate": "₦8,000 - ₦20,000"
  }
}
```

#### GET `/api/diseases/list`
List all diseases for all crops

**Response:**
```json
{
  "diseases": {
    "cassava": [
      {
        "code": "CMD",
        "name": "Cassava Mosaic Disease (CMD)",
        "severity": "very high"
      },
      ...
    ],
    "tomato": [...]
  }
}
```

---

### Prediction History

#### POST `/api/history`
Save prediction to history

**Request Body:**
```json
{
  "crop": "cassava",
  "disease": "CMD",
  "confidence": 94.5,
  "imageFilename": "image.jpg",
  "allPredictions": [...],
  "notes": "Optional notes"
}
```

#### GET `/api/history`
Get prediction history

**Query Parameters:**
- `crop` (optional): Filter by crop
- `limit` (default 50): Number of results
- `offset` (default 0): Pagination offset
- `days` (optional): Get last N days

**Response:**
```json
{
  "success": true,
  "total": 100,
  "limit": 50,
  "offset": 0,
  "predictions": [...]
}
```

#### GET `/api/history/:id`
Get specific prediction

#### PUT `/api/history/:id`
Update prediction (mark treatment as applied, add notes)

**Request Body:**
```json
{
  "treatmentApplied": true,
  "notes": "Applied recommended fungicide"
}
```

#### DELETE `/api/history/:id`
Delete specific prediction

#### GET `/api/history/stats`
Get statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "byCrop": {
      "cassava": 80,
      "tomato": 70
    },
    "recentWeek": 25,
    "topDiseases": [...]
  }
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Predict disease
curl -X POST http://localhost:5000/api/predict \
  -F "image=@/path/to/image.jpg" \
  -F "crop=cassava"

# Get treatment info
curl http://localhost:5000/api/treatments/cassava/CMD

# Get history
curl "http://localhost:5000/api/history?crop=cassava&limit=10"
```

### Using Python

```python
import requests

# Predict disease
with open('image.jpg', 'rb') as img:
    response = requests.post(
        'http://localhost:5000/api/predict',
        files={'image': img},
        data={'crop': 'cassava'}
    )
    print(response.json())
```

---

## 🔧 Configuration

Edit `.env` file:

```env
FLASK_ENV=development          # or production
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///agritech.db
PORT=5000
```

---

## 📦 Model Files

Place your trained models in `app/models/`:

```
app/models/
├── cassava_model_final.keras      # Trained cassava model
├── tomato_model_final.keras       # Trained tomato model
├── cassava_class_indices.json     # Class mappings for cassava
└── tomato_class_indices.json      # Class mappings for tomato
```

**Note:** If models are not found, the API will use mock predictions for testing.

---

## 🚀 Deployment

### Using Gunicorn (Production)

```bash
# Install gunicorn (already in requirements.txt)
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Docker (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
```

---

## 🐛 Troubleshooting

### Models not loading
- Check that model files are in `app/models/`
- Verify file names match exactly
- Check TensorFlow version compatibility

### Database errors
- Delete `agritech.db` to reset database
- Run `python run.py` to recreate tables

### CORS errors
- CORS is enabled for all origins in development
- For production, update CORS settings in `app/__init__.py`

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Ready to integrate with frontend!** 🎨
