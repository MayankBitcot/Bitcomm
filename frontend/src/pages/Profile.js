import React from 'react';
import { User, Mail, Phone, MapPin, Settings, ShoppingBag, Heart, Clock, Bot } from 'lucide-react';

/**
 * Profile Page - BitComm
 *
 * Dummy profile page to demonstrate multi-page navigation.
 * Voice commands via BitBot can navigate here with "go to profile" or "open my account"
 */
function Profile() {
  // Dummy user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    memberSince: 'January 2024',
  };

  const stats = [
    { icon: ShoppingBag, label: 'Orders', value: '12' },
    { icon: Heart, label: 'Wishlist', value: '8' },
    { icon: Clock, label: 'Reviews', value: '5' },
  ];

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', description: 'Track and manage your orders' },
    { icon: Heart, label: 'Wishlist', description: 'Products you\'ve saved for later' },
    { icon: MapPin, label: 'Addresses', description: 'Manage delivery addresses' },
    { icon: Settings, label: 'Settings', description: 'Account preferences and security' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
          />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{user.address}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              BitComm member since {user.memberSince}
            </p>
          </div>

          {/* Edit button */}
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-200 p-6 text-center"
          >
            <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <h2 className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-900">
          Account Settings
        </h2>
        <div className="divide-y divide-gray-100">
          {menuItems.map(({ icon: Icon, label, description }) => (
            <button
              key={label}
              className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Voice tip */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 text-center border border-orange-200">
        <p className="text-orange-800">
          <span className="font-medium">BitBot tip:</span> Say "go to products" or "show me laptops" to start shopping!
        </p>
      </div>
    </div>
  );
}

export default Profile;
