import { useState } from 'react';
import { CheckCircle, ArrowRight, Camera as CameraIcon, Upload, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import Camera from '../components/features/Camera';
import ImageUpload from '../components/features/ImageUpload';
import PredictionResult from '../components/features/PredictionResult';
import TreatmentGuide from '../components/features/TreatmentGuide';

import { predictionAPI, historyAPI } from '../services/api';
import { usePredictionStore, useAuthStore } from '../store';
import { getCropEmoji } from '../utils/helpers';

const Predict = () => {
  //const [isSaved, setIsSaved] = useState(false); // Add this at the top with other states

  const [selectedCrop, setSelectedCrop] = useState('cassava');
  const [captureMode, setCaptureMode] = useState(null); // 'camera' or 'upload'
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showTreatment, setShowTreatment] = useState(false);
  
  const { currentPrediction, isLoading, setPrediction, setLoading, setError, setIsSaved, isSaved } = usePredictionStore();
  const { isAuthenticated } = useAuthStore();

  const crops = [
    { id: 'cassava', name: 'Cassava', emoji: '🌿' },
    { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  ];

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setCaptureMode(null);
  };

  const handleCameraCapture = (file) => {
    setSelectedImage(file);
    setShowCamera(false);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

     // Give React a tiny "breath" to re-render the UI before starting the fetch
    await new Promise(resolve => setTimeout(resolve, 100));


    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('crop', selectedCrop);

      const response = await predictionAPI.predict(formData);
      const result = response.data;
      setPrediction(result);

      // --- CHECK IF ALREADY SAVED ---
      // Fetch recent history to see if this exact result was just saved
      const historyRes = await historyAPI.getHistory({ limit: 10 });
      const alreadySaved = historyRes.data.predictions.some(p => 
        p.disease === result.prediction.disease && 
        p.crop === result.crop &&
        // Optional: check if timestamp is very recent (within last 1 hour)
        (new Date() - new Date(p.timestamp)) < 3600000 
      );
      
      setIsSaved(alreadySaved);
      toast.success('Analysis complete!');

    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.response?.data?.error || 'Failed to analyze image');
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save predictions');
      return;
    }

    try {
      const historyData = {
        crop: currentPrediction.crop,
        disease: currentPrediction.prediction.disease,
        confidence: currentPrediction.prediction.confidence,
        imageFilename: currentPrediction.image?.filename,
        allPredictions: currentPrediction.allPredictions,
      };

      await historyAPI.saveHistory(historyData);
      setIsSaved(true); // <--- Mark as saved

      toast.success('Saved to history successfully!');
    } catch (error) {
      console.error('Save history error:', error);
      toast.error('Failed to save to history');
    }
  };

  const handleNewPrediction = () => {
    setIsSaved(false);
    setSelectedImage(null);
    setPrediction(null);
    setCaptureMode(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Disease Detection
        </h1>
        <p className="text-gray-600">
          Upload or capture a plant image to detect diseases instantly
        </p>
      </div>

      {!currentPrediction ? (
        <>
          {/* Crop Selection */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              1. Select Crop Type
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${selectedCrop === crop.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{crop.emoji}</div>
                  <div className="font-semibold text-gray-900">{crop.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Capture/Upload */}
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              2. Capture or Upload Image
            </h3>

            {!selectedImage && !captureMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowCamera(true)}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all group"
                >
                  <CameraIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-primary-500" />
                  <div className="font-semibold text-gray-900">Use Camera</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Take a photo now
                  </div>
                </button>

                <button
                  onClick={() => setCaptureMode('upload')}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all group"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-primary-500" />
                  <div className="font-semibold text-gray-900">Upload Image</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Choose from gallery
                  </div>
                </button>
              </div>
            )}

            {captureMode === 'upload' && (
              <ImageUpload onImageSelect={handleImageSelect} />
            )}
          </div>

          {/* Analyze Button */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="btn btn-primary w-full py-4 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-3" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Leaf className="mr-2" size={24} />
                    Analyze Plant
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <>
          {/* Results */}
          <PredictionResult
            prediction={currentPrediction}
            onViewTreatment={() => setShowTreatment(true)}
            onSaveHistory={handleSaveToHistory}
            isSaved={isSaved} // <--- to help change the display to view History after saving to history
          />

          {/* New Section: Show this only after user clicks Save */}
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center text-green-700">
                <CheckCircle size={20} className="mr-2" />
                <span className="text-blue-700 font-medium">Prediction added to your records!</span>
              </div>
              <Link 
                to="/dashboard" 
                className="btn btn-primary btn-sm flex items-center"
              >
                View Dashboard
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </motion.div>
          )}

          {/* New Prediction Button */}
          <div className="mt-6">
            <button
              onClick={handleNewPrediction}
              className="btn btn-outline w-full"
            >
              Analyze Another Image
            </button>
          </div>
        </>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <Camera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Treatment Guide Modal */}
      {showTreatment && currentPrediction?.treatment && (
        <TreatmentGuide
          treatment={currentPrediction.treatment}
          crop={currentPrediction.crop}
          disease={currentPrediction.prediction.disease}
          onClose={() => setShowTreatment(false)}
        />
      )}
    </div>
  );
};

export default Predict;
