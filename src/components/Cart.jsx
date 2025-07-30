import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    phone: '',
    address: '',
    specialInstructions: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        // Pre-fill name if available
        setDeliveryDetails(prev => ({
          ...prev,
          name: currentUser.displayName || ''
        }));
      }
    });

    return () => unsubscribe();
  }, [navigate]);



  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = () => {
    // Process the order
    console.log('Order Placed:', {
      userId: user?.uid,
      items: cart,
      total: calculateTotal()
    });
    
    // Clear cart
    setCart([]);
    localStorage.removeItem('canteenCart');
    
    // Show success message
    toast.success('Order placed successfully!');
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
          <div className="text-6xl mb-6 text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0h10m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2h.01v.01H9v-.01z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Order</h1>
          <p className="mt-2 text-gray-600">Review and place your order</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Order Summary
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center">
                    <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-yellow-600 font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                        className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-l-md transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                      <button 
                        onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                        className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-r-md transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-20 text-right font-semibold text-gray-900">
                      ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <p>Total Amount</p>
              <p className="text-yellow-600">₹{calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleCheckout}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all"
          >
            Place Order - ₹{calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;