import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, Camera, TrendingUp, Shield, Zap, Users, 
  ArrowRight, CheckCircle, Smartphone
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Camera,
      title: 'Instant Detection',
      description: 'Upload or capture plant images for immediate disease analysis',
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Advanced machine learning models with 90%+ accuracy',
    },
    {
      icon: Shield,
      title: 'Expert Treatments',
      description: 'Detailed treatment recommendations from agricultural experts',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your farm health with analytics and insights',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on any device, anywhere',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join thousands of farmers improving crop yields',
    },
  ];

  const stats = [
    { value: '10+', label: 'Diseases Detected' },
    { value: '90%+', label: 'Accuracy Rate' },
    { value: '5000+', label: 'Farmers Helped' },
    { value: '24/7', label: 'Available' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                AgriTech
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  AI-Powered Crop Disease Detection
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
                Protect Your Crops with{' '}
                <span className="gradient-text">AI Technology</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Detect crop diseases instantly using your smartphone. Get expert treatment 
                recommendations and improve your harvest with AgriTech.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/predict"
                  className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-primary-500/30"
                >
                  <Camera className="mr-2" size={22} />
                  Try It Now - Free
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline text-lg px-8 py-4"
                >
                  Create Account
                  <ArrowRight className="ml-2" size={22} />
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                ✓ No credit card required  ✓ Works on any device  ✓ Instant results
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Protect Your Crops
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features designed specifically for farmers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-primary-600" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Capture Image',
                description: 'Take a photo of the affected plant leaf using your phone camera',
              },
              {
                step: '2',
                title: 'Get Analysis',
                description: 'Our AI instantly analyzes the image and detects any diseases',
              },
              {
                step: '3',
                title: 'Apply Treatment',
                description: 'Follow expert recommendations to treat and protect your crops',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-12 text-gray-300" size={24} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Protect Your Crops?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of farmers using AI to improve their harvest
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/predict"
              className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-xl font-display font-bold">
                AgriTech
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 AgriTech. Built with ❤️ for African farmers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
