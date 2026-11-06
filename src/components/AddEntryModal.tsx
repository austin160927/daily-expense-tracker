import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UI_TEXT, CategoryItem } from '../constants/types';
import { useTransactions } from '../context/TransactionContext';
import { getTodayDateString } from '../services/transactionStorage';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialType?: 'expense' | 'income';
  presetCategory?: CategoryItem | null;
}

export const AddEntryModal: React.FC<Props> = ({
  visible,
  onClose,
  initialType = 'expense',
  presetCategory = null,
}) => {
  const { categories, addTransaction, addCustomCategory } = useTransactions();
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(presetCategory);
  const [note, setNote] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayDateString());

  // New Category Creation state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00BCD4');

  const colorPalette = ['#00BCD4', '#8E24AA', '#3949AB', '#D81B60', '#F4511E', '#43A047', '#546E7A'];

  // Synchronize when modal reopens or props change
  React.useEffect(() => {
    if (visible) {
      setType(initialType);
      if (presetCategory) {
        setSelectedCategory(presetCategory);
      } else {
        const defaultCat = categories.find(c => c.type === initialType) || null;
        setSelectedCategory(defaultCat);
      }
      setAmount('');
      setNote('');
      setEntryDate(getTodayDateString());
      setShowAddCat(false);
      setNewCatName('');
    }
  }, [visible, initialType, presetCategory, categories]);

  const availableCategories = categories.filter(c => c.type === type);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      alert('Please enter a category name');
      return;
    }
    await addCustomCategory({
      name: newCatName.trim(),
      icon: 'bookmark',
      color: newCatColor,
      type,
    });
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleSave = async () => {
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(cleanAmount);
    if (!cleanAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const catToSave = selectedCategory || availableCategories[0] || { id: 'other', name: 'Other' };

    try {
      await addTransaction({
        type,
        amount: parsedAmount,
        category: catToSave.id,
        categoryLabel: catToSave.name,
        note: note.trim(),
        date: entryDate.trim() || getTodayDateString(),
      });
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save transaction');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {type === 'expense' ? UI_TEXT.addExpense : UI_TEXT.addIncome}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Type Switcher */}
          <View style={styles.typeSwitcher}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && { backgroundColor: '#FF5252' },
              ]}
              onPress={() => {
                setType('expense');
                setSelectedCategory(categories.find(c => c.type === 'expense') || null);
              }}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && { backgroundColor: '#2E7D32' },
              ]}
              onPress={() => {
                setType('income');
                setSelectedCategory(categories.find(c => c.type === 'income') || null);
              }}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <Text style={styles.inputLabel}>{UI_TEXT.amount}</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
              />
            </View>

            {/* Quick preset chips */}
            {selectedCategory?.presetAmounts && (
              <View style={styles.presetsRow}>
                {selectedCategory.presetAmounts.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={styles.presetChip}
                    onPress={() => setAmount(val.toString())}
                  >
                    <Text style={styles.presetChipText}>₹{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Input */}
            <Text style={styles.inputLabel}>{UI_TEXT.date} (YYYY-MM-DD)</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <TextInput
                style={styles.dateInput}
                value={entryDate}
                onChangeText={setEntryDate}
                placeholder="YYYY-MM-DD"
              />
              <TouchableOpacity
                onPress={() => setEntryDate(getTodayDateString())}
                style={styles.todayBtn}
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <View style={styles.categoryHeaderRow}>
              <Text style={styles.inputLabel}>{UI_TEXT.category}</Text>
              <TouchableOpacity
                onPress={() => setShowAddCat(!showAddCat)}
                style={styles.addCatBtn}
              >
                <Ionicons name={showAddCat ? "close" : "add"} size={16} color="#1B5E20" />
                <Text style={styles.addCatText}>{showAddCat ? "Cancel" : UI_TEXT.addCustomCategory}</Text>
              </TouchableOpacity>
            </View>

            {/* Inline Custom Category Creator */}
            {showAddCat && (
              <View style={styles.newCatBox}>
                <TextInput
                  style={styles.newCatInput}
                  placeholder="New Category Name (e.g. Gym, OTT)"
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
                <View style={styles.paletteRow}>
                  {colorPalette.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.paletteDot,
                        { backgroundColor: c },
                        newCatColor === c && styles.paletteDotSelected,
                      ]}
                      onPress={() => setNewCatColor(c)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.createCatConfirmBtn}
                    onPress={handleCreateCategory}
                  >
                    <Text style={styles.createCatConfirmText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.categoryGrid}>
              {availableCategories.map(cat => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: cat.color, backgroundColor: cat.color + '15', borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View style={[styles.catIconCircle, { backgroundColor: cat.color }]}>
                      <Ionicons name={(cat.icon as any) || 'pricetag'} size={20} color="#fff" />
                    </View>
                    <Text style={[styles.catText, isSelected && { fontWeight: 'bold', color: '#111' }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Input */}
            <Text style={styles.inputLabel}>{UI_TEXT.note}</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Coffee & Snacks"
              value={note}
              onChangeText={setNote}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: type === 'expense' ? '#FF5252' : '#2E7D32' },
              ]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>{UI_TEXT.save}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  closeBtn: {
    padding: 4,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  typeTextActive: {
    color: '#fff',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
    marginTop: 10,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
    paddingBottom: 6,
    marginBottom: 12,
  },
  rupeeSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  presetChipText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 6,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  todayBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBtnText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addCatText: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  newCatBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  newCatInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paletteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  paletteDotSelected: {
    borderWidth: 2,
    borderColor: '#111',
    transform: [{ scale: 1.15 }],
  },
  createCatConfirmBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  createCatConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  categoryCard: {
    width: '30%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#444',
  },
  noteInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
    color: '#222',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
