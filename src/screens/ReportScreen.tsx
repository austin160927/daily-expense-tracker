import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Circle } from 'react-native-svg';
import { useTransactions } from '../context/TransactionContext';
import { UI_TEXT } from '../constants/types';

export const ReportScreen: React.FC = () => {
  const { transactions, categories } = useTransactions();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const prevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthLabel = `${months[currentMonth]} ${currentYear}`;

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthPrefix));

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpense;

  const expenseMap: { [catId: string]: { amount: number; name: string; color: string } } = {};

  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = categories.find(c => c.id === t.category);
      const catName = t.categoryLabel || cat?.name || 'Other';
      const catColor = cat?.color || '#888';

      if (!expenseMap[t.category]) {
        expenseMap[t.category] = { amount: 0, name: catName, color: catColor };
      }
      expenseMap[t.category].amount += t.amount;
    });

  const categoryList = Object.values(expenseMap).sort((a, b) => b.amount - a.amount);

  const chartRadius = 75;
  const strokeWidth = 26;
  const center = 100;
  const circumference = 2 * Math.PI * chartRadius;

  let accumulatedAngle = 0;

  // Export to CSV Feature (Downloads actual .csv file on Web/Laptop)
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      alert('No transactions to export for this month');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Amount (INR)', 'Note'];
    const rows = monthTransactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      `"${(t.categoryLabel || t.category).replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Expense_Report_${monthPrefix}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Report ready with ${monthTransactions.length} records.`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>{UI_TEXT.monthlyReport}</Text>
          <TouchableOpacity onPress={handleExportCSV} style={styles.exportBtn}>
            <Ionicons name="download-outline" size={16} color="#1B5E20" />
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Month Selector Bar */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={22} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Ionicons name="calendar" size={18} color="#2E7D32" />
            <Text style={styles.monthText}>{monthLabel}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={22} color="#1B5E20" />
          </TouchableOpacity>
        </View>

        {/* Overview Stats Cards */}
        <View style={styles.overviewGrid}>
          {/* Income Card */}
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.cardHeader}>{UI_TEXT.totalIncome}</Text>
            <Text style={styles.incomeCardVal}>+ ₹{totalIncome.toLocaleString('en-IN')}</Text>
          </View>

          {/* Expense Card */}
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.cardHeader}>{UI_TEXT.totalExpense}</Text>
            <Text style={styles.expenseCardVal}>- ₹{totalExpense.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Savings Card */}
        <View style={[styles.savingsCard, savings >= 0 ? styles.savingsPos : styles.savingsNeg]}>
          <View style={styles.savingsRow}>
            <Ionicons
              name={savings >= 0 ? 'shield-checkmark' : 'alert-circle'}
              size={24}
              color={savings >= 0 ? '#2E7D32' : '#C62828'}
            />
            <View>
              <Text style={styles.savingsLabel}>{UI_TEXT.savings}</Text>
              <Text
                style={[
                  styles.savingsAmount,
                  { color: savings >= 0 ? '#2E7D32' : '#C62828' },
                ]}
              >
                ₹ {savings.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown & Pie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>📊 {UI_TEXT.pieChartTitle}</Text>

          {categoryList.length === 0 ? (
            <View style={styles.noDataBox}>
              <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
              <Text style={styles.noDataText}>{UI_TEXT.noDataPie}</Text>
            </View>
          ) : (
            <View>
              {/* SVG Donut / Pie Chart */}
              <View style={styles.svgContainer}>
                <Svg height="200" width="200" viewBox="0 0 200 200">
                  <G rotation="-90" origin="100, 100">
                    {categoryList.map((item, idx) => {
                      const percentage = item.amount / totalExpense;
                      const strokeDashoffset = circumference * (1 - percentage);
                      const rotation = accumulatedAngle;
                      accumulatedAngle += percentage * 360;

                      return (
                        <Circle
                          key={idx}
                          cx={center}
                          cy={center}
                          r={chartRadius}
                          stroke={item.color}
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transform={`rotate(${rotation}, ${center}, ${center})`}
                        />
                      );
                    })}
                  </G>
                </Svg>
                <View style={styles.chartCenterText}>
                  <Text style={styles.centerLabel}>{UI_TEXT.totalExpenseCenter}</Text>
                  <Text style={styles.centerAmount}>₹{totalExpense.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              {/* Category Breakdown List */}
              <View style={styles.breakdownList}>
                {categoryList.map((item, idx) => {
                  const percent = Math.round((item.amount / totalExpense) * 100);
                  return (
                    <View key={idx} style={styles.catRow}>
                      <View style={[styles.catColorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.catRowName}>{item.name}</Text>
                      <View style={styles.catRowRight}>
                        <Text style={styles.catRowAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                        <Text style={styles.catRowPercent}>({percent}%)</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 8,
    elevation: 1,
  },
  monthArrow: {
    padding: 8,
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 6,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  cardHeader: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  incomeCardVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  expenseCardVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  savingsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  savingsPos: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  savingsNeg: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savingsLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  savingsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  chartSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
  },
  chartCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 12,
    color: '#777',
  },
  centerAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  breakdownList: {
    marginTop: 20,
    gap: 12,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  catColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  catRowName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  catRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catRowAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  catRowPercent: {
    fontSize: 12,
    color: '#888',
  },
  noDataBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});
