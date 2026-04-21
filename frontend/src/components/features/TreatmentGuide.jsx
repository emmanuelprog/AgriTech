import { X, AlertTriangle, CheckCircle, Shield, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TreatmentGuide = ({ treatment, crop, disease, onClose }) => {
  if (!treatment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {treatment.fullName || treatment.name}
            </h2>
            <p className="text-gray-600 mt-1">
              Complete treatment guide for {crop}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {treatment.description && (
            <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-orange-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About This Disease</h3>
                  <p className="text-gray-700">{treatment.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {treatment.costEstimate && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-blue-900">Cost Estimate</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {treatment.costEstimate}
                </p>
              </div>
            )}

            {treatment.effectiveness && (
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-green-900">Effectiveness</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {treatment.effectiveness}
                </p>
              </div>
            )}

            {treatment.timeToRecovery && (
              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-purple-900">Recovery Time</span>
                </div>
                <p className="text-sm font-bold text-purple-600">
                  {treatment.timeToRecovery}
                </p>
              </div>
            )}
          </div>

          {/* Symptoms */}
          {treatment.symptoms && treatment.symptoms.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertTriangle className="text-orange-500" size={20} />
                <span>Symptoms to Look For</span>
              </h3>
              <ul className="space-y-2">
                {treatment.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment Methods */}
          {treatment.treatments && treatment.treatments.length > 0 && (
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="text-primary-600" size={20} />
                <span>Treatment Methods</span>
              </h3>
              <div className="space-y-4">
                {treatment.treatments.map((method, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-primary-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {index + 1}. {method.method}
                      </h4>
                      {method.priority && (
                        <span className={`
                          badge text-xs
                          ${method.priority === 'critical' || method.priority === 'immediate' 
                            ? 'badge-danger' 
                            : method.priority === 'high' 
                            ? 'badge-warning' 
                            : 'badge-info'}
                        `}>
                          {method.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{method.details}</p>
                    {method.timing && (
                      <p className="text-sm text-gray-600">
                        <strong>Timing:</strong> {method.timing}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention */}
          {treatment.prevention && treatment.prevention.length > 0 && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="text-green-600" size={20} />
                <span>Prevention Measures</span>
              </h3>
              <ul className="space-y-2">
                {treatment.prevention.map((measure, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={18} />
                    <span className="text-gray-700">{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {treatment.recommendation && (
            <div className="card bg-yellow-50 border-yellow-200">
              <p className="text-gray-700">
                <strong className="text-yellow-900">Recommendation:</strong>{' '}
                {treatment.recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            Close Guide
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TreatmentGuide;
