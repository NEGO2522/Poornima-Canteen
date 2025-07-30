import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getMenuSections, getMenuItemsBySection } from '../firebase/canteenService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('breakfast');
  const [cart, setCart] = useState([]);
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
          // Fetch menu sections
          const sectionsData = await getMenuSections();
          setSections(sectionsData);
          
          // Fetch menu items for the active section
          const itemsData = await getMenuItemsBySection(activeSection);
          setMenuItems(prev => ({
            ...prev,
            [activeSection]: itemsData || []
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

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // Load menu items when active section changes
  useEffect(() => {
    const loadMenuItems = async () => {
      if (!activeSection) return;
      
      // If we already have the items for this section, don't fetch again
      if (menuItems[activeSection]) return;
      
      try {
        const itemsData = await getMenuItemsBySection(activeSection);
        setMenuItems(prev => ({
          ...prev,
          [activeSection]: itemsData || []
        }));
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast.error('Failed to load menu items');
      }
    };
    
    loadMenuItems();
  }, [activeSection, menuItems]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Get current section items or empty array if not loaded yet
  const currentItems = menuItems[activeSection] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
          <div className="flex justify-between h-24 items-center">
            <h1 
              className="text-2xl font-bold text-yellow-600 cursor-pointer hover:text-yellow-700 transition-colors"
              onClick={() => navigate('/')}
            >
              Poornima Canteen
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/cart')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <span className="text-gray-700">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Sign Out
              </button>
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-20 p-4 md:hidden border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`px-4 py-3 rounded-lg text-left text-sm font-medium ${
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
          </div>
        </div>
      )}

      <div className="pt-28 pb-16 px-8 sm:px-10 lg:px-12 max-w-7xl mx-auto">
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
                {sections.find(s => s.id === activeSection)?.name} Menu
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No items found in this category.
                  </div>
                ) : (
                  currentItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <span className="bg-yellow-50 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-sm mt-1.5">{item.description}</p>
                      )}
                      <button 
                        onClick={() => addToCart(item)}
                        className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;