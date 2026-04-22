import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface TrackerDB extends DBSchema {
  meals: {
    key: number;
    value: {
      id?: number;
      meal: string;
      timestamp: number;
      calories?: number;
    };
    indexes: { 'by-timestamp': number };
  };
  water: {
    key: number;
    value: {
      id?: number;
      amount: number;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'fasting-tracker-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrackerDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<TrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('meals')) {
          const mealStore = db.createObjectStore('meals', { keyPath: 'id', autoIncrement: true });
          mealStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('water')) {
          const waterStore = db.createObjectStore('water', { keyPath: 'id', autoIncrement: true });
          waterStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

// Meal Helpers
export const addMeal = async (meal: string, timestamp: number = Date.now(), calories?: number) => {
  const db = await getDB();
  return db.add('meals', { meal, timestamp, calories });
};

export const getMeals = async () => {
  const db = await getDB();
  return db.getAllFromIndex('meals', 'by-timestamp');
};

// Water Helpers
export const addWater = async (amount: number, timestamp: number = Date.now()) => {
  const db = await getDB();
  return db.add('water', { amount, timestamp });
};

export const getWater = async () => {
  const db = await getDB();
  return db.getAllFromIndex('water', 'by-timestamp');
};
