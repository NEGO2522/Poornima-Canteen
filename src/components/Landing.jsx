import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Landing = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  const checkAuthAndNavigate = (path) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to the requested path
        navigate(path);
      } else {
        // User is not signed in, redirect to login
        navigate('/login', { state: { from: path } });
      }
    });
  };

  // Handle button clicks
  const handleButtonClick = (action) => {
    switch(action) {
      case 'order':
        checkAuthAndNavigate('/order');
        break;
      case 'menu':
        checkAuthAndNavigate('/menu');
        break;
      default:
        break;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-yellow-400">Poornima</span> Canteen
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Where every meal is prepared with passion and served with a smile
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleButtonClick('order')}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-full transform transition-all duration-300 hover:scale-105"
            >
              Order Now
            </button>
            <button 
              onClick={() => handleButtonClick('menu')}
              className="px-8 py-4 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-bold rounded-full transform transition-all duration-300 hover:scale-105"
            >
              View Menu
            </button>
          </div>
        </div>


      </div>

      {/* Featured Section */}
      <div className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Specialties</h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: 'Fresh Ingredients',
              description: 'We use only the freshest ingredients sourced locally for maximum flavor and nutrition.',
              icon: '🥗'
            },
            {
              title: 'Hygienic Kitchen',
              description: 'Our kitchen maintains the highest standards of cleanliness and food safety.',
              icon: '🧼'
            },
            {
              title: 'Quick Service',
              description: 'Get your food fast without compromising on quality or taste.',
              icon: '⚡'
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-md p-8 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;