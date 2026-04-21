import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const [error, setError] = useState(null); // Add an error state

  const loadAnalytics = async () => {
    try {
      const [dashboard, distribution] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getDiseaseDistribution()
      ]);
      setData({ dashboard: dashboard.data.dashboard, distribution: distribution.data.distribution });
    } catch (error) {
      console.error('Analytics error:', error);
      setError("Failed to load analytics. Please check if you are logged in.");
    }
  };

  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;
  if (!data) return <div className="text-center py-12">Loading...</div>;

  const pieData = [
    { name: 'Healthy', value: data.dashboard.diseaseStatus?.healthy || 0, color: '#10b981' },
    { name: 'Diseased', value: data.dashboard.diseaseStatus?.diseased || 0, color: '#f59e0b' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Disease Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Diseases</h3>
          <div className="space-y-3">
            {data.dashboard.topDiseases?.length > 0 ? (data.dashboard.topDiseases?.slice(0, 5).map((disease, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{disease.disease}</span>
                <span className="text-sm font-bold text-primary-600">{disease.count}</span>
              </div>
            ))) : (
            <p className="text-gray-500 text-sm">No disease data recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
