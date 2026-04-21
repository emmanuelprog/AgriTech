import { motion } from 'framer-motion';
import { getConfidenceLevel } from '../../utils/helpers';

const ConfidenceMeter = ({ confidence }) => {
  const level = getConfidenceLevel(confidence);
  
  const getColor = () => {
    switch (level) {
      case 'very_high':
        return 'from-green-500 to-green-600';
      case 'high':
        return 'from-blue-500 to-blue-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'very_high':
        return 'Very High';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${getColor()}`}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">{getLabel()} Confidence</span>
        <span className="text-gray-500">
          {confidence < 50 && '⚠️ Low confidence - consider retaking photo'}
        </span>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
