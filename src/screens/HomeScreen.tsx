import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { UI_TEXT, CategoryItem, Transaction } from '../constants/types';
import { AddEntryModal } from '../components/AddEntryModal';

export const HomeScreen: React.FC = () => {
  const {
    todayIncome,
    todayExpense,
    todayBalance,
    todayTransactions,
    categories,
    deleteTransaction,
  } = useTransactions();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [selectedPresetCat, setSelectedPresetCat] = useState<CategoryItem | null>(null);

  // Quick 2-tap fast expense candidates
  const quickCategories = categories.filter(c =>
    ['food', 'fuel', 'grocery', 'bills'].includes(c.id)
  );

  const handleOpenAdd = (type: 'income' | 'expense') => {
    setSelectedPresetCat(null);
    setModalType(type);
    setModalVisible(true);
  };

  const handleQuickAdd = (cat: CategoryItem) => {
    setSelectedPresetCat(cat);
    setModalType('expense');
    setModalVisible(true);
  };

  const handleDeletePrompt = (item: Transaction) => {
    const label = item.categoryLabel || item.category;
    const message = `Delete ₹${item.amount} (${label})?`;
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        deleteTransaction(item.id);
      }
    } else {
      Alert.alert(
        UI_TEXT.delete,
        message,
        [
          { text: UI_TEXT.cancel, style: 'cancel' },
          {
            text: UI_TEXT.delete,
            style: 'destructive',
            onPress: () => deleteTransaction(item.id),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Title Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>{UI_TEXT.appName}</Text>
            <Text style={styles.appSubtitle}>Daily Money Management</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="calendar-outline" size={16} color="#2E7D32" />
            <Text style={styles.badgeText}>{UI_TEXT.today}</Text>
          </View>
        </View>

        {/* Today's Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{UI_TEXT.todayBalance}</Text>
          <Text style={[styles.balanceValue, todayBalance < 0 && { color: '#FFCDD2' }]}>
            ₹ {todayBalance.toLocaleString('en-IN')}
          </Text>

          <View style={styles.balanceDivider} />

          <View style={styles.statsRow}>
            {/* Today Income */}
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Ionicons name="arrow-down-circle" size={18} color="#A5D6A7" />
                <Text style={styles.statLabel}>{UI_TEXT.todayIncome}</Text>
              </View>
              <Text style={styles.incomeValue}>+ ₹ {todayIncome.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.statVerticalDivider} />

            {/* Today Expense */}
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <Ionicons name="arrow-up-circle" size={18} color="#FFAB91" />
                <Text style={styles.statLabel}>{UI_TEXT.todayExpense}</Text>
              </View>
              <Text style={styles.expenseValue}>- ₹ {todayExpense.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Add Income / Add Expense */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.incomeActionBtn]}
            onPress={() => handleOpenAdd('income')}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>{UI_TEXT.addIncome}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.expenseActionBtn]}
            onPress={() => handleOpenAdd('expense')}
          >
            <Ionicons name="remove-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>{UI_TEXT.addExpense}</Text>
          </TouchableOpacity>
        </View>

        {/* Super Fast 2-Tap Entry Section */}
        <View style={styles.fastSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={18} color="#E65100" />
            <Text style={styles.sectionTitle}>{UI_TEXT.fastEntry}</Text>
          </View>
          <Text style={styles.fastSubtitle}>{UI_TEXT.fastEntrySub}</Text>

          <View style={styles.quickGrid}>
            {quickCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.quickCard, { borderColor: cat.color }]}
                onPress={() => handleQuickAdd(cat)}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: cat.color }]}>
                  <Ionicons name={(cat.icon as any) || 'pricetag'} size={22} color="#fff" />
                </View>
                <Text style={styles.quickLabel}>{cat.name}</Text>
                {cat.presetAmounts && (
                  <Text style={styles.quickHint}>₹{cat.presetAmounts[0]} / ₹{cat.presetAmounts[1]}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Transactions List */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={18} color="#333" />
            <Text style={styles.sectionTitle}>{UI_TEXT.recentTransactions}</Text>
            <Text style={styles.itemCount}>({todayTransactions.length})</Text>
          </View>

          {todayTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="file-tray-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>{UI_TEXT.noTransactions}</Text>
              <Text style={styles.emptySubtext}>{UI_TEXT.emptySubtext}</Text>
            </View>
          ) : (
            todayTransactions.map(item => {
              const cat = categories.find(c => c.id === item.category);
              const isIncome = item.type === 'income';

              return (
                <View key={item.id} style={styles.txRow}>
                  <View
                    style={[
                      styles.txIconBox,
                      { backgroundColor: cat ? cat.color : '#888' },
                    ]}
                  >
                    <Ionicons
                      name={(cat?.icon as any) || 'pricetag'}
                      size={20}
                      color="#fff"
                    />
                  </View>

                  <View style={styles.txInfo}>
                    <Text style={styles.txCategory}>{item.categoryLabel || cat?.name || item.category}</Text>
                    <View style={styles.txMetaRow}>
                      <Text style={styles.txDate}>{item.date}</Text>
                      {item.note ? <Text style={styles.txNote}> • {item.note}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        isIncome ? styles.txAmountIncome : styles.txAmountExpense,
                      ]}
                    >
                      {isIncome ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeletePrompt(item)}
                      style={styles.deleteIconBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Entry Modal */}
      <AddEntryModal
        visible={modalVisible}
        initialType={modalType}
        presetCategory={selectedPresetCat}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#1E4620',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#C8E6C9',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 6,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A5D6A7',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAB91',
  },
  statVerticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    elevation: 2,
  },
  incomeActionBtn: {
    backgroundColor: '#2E7D32',
  },
  expenseActionBtn: {
    backgroundColor: '#D32F2F',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fastSection: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  fastSubtitle: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  quickHint: {
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },
  historySection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    elevation: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    color: '#888',
  },
  txNote: {
    fontSize: 11,
    color: '#666',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txAmountIncome: {
    color: '#2E7D32',
  },
  txAmountExpense: {
    color: '#D32F2F',
  },
  deleteIconBtn: {
    padding: 2,
  },
});
