import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getMenuSections, getMenuItemsBySection } from '../firebase/canteenService';

const OwnerDashboard = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('breakfast');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        try {
          const sectionsData = await getMenuSections();
          // Convert sectionsData object to array of sections
          const sectionsArray = sectionsData ? Object.entries(sectionsData).map(([id, section]) => ({
            id,
            ...section
          })) : [];
          setSections(sectionsArray);
          
          const itemsData = await getMenuItemsBySection(activeSection);
          // Convert itemsData object to array of items
          const itemsArray = itemsData ? Object.entries(itemsData).map(([id, item]) => ({
            id,
            ...item
          })) : [];
          setMenuItems(prev => ({
            ...prev,
            [activeSection]: itemsArray
          }));
        } catch (error) {
          console.error('Error loading menu data:', error);
          toast.error('Failed to load menu data');
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, activeSection]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const addToCart = (item, newQuantity) => {
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.name === item.name
    );
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: newQuantity
      };
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    toast.success(`Item added to cart`);
  };

  const updateCartQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.name === item.name
    );
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: newQuantity
      };
      setCart(updatedCart);
    }
  };
  
  const getItemQuantity = (item) => {
    const cartItem = cart.find(cartItem => 
      cartItem.id === item.id && cartItem.name === item.name
    );
    return cartItem ? cartItem.quantity : 0;
  };

  useEffect(() => {
    const loadMenuItems = async () => {
      if (!activeSection) return;
      if (menuItems[activeSection]) return;
      
      try {
        const itemsData = await getMenuItemsBySection(activeSection);
        // Convert Firebase object to array of items with IDs
        const itemsArray = itemsData ? Object.entries(itemsData).map(([id, item]) => ({
          id,
          ...item
        })) : [];
        
        setMenuItems(prev => ({
          ...prev,
          [activeSection]: itemsArray
        }));
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast.error('Failed to load menu items');
      }
    };
    
    loadMenuItems();
  }, [activeSection, menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            <p className="text-gray-300">Loading menu...</p>
          </div>
        </nav>
      </div>
    );
  }

  const currentItems = menuItems[activeSection] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header */}
      <header className={`fixed w-full z-30 transition-all duration-300 ${isMenuOpen ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 
                className="text-xl md:text-2xl font-bold text-yellow-600 cursor-pointer hover:text-yellow-700 transition-colors"
                onClick={() => navigate('/')}
              >
                Poornima Canteen (Owner)
              </h1>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={() => navigate('/manage-menu')}
                className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Manage Menu
              </button>
              <button 
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Sign Out
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative ml-2"
              >
                <span className="text-gray-700">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative mr-2"
              >
                <span className="text-gray-700">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-yellow-600 focus:outline-none p-2"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-20 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div 
          className={`fixed inset-0 bg-white/30 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  activeSection === section.id 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsMenuOpen(false);
                }}
              >
                {section.name}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/manage-menu');
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Manage Menu
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 md:pt-24 pb-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-60 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b pb-3">Menu Categories</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-8 text-gray-800 border-b pb-3">
                {sections.find(s => s.id === activeSection)?.name} Menu (Owner View)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentItems.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No items found in this category.
                  </div>
                ) : (
                  currentItems.map((item, index) => {
                    // Create a truly unique key by combining section, item ID, and index
                    const uniqueKey = `${activeSection}-${item.id || 'no-id'}-${index}`;
                    return (
                      <div 
                        key={uniqueKey}
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                          <span className="text-yellow-600 font-medium">₹{item.price?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(item);
                                if (currentQty > 0) {
                                  updateCartQuantity(item, currentQty - 1);
                                }
                              }}
                              className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-l-md transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">
                              {getItemQuantity(item) || 0}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(item);
                                addToCart(item, currentQty + 1);
                              }}
                              className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-r-md transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = getItemQuantity(item);
                              if (currentQty === 0) {
                                addToCart(item, 1);
                              }
                              navigate('/cart');
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors whitespace-nowrap"
                          >
                            {getItemQuantity(item) > 0 ? 'View Cart' : 'Buy Now'}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-2 px-4 text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
        <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
        <span>•</span>
        <Link to="/cancellation-refund-policy" className="hover:underline">Cancellation & Refund Policy</Link>
        <span>•</span>
        <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <span>•</span>
        <Link to="/contact" className="hover:underline">Contact Us</Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
