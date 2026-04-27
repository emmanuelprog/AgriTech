import { useState } from 'react';
import { EyeOff, Eye, User, MapPin, Phone, Edit } from 'lucide-react';
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

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Password change failed');
    } finally {
      setLoading(false);
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

      {/* Security Card */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          <button 
            onClick={() => setIsChangingPassword(!isChangingPassword)} 
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {isChangingPassword && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={passwordData.currentPassword} 
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                className="input pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={8}
                value={passwordData.newPassword} 
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                className="input pr-10" 
              />
            </div>
          </div>

          {/* Confirm New Password */}          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={passwordData.confirmPassword} 
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                className={`input pr-10 ${
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                  ? 'border-red-500 focus:ring-red-500' 
                  : ''
                }`} 
              />
            </div>
            {/* Real-time Error Message */}
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>


          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

        
        {!isChangingPassword && (
          <p className="text-sm text-gray-500">
            Keep your account secure by using a strong password.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
