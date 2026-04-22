import { useState, useEffect } from 'react';
import { Trash2, Filter, X } from 'lucide-react';
import { historyAPI } from '../services/api';
import { formatTimeAgo, getCropEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';

import PredictionResult from '../components/features/PredictionResult';
import TreatmentGuide from '../components/features/TreatmentGuide';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showTreatment, setShowTreatment] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      const params = filter !== 'all' ? { crop: filter } : {};
      const response = await historyAPI.getHistory(params);
      setHistory(response.data.predictions || []);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prediction?')) return;
    try {
      await historyAPI.deleteHistory(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-40">
          <option value="all">All Crops</option>
          <option value="cassava">Cassava</option>
          <option value="tomato">Tomato</option>
        </select>
      </div>

      {history.length > 0 ? (
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item.id} 
              onClick={() => {

                console.log("Selected Item Data:", item); 
                // 1. Manually shape the data to match PredictionResult's expectations
                const formattedForModal = {
                  ...item,
                  prediction: {
                    disease: item.disease,
                    confidence: item.confidence
                  },
                  treatment: item.treatment,
                  // Also ensure the image object exists if the component uses it
                  image: {
                    filename: item.imageFilename
                  }
                };
                
                setSelectedPrediction(formattedForModal);
              }}  // 1. Click to open modal
              className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary-500">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{getCropEmoji(item.crop)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.disease}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.crop}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(item.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-primary-600">{item.confidence.toFixed(1)}%</span>
                  <button onClick={(e) => {
                      e.stopPropagation(); // 2. Prevents the modal from opening when deleting
                      handleDelete(item.id)
                      }} 
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No predictions yet</div>
      )}

      {/* 3. MODAL FOR PREDICTION DETAILS */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 shadow-2xl">
            <button 
              onClick={() => setSelectedPrediction(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
            >
              <X size={24} />
            </button>

            {/* Reuse the component you already built! */}
            <PredictionResult 
              prediction={selectedPrediction} 
              isSaved={false} 
              hideSaveButton={true} 
              onViewTreatment={() => setShowTreatment(true)}
            />

            {/* Sticky Footer with Close Button */}
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setSelectedPrediction(null)}
                className="btn btn-outline w-full py-3 font-semibold text-gray-700 hover:bg-gray-100 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TREATMENT GUIDE MODAL */}
      {showTreatment && selectedPrediction && (
        <TreatmentGuide
          treatment={selectedPrediction.treatment}
          crop={selectedPrediction.crop}
          disease={selectedPrediction.disease}
          onClose={() => setShowTreatment(false)}
        />
      )}

    </div>
  );
};

export default History;
