import { useState, useEffect } from 'react';
import { Trash2, Filter } from 'lucide-react';
import { historyAPI } from '../services/api';
import { formatTimeAgo, getCropEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

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
            <div key={item.id} className="card hover:shadow-md transition-shadow">
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
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600">
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
    </div>
  );
};

export default History;
