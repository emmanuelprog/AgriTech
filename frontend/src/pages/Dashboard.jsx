import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, History, TrendingUp, Leaf, ArrowRight } from 'lucide-react';
import { analyticsAPI, historyAPI } from '../services/api';
import { useAuthStore } from '../store';
import { getCropEmoji } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, historyRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        historyAPI.getHistory({ limit: 5 })
      ]);
      setStats(dashboardRes.data.dashboard);
      setRecentPredictions(historyRes.data.predictions || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

   // Add this line here
  console.log("Current Stats Value:", stats);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName || user?.username}! 👋
        </h1>
        <p className="text-gray-600">Here's your farm health overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Total Predictions</p>
              <p className="text-3xl font-bold text-blue-900">{stats?.totalPredictions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Healthy Plants</p>
              <p className="text-3xl font-bold text-green-900">{stats?.diseaseStatus?.healthy || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Leaf className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium mb-1">Diseased</p>
              <p className="text-3xl font-bold text-orange-900">{stats?.diseaseStatus?.diseased || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium mb-1">This Week</p>
              <p className="text-3xl font-bold text-purple-900">{stats?.recentWeek || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <History className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/predict" className="block p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">New Prediction</p>
                    <p className="text-sm text-gray-600">Analyze plant disease</p>
                  </div>
                </div>
                <ArrowRight className="text-primary-600" />
              </div>
            </Link>
            <Link to="/history" className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <History className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">View History</p>
                    <p className="text-sm text-gray-600">Past predictions</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-600" />
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Predictions</h3>
          {recentPredictions.length > 0 ? (
            <div className="space-y-3">
              {recentPredictions.map((pred) => (
                <div key={pred.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCropEmoji(pred.crop)}</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{pred.disease}</p>
                      <p className="text-xs text-gray-600">{pred.crop}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {pred.confidence.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No predictions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
