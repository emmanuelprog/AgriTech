import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, TrendingUp, Droplet, Calendar, Download, History } from 'lucide-react';
import { formatDiseaseName, getConfidenceLevel, getCropEmoji } from '../../utils/helpers';
import ConfidenceMeter from '../ui/ConfidenceMeter';

import { Link } from 'react-router-dom';

const PredictionResult = ({ prediction, onViewTreatment, onSaveHistory, isSaved, hideSaveButton }) => {
  if (!prediction) return null;

  const { crop, prediction: pred, treatment, allPredictions } = prediction;
  const isHealthy = pred.disease === 'Healthy' || pred.disease === 'Tomato_healthy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <div className={`
        card border-2
        ${isHealthy ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}
      `}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              ${isHealthy ? 'bg-green-100' : 'bg-orange-100'}
            `}>
              {isHealthy ? '✅' : '⚠️'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isHealthy ? 'Healthy Plant Detected!' : 'Disease Detected'}
              </h3>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <span>{getCropEmoji(crop)}</span>
                <span className="capitalize">{crop}</span>
              </p>
            </div>
          </div>

          {treatment?.severity && (
            <span className={`
              badge text-sm font-semibold
              ${treatment.severity === 'very high' ? 'badge-danger' : ''}
              ${treatment.severity === 'high' ? 'badge-warning' : ''}
              ${treatment.severity === 'medium' ? 'badge-info' : ''}
              ${treatment.severity === 'low' ? 'badge-success' : ''}
            `}>
              {treatment.severity.toUpperCase()}
            </span>
          )}
        </div>

        {/* Disease Name */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formatDiseaseName(pred.disease)}
          </h2>
          {treatment?.description && (
            <p className="text-gray-600">
              {treatment.description}
            </p>
          )}
        </div>

        {/* Confidence Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Confidence Score
            </span>
            <span className="text-2xl font-bold text-primary-600">
              {pred.confidence.toFixed(1)}%
            </span>
          </div>
          <ConfidenceMeter confidence={pred.confidence} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isHealthy && treatment && (
            <button
              onClick={onViewTreatment}
              className="btn btn-primary flex-1"
            >
              View Treatment Guide
            </button>
          )}

          {/* 2. Systematic Toggle Logic */}
          {!hideSaveButton && (
            <>
            {!isSaved ? (
              <button
                onClick={onSaveHistory}
                className="btn btn-outline flex-1"
              >
                <Download size={18} className="mr-2" />
                Save to History
              </button>
            ):(
              
                <Link to="/history" 
                  className="btn btn-success flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white border-none shadow-md">
                  <History size={18} className="mr-2" />
                  View History
                </Link>              
            )}
            </>
          )}
        </div>
      </div>

      {/* All Predictions */}
      {allPredictions && allPredictions.length > 1 && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-4">
            All Predictions
          </h4>
          <div className="space-y-3">
            {allPredictions.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {formatDiseaseName(item.disease)}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                    {item.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {treatment && !isHealthy && (
        <div className="grid grid-cols-2 gap-4">
          {treatment.costEstimate && (
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Droplet className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Est. Cost</p>
                  <p className="text-sm font-bold text-blue-900">
                    {treatment.costEstimate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {treatment.effectiveness && (
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Effectiveness</p>
                  <p className="text-sm font-bold text-green-900">
                    {treatment.effectiveness}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PredictionResult;
