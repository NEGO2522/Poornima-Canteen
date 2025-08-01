import { database } from './firebase';
import { ref, set, get, child, push, remove, update } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

// Initialize database reference
const dbRef = ref(database);

// Function to initialize canteen data in the database
export const initializeCanteenData = async () => {
  // Check if data already exists
  const snapshot = await get(child(dbRef, 'menu'));
  if (snapshot.exists()) {
    return; // Data already exists, no need to initialize
  }


  // Save data to the database
  await set(ref(database, 'menu'), canteenData);
};

// Function to add a new menu section
export const addMenuSection = async (sectionName) => {
  try {
    const newSection = {
      id: `section-${Date.now()}`,
      name: sectionName,
      createdAt: new Date().toISOString()
    };
    
    await set(
      ref(database, `menu/sections/${newSection.id}`),
      newSection
    );
    
    return newSection;
  } catch (error) {
    console.error('Error adding menu section:', error);
    throw error;
  }
};

// Function to delete a menu section
export const deleteMenuSection = async (sectionId) => {
  try {
    // First check if there are any items in this section
    const itemsSnapshot = await get(child(dbRef, `menu/menuItems/${sectionId}`));
    if (itemsSnapshot.exists() && Object.keys(itemsSnapshot.val()).length > 0) {
      throw new Error('Cannot delete section with existing menu items');
    }
    
    // Delete the section
    await remove(ref(database, `menu/sections/${sectionId}`));
    return true;
  } catch (error) {
    console.error('Error deleting menu section:', error);
    throw error;
  }
};

// Function to get all menu sections
export const getMenuSections = async () => {
  try {
    const snapshot = await get(child(dbRef, 'menu/sections'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return [];
  } catch (error) {
    console.error('Error getting menu sections:', error);
    return [];
  }
};

// Function to get menu items by section
export const getMenuItemsBySection = async (sectionId) => {
  try {
    const snapshot = await get(child(dbRef, `menu/menuItems/${sectionId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return [];
  } catch (error) {
    console.error('Error getting menu items:', error);
    return [];
  }
};

// Function to get all menu items
export const getAllMenuItems = async () => {
  try {
    const snapshot = await get(child(dbRef, 'menu/menuItems'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error('Error getting all menu items:', error);
    return {};
  }
};

/**
 * Add a new menu item to a specific section
 * @param {string} sectionId - The ID of the section to add the item to
 * @param {object} itemData - The menu item data (name, price, description, etc.)
 * @returns {Promise<object>} The added menu item with ID
 */
export const addMenuItem = async (sectionId, itemData) => {
  try {
    // Create a new reference with a unique ID
    const newItemRef = push(ref(database, `menu/menuItems/${sectionId}`));
    
    // Create the item object with the generated ID
    const newItem = {
      id: newItemRef.key,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save the item to the database
    await set(newItemRef, newItem);
    
    return newItem;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

/**
 * Delete a menu item from a section
 * @param {string} sectionId - The ID of the section containing the item
 * @param {string} itemId - The ID of the item to delete
 * @returns {Promise<void>}
 */
export const deleteMenuItem = async (sectionId, itemId) => {
  try {
    const itemRef = ref(database, `menu/menuItems/${sectionId}/${itemId}`);
    await remove(itemRef);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

/**
 * Update an existing menu item
 * @param {string} sectionId - The ID of the section containing the item
 * @param {string} itemId - The ID of the item to update
 * @param {object} updates - The fields to update
 * @returns {Promise<void>}
 */
export const updateMenuItem = async (sectionId, itemId, updates) => {
  try {
    const itemRef = ref(database, `menu/menuItems/${sectionId}/${itemId}`);
    await update(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};
