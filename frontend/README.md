# 🌾 AgriTech Frontend

Modern, beautiful React frontend for AI-powered crop disease detection.

## ✨ Features

- 📸 **Camera Integration** - Real-time image capture using device camera
- 🖼️ **Drag & Drop Upload** - Easy image upload with preview
- 🤖 **Real-time AI Predictions** - Instant disease detection results
- 📊 **Analytics Dashboard** - Visualize farm health data
- 📱 **Mobile Optimized** - Perfect on any device
- 🎨 **Beautiful UI** - Modern, clean design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for lightning-fast builds
- 🔐 **Authentication** - Secure user login and registration
- 📈 **History Tracking** - Save and review past predictions
- 🌍 **Offline Ready** - PWA capabilities (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Navigate to frontend directory
cd agritech_frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will start at `http://localhost:3000`

## 📁 Project Structure

```
agritech_frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── MainLayout.jsx       # Main app layout with navbar
│   │   ├── features/
│   │   │   ├── Camera.jsx           # Webcam integration
│   │   │   ├── ImageUpload.jsx      # Drag & drop upload
│   │   │   ├── PredictionResult.jsx # Results display
│   │   │   └── TreatmentGuide.jsx   # Treatment modal
│   │   └── ui/
│   │       └── ConfidenceMeter.jsx  # Confidence visualization
│   ├── pages/
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Login.jsx                # Login page
│   │   ├── Register.jsx             # Registration page
│   │   ├── Dashboard.jsx            # User dashboard
│   │   ├── Predict.jsx              # Main prediction page
│   │   ├── History.jsx              # Prediction history
│   │   ├── Analytics.jsx            # Analytics dashboard
│   │   ├── Profile.jsx              # User profile
│   │   └── NotFound.jsx             # 404 page
│   ├── services/
│   │   └── api.js                   # API integration (Axios)
│   ├── store/
│   │   └── index.js                 # State management (Zustand)
│   ├── utils/
│   │   └── helpers.js               # Utility functions
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── public/                          # Static assets
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Colors
- **Primary:** `#2D6A4F` (Forest Green)
- **Secondary:** `#52B788` (Light Green)
- **Accent:** `#F77F00` (Warm Orange)

### Typography
- **Display:** Poppins (Headings)
- **Body:** Work Sans (Content)
- **Mono:** JetBrains Mono (Code/Data)

### Components
All components use custom CSS classes defined in `index.css`:

- `.btn` - Buttons with variants (primary, secondary, outline, ghost)
- `.card` - Container cards
- `.input` - Form inputs
- `.badge` - Status badges
- `.spinner` - Loading indicator

## 🔌 API Integration

The frontend connects to the backend API using Axios. Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### API Services

```javascript
import { authAPI, predictionAPI, historyAPI, analyticsAPI } from './services/api';

// Authentication
await authAPI.login({ email, password });
await authAPI.register(userData);

// Predictions
await predictionAPI.predict(formData);

// History
await historyAPI.getHistory();
await historyAPI.saveHistory(data);

// Analytics
await analyticsAPI.getDashboard();
await analyticsAPI.getTrends();
```

## 📱 Pages Overview

### Public Pages

#### Home (`/`)
- Beautiful landing page
- Feature highlights
- Call-to-action buttons
- Mobile responsive

#### Login (`/login`)
- Email/password authentication
- Auto token refresh
- Error handling

#### Register (`/register`)
- User registration form
- Profile setup
- Validation

### Protected Pages (Require Login)

#### Dashboard (`/dashboard`)
- Overview statistics
- Quick actions
- Recent predictions
- Visual charts

#### Predict (`/predict`)
- Crop selection (Cassava/Tomato)
- Camera capture OR image upload
- Real-time analysis
- Treatment recommendations
- Save to history

#### History (`/history`)
- Past predictions list
- Filter by crop
- Delete functionality
- Detailed view

#### Analytics (`/analytics`)
- Disease distribution charts
- Trend analysis
- Performance metrics
- Export reports

#### Profile (`/profile`)
- User information
- Edit profile
- Account settings

## 🎯 Key Features Explained

### Camera Integration

Uses `react-webcam` for real-time camera access:

```jsx
import Camera from './components/features/Camera';

<Camera
  onCapture={handleCapturedImage}
  onClose={handleClose}
/>
```

Features:
- Front/back camera switching
- Live preview
- Capture with guidelines
- Image compression

### Image Upload

Drag & drop with preview:

```jsx
import ImageUpload from './components/features/ImageUpload';

<ImageUpload
  onImageSelect={handleImage}
  maxSize={5} // MB
/>
```

Features:
- Drag and drop
- Click to browse
- File validation
- Image preview
- Size limits

### Prediction Results

Beautiful results display:

```jsx
import PredictionResult from './components/features/PredictionResult';

<PredictionResult
  prediction={data}
  onViewTreatment={showTreatment}
  onSaveHistory={saveToHistory}
/>
```

Shows:
- Disease name
- Confidence score
- Severity level
- All predictions
- Treatment button

### Treatment Guide

Comprehensive treatment information:

```jsx
import TreatmentGuide from './components/features/TreatmentGuide';

<TreatmentGuide
  treatment={treatmentData}
  crop="cassava"
  disease="CMD"
  onClose={closeModal}
/>
```

Displays:
- Symptoms
- Treatment methods (prioritized)
- Prevention measures
- Cost estimates
- Effectiveness rates

## 🔐 State Management

Using Zustand for lightweight state:

```javascript
import { useAuthStore, usePredictionStore, useHistoryStore } from './store';

// Auth state
const { user, isAuthenticated, setAuth, logout } = useAuthStore();

// Prediction state
const { currentPrediction, isLoading, setPrediction } = usePredictionStore();

// History state
const { history, setHistory, addToHistory } = useHistoryStore();
```

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration (optional)
VITE_APP_NAME=AgriTech
VITE_APP_VERSION=1.0.0
```

## 📦 Dependencies

### Core
- **React 18** - UI library
- **React Router 6** - Routing
- **Vite** - Build tool

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Features
- **React Webcam** - Camera access
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization
- **date-fns** - Date formatting

## 🎨 Customization

### Modify Theme

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_COLOR',
      },
    },
  },
}
```

### Add Custom Styles

Add to `src/index.css`:

```css
@layer components {
  .your-custom-class {
    @apply bg-blue-500 text-white;
  }
}
```

## 📱 Mobile Optimization

The app is fully responsive:

- Mobile-first design approach
- Touch-friendly buttons
- Optimized images
- Fast loading times
- Works offline (with service worker)

## 🚀 Deployment

### Build

```bash
npm run build
```

Output: `dist/` folder

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploy to Netlify

```bash
# Build
npm run build

# Drag & drop dist/ folder to Netlify
```

### Environment Variables (Production)

Set in hosting platform:
```
VITE_API_URL=https://your-backend.railway.app/api
```

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS (required for camera on production)
- Try different browser

### API connection fails
- Verify backend is running
- Check VITE_API_URL in .env
- Check CORS settings in backend

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for African farmers** 🌾
