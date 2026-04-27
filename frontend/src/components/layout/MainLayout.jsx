import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Camera, History, BarChart3, User, LogOut, Menu, X,
  Leaf, Settings
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    authAPI.logout();
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, auth: true },
    { name: 'Predict', href: '/predict', icon: Camera, auth: false },
    { name: 'History', href: '/history', icon: History, auth: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, auth: true },
    { name: 'Profile', href: '/profile', icon: User, auth: true },
  ];

  const visibleNavigation = navigation.filter(
    item => !item.auth || (item.auth && isAuthenticated)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link 
                to={user ? "/dashboard" : "/"} 
                className="flex items-center space-x-2 ml-2 lg:ml-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Leaf className="text-white" size={24} />
                </div>
                <span className="text-xl font-display font-bold gradient-text hidden sm:block">
                  AgriTech
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                    <User size={18} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <span className="text-lg font-display font-bold gradient-text">
                AgriTech Menu
              </span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={22} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
