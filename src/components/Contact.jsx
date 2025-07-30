import React from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  
  const handleBackToMenu = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h1 className="text-3xl font-bold mb-2">
          Contact Us
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last updated on Jul 30th 2025
        </p>

        <div className="mt-6">
          <p className="mb-6">
            You may contact us using the information below:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Merchant Legal entity name:</h3>
              <p>solvers</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Registered Address:</h3>
              <p>200, jain kung, Sodala ,Jaipur Jaipur RAJASTHAN 302006</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Telephone No:</h3>
              <a href="tel:8789925958" className="text-blue-600 hover:underline">8789925958</a>
            </div>
            
            <div>
              <h3 className="font-semibold">E-Mail ID:</h3>
              <a href="mailto:manishop1air@gmail.com" className="text-blue-600 hover:underline">manishop1air@gmail.com</a>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleBackToMenu}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;