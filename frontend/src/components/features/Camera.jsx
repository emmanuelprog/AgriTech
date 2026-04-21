import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Camera = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCaptured(true);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setIsCaptured(false);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleUsePhoto = () => {
    // Convert base64 to file
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        onCapture(file);
        toast.success('Photo captured successfully!');
      })
      .catch(err => {
        console.error('Error converting image:', err);
        toast.error('Failed to process image');
      });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 text-white p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Take Photo</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {!isCaptured ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-contain"
            />
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Guideline frame */}
              <div className="absolute inset-4 border-2 border-white/30 rounded-2xl" />
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 border-2 border-primary-400 rounded-full" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-6">
        {!isCaptured ? (
          <div className="flex items-center justify-around max-w-md mx-auto">
            {/* Switch Camera */}
            <button
              onClick={switchCamera}
              className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
            >
              <RotateCcw size={24} />
            </button>

            {/* Capture Button */}
            <button
              onClick={capture}
              className="w-20 h-20 bg-white rounded-full border-4 border-primary-500 hover:scale-110 transition-transform shadow-lg"
            >
              <div className="w-full h-full rounded-full bg-primary-500" />
            </button>

            {/* Spacer for symmetry */}
            <div className="w-14" />
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={retake}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-medium shadow-lg"
            >
              Use Photo
            </button>
          </div>
        )}

        {/* Tips */}
        {!isCaptured && (
          <p className="text-center text-white/70 text-sm mt-4">
            📸 Position the leaf in the center of the frame
          </p>
        )}
      </div>
    </div>
  );
};

export default Camera;
