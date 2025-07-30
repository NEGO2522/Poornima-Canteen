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

  // Data to be stored in the database
  const canteenData = {
    sections: [
      { id: 'breakfast', name: 'Breakfast' },
      { id: 'fastFood', name: 'Fast Food' },
      { id: 'maggie', name: 'Maggie' },
      { id: 'sandwich', name: 'Sandwich' },
      { id: 'chinese', name: 'Chinese' },
      { id: 'hotBeverages', name: 'Hot Beverages' },
      { id: 'coldBeverages', name: 'Cold Beverages' },
      { id: 'freshJuicesAndDrinks', name: 'Fresh Juices & Drinks' },
      { id: 'dessert', name: 'Dessert' },
      { id: 'packedItems', name: 'Packed Items' },
      { id: 'energyZone', name: 'Energy Zone' },
    ],
    menuItems: {
      breakfast: [
        { id: 1, name: 'Poha', price: 25, description: '' },
        { id: 2, name: 'Pulao', price: 35, description: '' },
        { id: 3, name: 'Bread Pakoda', price: 20, description: '' },
        { id: 4, name: 'Chole Bhatura', price: 50, description: '' },
        { id: 5, name: 'Bhelpuri', price: 30, description: '' },
        { id: 6, name: 'Chole Kulcha', price: 50, description: '' },
        { id: 7, name: 'Chole Kachori', price: 40, description: '' },
        { id: 8, name: 'Pav Bhaji', price: 45, description: '' },
        { id: 9, name: 'Fried Idli', price: 40, description: '' },
        { id: 10, name: 'Idli Sambhar', price: 35, description: '' },
        { id: 11, name: 'Kurkure Chat', price: 40, description: '' },
        { id: 12, name: 'Chilly Potato', price: 45, description: '' },
        { id: 13, name: 'Aaloo Parantha', price: 40, description: '' },
        { id: 14, name: 'Dal Pakwan', price: 40, description: '' },
      ],
      fastFood: [
        { id: 15, name: 'Kachori', price: 15, description: '' },
        { id: 16, name: 'Samosa', price: 15, description: '' },
        { id: 17, name: 'Burger', price: 35, description: '' },
        { id: 18, name: 'Veg. Mayonnaise patties', price: 35, description: '' },
        { id: 19, name: 'Hot Dog', price: 35, description: '' },
        { id: 20, name: 'Pizza (Round)', price: 80, description: '' },
        { id: 21, name: 'Pizza (Square)', price: 60, description: '' },
      ],
      maggie: [
        { id: 22, name: 'Plain Maggie', price: 30, description: '' },
        { id: 23, name: 'Double Masala Maggie', price: 35, description: '' },
        { id: 24, name: 'Vegetable Maggie', price: 45, description: '' },
        { id: 25, name: 'Cheese Maggie', price: 50, description: '' },
      ],
      sandwich: [
        { id: 26, name: 'Aaloo Sandwich', price: 30, description: '' },
        { id: 27, name: 'Corn Sandwich', price: 40, description: '' },
        { id: 28, name: 'Cheese Sandwich', price: 45, description: '' },
      ],
      chinese: [
        { id: 29, name: 'Veg. Manchurian', price: 45, description: '' },
        { id: 30, name: 'Red Sauce Pasta', price: 45, description: '' },
        { id: 31, name: 'Cheese Pasta', price: 50, description: '' },
        { id: 32, name: 'Noodles', price: 40, description: '' },
        { id: 33, name: 'Steam Momos (6pc)', price: 45, description: '' },
        { id: 34, name: 'Fried Momos (6pc)', price: 50, description: '' },
        { id: 35, name: 'French Fries', price: 30, description: '' },
      ],
      hotBeverages: [
        { id: 36, name: 'Tea', price: 10, description: '' },
        { id: 37, name: 'Lemon Tea', price: 15, description: '' },
        { id: 38, name: 'Coffee', price: 20, description: '' },
        { id: 39, name: 'Vanilla Coffee', price: 25, description: '' },
        { id: 40, name: 'Cappuccino Coffee', price: 25, description: '' },
        { id: 41, name: 'Hot Chocolate Coffee', price: 25, description: '' },
        { id: 42, name: 'Coffee Latte', price: 25, description: '' },
        { id: 43, name: 'Black Coffee', price: 15, description: '' },
      ],
      coldBeverages: [
        { id: 44, name: 'Iced Tea', price: 35, description: '' },
        { id: 45, name: 'Cold Coffee', price: 40, description: '' },
        { id: 46, name: 'Cold Chocolate', price: 40, description: '' },
      ],
      freshJuicesAndDrinks: [
        { id: 47, name: 'Fresh Lassi', price: 35, description: '' },
        { id: 48, name: 'Fresh Chhach', price: 30, description: '' },
        { id: 49, name: 'Nimbu Pani', price: 20, description: '' },
        { id: 50, name: 'Soda Shikanji', price: 30, description: '' },
        { id: 51, name: 'Banana Shake', price: 40, description: '' },
        { id: 52, name: 'Pineapple Juice', price: 35, description: '' },
        { id: 53, name: 'Pineapple Shake', price: 40, description: '' },
        { id: 54, name: 'Papaya Juice', price: 35, description: '' },
        { id: 55, name: 'Papaya Shake', price: 40, description: '' },
        { id: 56, name: 'Mango Juice', price: 35, description: '' },
        { id: 57, name: 'Mango Shake', price: 40, description: '' },
        { id: 58, name: 'Orange Juice', price: 35, description: '' },
        { id: 59, name: 'Orange Shake', price: 40, description: '' },
        { id: 60, name: 'Mix Fruit Juice', price: 40, description: '' },
        { id: 61, name: 'Mix Fruit Shake', price: 45, description: '' },
        { id: 62, name: 'Apple Juice', price: 40, description: '' },
        { id: 63, name: 'Apple Shake', price: 45, description: '' },
        { id: 64, name: 'Chikoo Shake', price: 40, description: '' },
        { id: 65, name: 'Strawberry Shake', price: 45, description: '' },
        { id: 66, name: 'Butter Milk', price: 30, description: '' },
        { id: 67, name: 'Shikanji', price: 25, description: '' },
      ],
      dessert: [
        { id: 68, name: 'Gulab Jamun (1pc)', price: 10, description: '' },
        { id: 69, name: 'Rasgulla (1pc)', price: 10, description: '' },
        { id: 70, name: 'Rasmalai (1pc)', price: 15, description: '' },
        { id: 71, name: 'Rabri (1pc)', price: 15, description: '' },
        { id: 72, name: 'Ice Cream (1 scoop)', price: 25, description: '' },
        { id: 73, name: 'Ice Cream (2 scoop)', price: 45, description: '' },
        { id: 74, name: 'Ice Cream (3 scoop)', price: 60, description: '' },
      ],
      packedItems: [
        { id: 75, name: 'Chips', price: 10, description: '' },
        { id: 76, name: 'Biscuits', price: 10, description: '' },
        { id: 77, name: 'Chocolate', price: 10, description: '' },
        { id: 78, name: 'Cake', price: 20, description: '' },
        { id: 79, name: 'Pastry', price: 25, description: '' },
        { id: 80, name: 'Cold Drink (250ml)', price: 25, description: '' },
        { id: 81, name: 'Cold Drink (500ml)', price: 45, description: '' },
        { id: 82, name: 'Cold Drink (1L)', price: 80, description: '' },
        { id: 83, name: 'Cold Drink (1.5L)', price: 100, description: '' },
        { id: 84, name: 'Cold Drink (2L)', price: 120, description: '' },
        { id: 85, name: 'Mineral Water (500ml)', price: 20, description: '' },
        { id: 86, name: 'Mineral Water (1L)', price: 30, description: '' },
      ],
      energyZone: [
        { id: 87, name: 'Banana', price: 10, description: '' },
        { id: 88, name: 'Apple', price: 20, description: '' },
        { id: 89, name: 'Orange', price: 15, description: '' },
        { id: 90, name: 'Pomegranate', price: 40, description: '' },
        { id: 91, name: 'Chikoo', price: 15, description: '' },
        { id: 92, name: 'Guava', price: 15, description: '' },
        { id: 93, name: 'Mango', price: 30, description: '' },
        { id: 94, name: 'Pineapple', price: 25, description: '' },
        { id: 95, name: 'Papaya', price: 25, description: '' },
        { id: 96, name: 'Watermelon', price: 20, description: '' },
        { id: 97, name: 'Muskmelon', price: 20, description: '' },
        { id: 98, name: 'Grapes', price: 30, description: '' },
      ]
    }
  };

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
