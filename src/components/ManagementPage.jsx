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
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
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
        price: parseFloat(newItem.price),
        description: newItem.description.trim()
      });
      
      await loadMenuItems(activeSection);
      setNewItem({ name: '', price: '', description: '' });
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
        price: parseFloat(newItem.price),
        description: newItem.description.trim()
      });
      
      await loadMenuItems(activeSection);
      setEditingItem(null);
      setNewItem({ name: '', price: '', description: '' });
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
      price: item.price.toString(),
      description: item.description || ''
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
    setNewItem({ name: '', price: '', description: '' });
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

  return (
    <div className={`min-h-screen bg-gray-100 p-2 sm:p-4 relative ${showMobileForm ? 'overflow-hidden h-screen' : ''}`}>
      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={handleAddItemClick}
          className={`w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-200 ${showMobileForm ? 'scale-0' : 'scale-100'}`}
          aria-label="Add new menu item"
          disabled={showMobileForm}
        >
          <FaPlus className="h-6 w-6" />
        </button>
      </div>

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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Menu Management</h1>
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <FaBars className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation - Mobile */}
          <div className={`md:hidden fixed inset-0 bg-white z-30 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu Sections</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-64px)]">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeSection === section.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.name}
                </button>
              ))}
              
              {showAddSection ? (
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
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Section'}
                    </button>
                    <button
                      onClick={() => setShowAddSection(false)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSection(true)}
                  className="w-full flex items-center justify-center mt-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 text-sm font-medium"
                >
                  <FaPlus className="mr-2 h-3 w-3" /> Add Section
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Navigation - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Menu Sections</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="group flex items-center">
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-md ${
                        activeSection === section.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
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
                
                {showAddSection ? (
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
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add Section'}
                      </button>
                      <button
                        onClick={() => setShowAddSection(false)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSection(true)}
                    className="w-full flex items-center justify-center mt-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 text-sm font-medium"
                  >
                    <FaPlus className="mr-2 h-3 w-3" /> Add Section
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection && (
              <>
                {/* Add Item Form - Desktop */}
                <div className="hidden md:block bg-white rounded-lg shadow-md p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-4">
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
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null);
                            setNewItem({ name: '', price: '', description: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center min-w-[120px]"
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
                            <FaSave className="mr-1" /> Update Item
                          </>
                        ) : (
                          <>
                            <FaPlus className="mr-1" /> Add Item
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Menu Items List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-3 sm:p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {sections.find((s) => s.id === activeSection)?.name || 'Menu'} Items
                    </h2>
                    {loading && (
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Loading...
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-gray-200">
                    {loading && !menuItems[activeSection] ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading items...</p>
                      </div>
                    ) : menuItems[activeSection]?.length > 0 ? (
                      menuItems[activeSection].map((item) => (
                        <div key={item.id} className="p-3 sm:p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 truncate">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50"
                                title="Edit item"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50"
                                title="Delete item"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
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
