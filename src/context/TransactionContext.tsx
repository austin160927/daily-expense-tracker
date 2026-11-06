import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, CategoryItem, DEFAULT_CATEGORIES } from '../constants/types';
import { getLocalTransactions, saveTransaction, removeTransaction, getTodayDateString } from '../services/transactionStorage';

const CUSTOM_CATEGORIES_KEY = '@custom_categories_v1';

interface TransactionContextType {
  transactions: Transaction[];
  todayTransactions: Transaction[];
  categories: CategoryItem[];
  todayIncome: number;
  todayExpense: number;
  todayBalance: number;
  addTransaction: (data: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCustomCategory: (cat: Omit<CategoryItem, 'id' | 'isCustom'>) => Promise<void>;
  refresh: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  const loadData = async () => {
    const list = await getLocalTransactions();
    setTransactions(list);

    try {
      const customCatsJson = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (customCatsJson) {
        const customCats: CategoryItem[] = JSON.parse(customCatsJson);
        setCategories([...DEFAULT_CATEGORIES, ...customCats]);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (e) {
      console.error('Failed to load custom categories:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = getTodayDateString();
  const todayTransactions = transactions.filter(t => t.date === todayStr);

  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayBalance = todayIncome - todayExpense;

  const addTransaction = async (data: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...data,
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    await saveTransaction(newTx);
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    await removeTransaction(id);
    await loadData();
  };

  const addCustomCategory = async (catData: Omit<CategoryItem, 'id' | 'isCustom'>) => {
    const newCat: CategoryItem = {
      ...catData,
      id: 'custom_' + Date.now(),
      isCustom: true,
    };
    const currentCustomJson = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const currentCustom: CategoryItem[] = currentCustomJson ? JSON.parse(currentCustomJson) : [];
    const updatedCustom = [...currentCustom, newCat];
    await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updatedCustom));
    setCategories([...DEFAULT_CATEGORIES, ...updatedCustom]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        todayTransactions,
        categories,
        todayIncome,
        todayExpense,
        todayBalance,
        addTransaction,
        deleteTransaction,
        addCustomCategory,
        refresh: loadData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
