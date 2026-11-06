export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryLabel: string;
  note: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  presetAmounts?: number[];
  isCustom?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Expenses
  { id: 'food', name: 'Food & Drinks', icon: 'restaurant', color: '#FF7043', type: 'expense', presetAmounts: [20, 50, 100, 200] },
  { id: 'grocery', name: 'Groceries', icon: 'cart', color: '#FFA726', type: 'expense', presetAmounts: [100, 250, 500, 1000] },
  { id: 'fuel', name: 'Fuel & Travel', icon: 'car', color: '#42A5F5', type: 'expense', presetAmounts: [50, 100, 200, 500] },
  { id: 'medical', name: 'Medical & Health', icon: 'medkit', color: '#EF5350', type: 'expense', presetAmounts: [100, 250, 500] },
  { id: 'bills', name: 'Bills & Recharge', icon: 'flash', color: '#AB47BC', type: 'expense', presetAmounts: [199, 299, 500, 1000] },
  { id: 'rent', name: 'Rent', icon: 'home', color: '#7E57C2', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shirt', color: '#EC407A', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment & OTT', icon: 'film', color: '#00BCD4', type: 'expense' },
  { id: 'other_exp', name: 'Other Expense', icon: 'ellipsis-horizontal-circle', color: '#78909C', type: 'expense' },

  // Incomes
  { id: 'salary', name: 'Salary', icon: 'cash', color: '#2E7D32', type: 'income', presetAmounts: [10000, 20000, 30000, 50000] },
  { id: 'business', name: 'Business', icon: 'trending-up', color: '#00897B', type: 'income' },
  { id: 'freelance', name: 'Freelance / Wages', icon: 'briefcase', color: '#00ACC1', type: 'income' },
  { id: 'investment', name: 'Profit / Interest', icon: 'wallet', color: '#43A047', type: 'income' },
  { id: 'other_inc', name: 'Other Income', icon: 'add-circle', color: '#66BB6A', type: 'income' },
];

export const UI_TEXT = {
  appName: 'Daily Expense Tracker',
  today: 'Today',
  todayIncome: "Today's Income",
  todayExpense: "Today's Expense",
  todayBalance: "Today's Balance",
  monthlyReport: 'Monthly Report',
  totalIncome: 'Total Income',
  totalExpense: 'Total Expense',
  savings: 'Net Savings',
  addIncome: '+ Add Income',
  addExpense: '- Add Expense',
  fastEntry: '⚡ 2-Tap Quick Entry',
  fastEntrySub: '1-tap category ➔ enter amount and save instantly',
  recentTransactions: 'Recent Transactions',
  noTransactions: 'No transactions recorded today',
  emptySubtext: 'Use the buttons above to record your income or expenses',
  amount: 'Amount (₹)',
  category: 'Category',
  date: 'Date',
  note: 'Note (Optional)',
  save: 'Save Entry',
  cancel: 'Cancel',
  delete: 'Delete',
  confirmDelete: 'Are you sure you want to delete this entry?',
  income: 'Income',
  expense: 'Expense',
  selectCategory: 'Select Category',
  pieChartTitle: 'Expense Breakdown by Category',
  noDataPie: 'No expense records found for this month',
  totalExpenseCenter: 'Total Expense',
  addCustomCategory: '+ Add Category',
  exportCsv: 'Export CSV / Excel',
  exportSuccess: 'Report downloaded successfully!',
};
