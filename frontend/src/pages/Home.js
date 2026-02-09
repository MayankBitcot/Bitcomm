import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, ShoppingBag, Zap, Shield, ArrowRight, Bot } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';

/**
 * Home Page - BitComm Landing
 *
 * Landing page with:
 * - Hero section introducing BitBot voice shopping
 * - Feature highlights
 * - Quick actions to start shopping
 * - Bitcot branding
 */
function Home() {
  const { startVoice, isConnected } = useVoice();

  const features = [
    {
      icon: Mic,
      title: 'Voice-Powered Search',
      description: 'Talk to BitBot naturally. Say "Show me laptops under 50,000" and watch the magic happen.',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get real-time product recommendations with detailed specs and pricing at your fingertips.',
    },
    {
      icon: Shield,
      title: 'Smart Filters',
      description: 'Use natural language to filter by brand, price, category, and more. No complex forms needed.',
    },
  ];

  const quickCommands = [
    'Show me mobile phones',
    'Laptops under ₹50,000',
    'Filter by Samsung',
    'Compare first and third',
    'Add to cart',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Bitcot Orange Theme */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full opacity-20 blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">Powered by BitBot AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to
                <span className="block">
                  Bit<span className="text-yellow-300">Comm</span>
                </span>
              </h1>

              <p className="text-lg text-orange-100 max-w-lg">
                Experience the future of online shopping with <strong>BitBot</strong> - your AI voice assistant.
                Just speak naturally and let BitBot find exactly what you're looking for.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={startVoice}
                  disabled={isConnected}
                  className="inline-flex items-center space-x-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                  <span>{isConnected ? 'BitBot Active' : 'Talk to BitBot'}</span>
                </button>

                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Browse Products</span>
                </Link>
              </div>

              {/* Bitcot badge */}
              <div className="flex items-center space-x-2 pt-4">
                <span className="text-orange-200 text-sm">A product by</span>
                <span className="font-bold text-white">Bitcot Technologies</span>
              </div>
            </div>

            {/* Right content - Voice commands showcase */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">BitBot</h3>
                    <p className="text-xs text-orange-200">Your AI Shopping Assistant</p>
                  </div>
                </div>
                <p className="text-sm text-orange-100 mb-4">Try saying...</p>
                <div className="space-y-3">
                  {quickCommands.map((command, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl px-4 py-3 text-sm border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center space-x-3"
                    >
                      <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>"{command}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shopping Made <span className="text-orange-500">Simple</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No more endless scrolling. Just tell BitBot what you want and watch the magic happen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How <span className="text-orange-500">BitBot</span> Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Click Voice', desc: 'Tap the BitBot button' },
              { step: '2', title: 'Speak', desc: 'Say what you want' },
              { step: '3', title: 'See Results', desc: 'UI updates instantly' },
              { step: '4', title: 'Shop', desc: 'Add to cart & checkout' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-orange-100 mb-8 max-w-lg mx-auto">
                Explore our collection of mobiles, laptops, and accessories.
                Let BitBot guide you to the perfect purchase!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition-colors shadow-lg"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold text-white">BitComm</span>
          </div>
          <p className="text-sm">
            A voice-guided e-commerce demo by <span className="text-orange-500 font-medium">Bitcot Technologies</span>
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Powered by OpenAI Realtime API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
