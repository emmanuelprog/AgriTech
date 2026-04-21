import { useState } from 'react';
import { User, MapPin, Phone, Edit } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    location: user?.location || '',
    farmSize: user?.farmSize || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(formData);
      updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="btn btn-outline">
            <Edit size={18} className="mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <User size={20} />
              <span>{user?.fullName || 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Phone size={20} />
              <span>{user?.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <MapPin size={20} />
              <span>{user?.location || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
