import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { 
  getMenuSections, 
  getMenuItemsBySection, 
  addMenuItem, 
  deleteMenuItem,
  addMenuSection,
  deleteMenuSection 
} from '../firebase/canteenService';
import { FaTrash, FaPlus, FaEdit, FaTimes, FaSave, FaBars, FaPlusCircle } from 'react-icons/fa';

const ManagementPage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (activeSection) {
      loadMenuItems(activeSection);
    }
  }, [activeSection]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const sectionsData = await getMenuSections();
      
      let sectionsList = [];
      if (sectionsData) {
        sectionsList = Object.entries(sectionsData).map(([id, section]) => ({
          id,
          ...section
        }));
      }
      
      setSections(sectionsList);
      
      if (sectionsList.length > 0 && !activeSection) {
        setActiveSection(sectionsList[0].id);
      }
    } catch (error) {
      toast.error('Failed to load menu sections');
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (sectionId) => {
    if (!sectionId) return;
    
    try {
      setLoading(true);
      const itemsData = await getMenuItemsBySection(sectionId);
      
      let items = [];
      if (itemsData) {
        items = Object.entries(itemsData).map(([id, item]) => ({
          id,
          ...item
        }));
      }
      
      setMenuItems(prev => ({
        ...prev,
        [sectionId]: items
      }));
    } catch (error) {
      toast.error(`Failed to load items for section ${sectionId}`);
      console.error(`Error loading items for section ${sectionId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await addMenuItem(activeSection, {
        name: newItem.name.trim(),
        price: parseFloat(newItem.price)
      });
      
      await loadMenuItems(activeSection);
      setNewItem({ name: '', price: '' });
      toast.success('Item added successfully');
    } catch (error) {
      toast.error('Failed to add item');
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !newItem.name || !newItem.price) return;

    try {
      setLoading(true);
      await addMenuItem(activeSection, {
        id: editingItem.id,
        name: newItem.name.trim(),
        price: parseFloat(newItem.price)
      });
      
      await loadMenuItems(activeSection);
      setEditingItem(null);
      setNewItem({ name: '', price: '' });
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
      console.error('Error updating item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      await deleteMenuItem(activeSection, itemId);
      await loadMenuItems(activeSection);
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast.error('Please enter a section name');
      return;
    }

    try {
      setLoading(true);
      await addMenuSection({
        name: newSectionName.trim(),
        order: sections.length
      });
      
      setNewSectionName('');
      setShowAddSection(false);
      await loadSections();
      toast.success('Section added successfully');
    } catch (error) {
      toast.error('Failed to add section');
      console.error('Error adding section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section? This will also delete all items in it.')) return;

    try {
      setLoading(true);
      await deleteMenuSection(sectionId);
      await loadSections();
      toast.success('Section deleted successfully');
    } catch (error) {
      toast.error('Failed to delete section');
      console.error('Error deleting section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString()
    });
    setShowMobileForm(true);
  };

  // Add this function to handle adding a new item from mobile
  const handleAddItemClick = () => {
    setShowMobileForm(true);
    // Reset form when opening
    if (editingItem) {
      setNewItem({ name: '', price: '', description: '' });
      setEditingItem(null);
    }
  };

  // Close mobile form and reset state
  const closeMobileForm = () => {
    setShowMobileForm(false);
    setNewItem({ name: '', price: '' });
    setEditingItem(null);
  };

  // Handle form submission for mobile
  const handleMobileFormSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      await handleUpdateItem();
    } else {
      await handleAddItem();
    }
    closeMobileForm();
  };

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

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
        <div className="fixed top-24 left-0 right-0 bg-white shadow-lg z-20 p-4 md:hidden border-t border-gray-200">
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
            <button
              onClick={() => setShowAddSection(true)}
              className="px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaPlus className="mr-2 h-3 w-3" /> Add Section
            </button>
          </div>
        </div>
      )}

      <div className="pt-28 pb-16 px-8 sm:px-10 lg:px-12 max-w-7xl mx-auto">
        {/* Mobile Add Item Modal */}
      {showMobileForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMobileForm}
          ></div>
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-t-3xl p-6 pt-8 pb-10 mx-auto max-w-md w-full mt-16 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button 
                onClick={closeMobileForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleMobileFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeMobileForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-60 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Menu Categories</h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="text-yellow-600 hover:text-yellow-700"
                title="Add new section"
              >
                <FaPlus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.id} className="group flex items-center">
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {section.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete section"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              
              {showAddSection && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                    placeholder="Enter section name"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddSection}
                      className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-yellow-600 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => setShowAddSection(false)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeSection && (
            <>
              {/* Add Item Form - Desktop */}
              <div className="hidden md:block bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editingItem) {
                      await handleUpdateItem();
                    } else {
                      await handleAddItem();
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                      <select
                        value={activeSection}
                        onChange={(e) => setActiveSection(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                      >
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setNewItem({ name: '', price: '', description: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center min-w-[120px] transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editingItem ? 'Updating...' : 'Adding...'}
                        </>
                      ) : editingItem ? (
                        <>
                          <FaSave className="mr-2" /> Update Item
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2" /> Add Item
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Menu Items List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {sections.find((s) => s.id === activeSection)?.name || 'Menu'} Items
                  </h2>
                  <button
                    onClick={handleAddItemClick}
                    className="md:hidden flex items-center justify-center p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                    aria-label="Add new item"
                  >
                    <FaPlus size={16} />
                  </button>
                </div>

                <div className="divide-y divide-gray-200">
                  {loading && !menuItems[activeSection] ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading items...</p>
                    </div>
                  ) : menuItems[activeSection]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {menuItems[activeSection].map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                            <span className="text-yellow-600 font-medium">₹{parseFloat(item.price).toFixed(2)}</span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-full transition-colors"
                                title="Edit item"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete item"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No items found in this category.</p>
                      <p className="text-sm text-gray-400 mt-1">Add your first item using the form above.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ManagementPage;
