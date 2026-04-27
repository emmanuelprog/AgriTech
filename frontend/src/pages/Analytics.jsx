import { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { formatDiseaseName, getDiseaseColor } from '../utils/helpers';

// Professional Color Palette
//const COLORS = ['#2D6A4F', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];
const COLORS = [
  '#2D6A4F', // Emerald 500 (Healthy)
  '#f59e0b', // Amber 500 (Early Warning)
  '#ef4444', // Red 500 (Critical/Blight)
  '#8b5cf6', // Violet 500
  '#3b82f6', // Blue 500
  '#ec4899', // Pink 500
];

const getColorForDisease = (index) => COLORS[index % COLORS.length];


const Analytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [dashboard, distribution, trendsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getDiseaseDistribution(),
        analyticsAPI.getTrends()
      ]);

      // CHECK THIS LOG in your browser console (F12 > Console)
      console.log("Raw Trends API Response:", trendsRes.data);
      console.log("Line Data Sample:", trendsRes.data);

      // Format data for Stacked Bar Chart
      const breakdown = trendsRes.data.trends.diseaseBreakdown;
      const formattedStackedData = Object.keys(breakdown).map(date => ({
        date,
        ...breakdown[date]
      }));

      // Identify unique diseases for dynamic Bar components
      const allDiseases = new Set();
      formattedStackedData.forEach(item => {
        Object.keys(item).forEach(key => { if (key !== 'date') allDiseases.add(key); });
      });

      setData({ 
        dashboard: dashboard.data.dashboard || {}, 
        distribution: distribution.data.distribution || {}, 
        lineTrends: trendsRes.data.trends.dailyCounts || [],
        stackedTrends: formattedStackedData || [],
        diseaseKeys: Array.from(allDiseases) || []  
      });
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
          {pieData && pieData.length > 0 && pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            ) : (
            /* No Data Placeholder */
            <div className="text-center">              
              <p className="text-gray-500 font-medium">No disease data yet</p>
              <p className="text-gray-400 text-sm">Make some predictions to see status</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Prediction</h3>
          <div className="space-y-3">
            {data.dashboard.topDiseases?.length > 0 ? (data.dashboard.topDiseases?.slice(0, 5).map((disease, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{formatDiseaseName(disease.disease, disease.crop)}</span>
                <span className="text-sm font-bold text-primary-600">{disease.count}</span>
              </div>
            ))) : (
              <div className="text-center">
                <p className="flex items-center justify-center h-full text-gray-500  ">No disease data recorded yet.</p>
                <p className="text-gray-400 text-sm">Make some predictions to see status</p>
              </div>
            )}
          </div>
        </div>
      </div>
            
      {/* BOTTOM ROW: Trends Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 1: Line Chart (Activity) */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Activity Trend (Predictions)</h3>
          
            {data?.lineTrends && data.lineTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.lineTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => val.split('-').slice(1).join('/')}/>
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2D6A4F" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="flex items-center justify-center h-full text-gray-500">
                  No data Available
                </p>
                <p className="text-gray-400 text-sm">Make some predictions to see trends</p>
              </div>              
            )}
          
        </div>

        {/* Chart 2: Stacked Bar Chart (Breakdown) */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Daily Disease Breakdown</h3>
          
            {data.stackedTrends && data.stackedTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.stackedTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 11, fill: '#6b7280'}} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    tick={{fontSize: 11, fill: '#6b7280'}} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    // Format tooltip names too!
                    formatter={(value, name) => [value, formatDiseaseName(name, "")]} 
                  />
                  
                  {/* Styled Legend */}
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '14px' }}
                    // This function cleans the text in the legend
                    formatter={(value) => <span className="text-gray-700 font-medium">{formatDiseaseName(value, "")}</span>}
                  />

                  {data.diseaseKeys.map((key, i) => (
                    <Bar 
                      key={key} 
                      dataKey={key} 
                      stackId="a" 
                      fill={getDiseaseColor(key)} 
                      radius={i === data.diseaseKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              ) : (
              /* No Data Placeholder */
              <div className="text-center">
                <p className="flex items-center justify-center h-full text-gray-500">
                  No data Available
                </p>
                <p className="text-gray-400 text-sm">Make some predictions to see trends</p>
              </div>
            )}
          
        </div>
      </div>
      
    </div>
  );
};

export default Analytics;
