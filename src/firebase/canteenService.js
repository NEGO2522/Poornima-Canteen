import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';

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
