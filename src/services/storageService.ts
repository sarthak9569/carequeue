import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple in-memory fallback for environments where storage might fail (e.g. some web configs or broken native links)
const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`Storage getItem error for key ${key}:`, error);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Storage setItem error for key ${key}:`, error);
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Storage removeItem error for key ${key}:`, error);
      delete memoryStorage[key];
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('Storage clear error:', error);
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    }
  }
};
