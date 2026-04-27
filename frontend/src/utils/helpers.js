import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
  return format(new Date(date), formatStr);
};

// Format relative time (e.g., "2 hours ago")
export const formatTimeAgo = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Format relative date (e.g., "Today at 3:30 PM")
export const formatRelativeDate = (date) => {
  return formatRelative(new Date(date), new Date());
};

// Get confidence level
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 90) return 'very_high';
  if (confidence >= 70) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
};

// Get confidence color
export const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 70) return 'text-blue-600';
  if (confidence >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

// Get confidence background
export const getConfidenceBg = (confidence) => {
  if (confidence >= 90) return 'bg-green-100';
  if (confidence >= 70) return 'bg-blue-100';
  if (confidence >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
};

// Get severity color
export const getSeverityColor = (severity) => {
  const colors = {
    'very high': 'text-red-600 bg-red-100',
    'high': 'text-orange-600 bg-orange-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'low': 'text-blue-600 bg-blue-100',
    'none': 'text-green-600 bg-green-100',
  };
  return colors[severity] || colors.medium;
};

// Format disease name for display
export const formatDiseaseName = (disease, crop = '') => {
  if (!disease) return '';

  const diseaseLower = disease.toLowerCase();
  const cropLower = crop.toLowerCase();

  // Systematic check for Cassava Healthy
  if (diseaseLower === 'healthy' && (cropLower === 'cassava'|| !crop)) {
    return 'Cassava Healthy';
  }

  // Remove crop prefix if present (e.g., "Tomato___" -> "")
  const cleaned = disease.replace(/^(Tomato|Cassava)___/i, '');
  
  // Replace underscores with spaces
  const spaced = cleaned.replace(/_/g, ' ');
  
  // Capitalize each word
  return spaced
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getDiseaseColor = (key) => {
  const name = key.toLowerCase();
  if (name.includes('healthy')) return '#10b981'; // Always Green for Healthy
  if (name.includes('blight')) return '#ef4444';  // Red for Blight
  if (name.includes('spot')) return '#f59e0b';    // Orange for Spots
  
  // Default palette for others
  const defaults = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4'];
  return defaults[Math.abs(key.length) % defaults.length];
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Compress image before upload
export const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};

// Download file
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Get location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if mobile device
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get crop emoji
export const getCropEmoji = (crop) => {
  const emojis = {
    cassava: '🌿',
    tomato: '🍅',
  };
  return emojis[crop] || '🌱';
};

// Get crop color
export const getCropColor = (crop) => {
  const colors = {
    cassava: 'bg-green-500',
    tomato: 'bg-red-500',
  };
  return colors[crop] || 'bg-gray-500';
};

// Calculate percentage
export const percentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};
