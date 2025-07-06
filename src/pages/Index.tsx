import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { TransactionForm } from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { SummaryCards } from '@/components/SummaryCards';
import { HeroSection } from '@/components/HeroSection';
import { CategoryChart } from '@/components/CategoryChart';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/types/Transaction';
import { AIChatbot } from '@/components/AIChatbot';
import { ComparativeAnalysis } from '@/components/ComparativeAnalysis';
import { CSVImport } from '@/components/CSVImport';
import { SmartSpendNavigator } from '@/components/SmartSpendNavigator';
import { Transaction } from '@/types/Transaction';
import { Button } from '@/components/ui/button';
import { BudgetDialog } from '@/components/BudgetDialog';

// Fix for window.gapi TypeScript error
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file profile email openid';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [budget, setBudget] = useState<{ month: string; year: string; amount: number }>({ month: '', year: '', amount: 0 });
  const [goalPrompt, setGoalPrompt] = useState('');
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [income, setIncome] = useState(0);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [driveUser, setDriveUser] = useState<{ email: string; name: string } | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const backupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Load Google API script
  useEffect(() => {
    console.log('Google Client ID:', GOOGLE_CLIENT_ID); // Debug log
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google Client ID is not defined. Check your .env file.');
      return;
    }
    
    // Load Google Identity Services only (no deprecated gapi)
    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services script loaded successfully');
        // Initialize Google Identity Services with proper configuration
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          scope: GOOGLE_SCOPES,
          auto_select: false,
          cancel_on_tap_outside: true,
          prompt_parent_id: 'google-signin-container', // Optional: specify container
        });
        console.log('Google Identity Services initialized');
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
      };
      document.body.appendChild(script);
    }
  }, [GOOGLE_CLIENT_ID]);

  // Handle Google Identity Services response
  const handleCredentialResponse = (response: any) => {
    console.log('Google Identity response received:', response);
    if (response.credential) {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('User info:', payload);
      
      setDriveUser({ 
        email: payload.email, 
        name: payload.name 
      });
      setIsDriveConnected(true);
      
      // Store the credential for API calls
      accessTokenRef.current = response.credential;
    }
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleRestoreTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleImportTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...newTransactions, ...prev]);
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    const csvRows = [
      ['Date', 'Time', 'Amount', 'Description', 'Category'],
      ...transactions.map(t => [t.date, t.time || '', t.amount, t.description, t.category])
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);

    // Also export to MongoDB
    try {
      await Promise.all(transactions.map(tx =>
        fetch('http://localhost:5174/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx)
        })
      ));
      alert('Transactions exported to MongoDB!');
    } catch (err) {
      alert('Failed to export transactions to MongoDB.');
    }
  };

  // Set Goal handler (simulate natural language execution)
  const handleSetGoal = () => {
    if (!goalPrompt.trim()) return;
    // Simulate goal execution (could be extended with AI/NLP)
    alert(`Goal set: ${goalPrompt}`);
    setGoalPrompt('');
  };

  // Google Sign-In handler using Google Identity Services
  const handleConnectDrive = async () => {
    console.log('Attempting Google Sign-In...');
    
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services not loaded');
      alert('Google Identity Services not loaded. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Prompting for sign-in...');
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      alert(`Google Sign-In failed: ${err.message || 'Unknown error'}`);
    }
  };

  // Backup function: uploads transactions as JSON to Google Drive
  const backupToDrive = async () => {
    if (!accessTokenRef.current) return;
    setIsBackingUp(true);
    try {
      const fileContent = JSON.stringify({ transactions, budgets: budget, categoryBudgets });
      const blob = new Blob([fileContent], { type: 'application/json' });
      const metadata = {
        name: `echo-spend-easy-backup-${new Date().toISOString()}.json`,
        mimeType: 'application/json',
      };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);
      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
        body: form,
      });
      setLastBackup(new Date());
    } catch (err) {
      alert('Google Drive backup failed.');
    }
    setIsBackingUp(false);
  };

  // Start/clear backup interval after connecting
  useEffect(() => {
    if (isDriveConnected) {
      backupToDrive(); // Initial backup on connect
      backupIntervalRef.current = setInterval(backupToDrive, 1800000); // 30 min
    } else if (backupIntervalRef.current) {
      clearInterval(backupIntervalRef.current);
    }
    return () => {
      if (backupIntervalRef.current) clearInterval(backupIntervalRef.current);
    };
    // eslint-disable-next-line
  }, [isDriveConnected, transactions, budget, categoryBudgets]);

  return (
    <div className="min-h-screen bg-[#181b2e]">
      {/* Navbar */}
      <nav className="w-full px-4 py-3 border-b border-gray-200 dark:border-[#23243a] flex items-center justify-between bg-white/80 dark:bg-[#23243a]/90 backdrop-blur-lg sticky top-0 z-20 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2">
          <button className="md:hidden mr-2" onClick={() => setSidebarOpen(v => !v)} aria-label="Open sidebar">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-bold tracking-tight text-[#4de3c1]">echo-spend-easy</span>
        </div>
      </nav>

      {/* Hero Section (customized) */}
      <HeroSection
        transactions={transactions}
        transactionsToday={transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length}
        budget={budget}
        categoryBudgets={categoryBudgets}
        onStartTracking={() => {
          const el = document.getElementById('transaction-form');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={handleExportCSV} variant="outline" className="border-[#35365a] text-[#e6e6fa]">
            Export CSV
          </Button>
          <Button onClick={() => setBudgetDialogOpen(true)} variant="outline" className="border-[#35365a] text-[#e6e6fa]">
            Manage Budgets & Goals
          </Button>
          <Button
            onClick={handleConnectDrive}
            variant="outline"
            className="border-[#35365a] text-[#4de3c1] font-bold"
            disabled={isDriveConnected}
          >
            {isDriveConnected ? (driveUser ? `Connected: ${driveUser.email}` : 'Connected') : 'Connect (to Drive Account)'}
          </Button>
          <Button
            onClick={() => {
              console.log('=== Google OAuth Debug Info ===');
              console.log('Client ID:', GOOGLE_CLIENT_ID);
              console.log('Scopes:', GOOGLE_SCOPES);
              console.log('Window.google:', !!window.google);
              console.log('Google Identity Services:', !!window.google?.accounts?.id);
              alert('Check browser console for debug info');
            }}
            variant="outline"
            className="border-[#35365a] text-[#ff6b6b] font-bold"
          >
            Debug OAuth
          </Button>
          <Button
            onClick={backupToDrive}
            variant="outline"
            className="border-[#35365a] text-[#6c63ff] font-bold"
            disabled={!isDriveConnected || isBackingUp}
          >
            {isBackingUp ? 'Backing Up...' : 'Backup'}
          </Button>
          {isDriveConnected && (
            <span className="text-xs text-[#b3baff] ml-2 mt-2">
              Last backup: {lastBackup ? lastBackup.toLocaleTimeString() : 'Pending...'}
            </span>
          )}
        </div>
        <SummaryCards transactions={transactions} cardClassName="bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#35365a] text-[#e6e6fa] shadow-lg rounded-xl" />
        
        <div className="grid md:grid-cols-[400px_1fr] gap-8 mt-8">
          {/* Sidebar - Form */}
          <aside
            className={`md:sticky md:top-8 md:self-start md:col-span-1 z-10 ${sidebarOpen ? '' : ''}`}
            style={{ maxWidth: 400 }}
          >
            <div className={`p-0 md:p-0 h-full md:h-auto md:rounded-xl rounded-none w-full md:w-auto bg-[#23243a] border border-[#23243a] text-white shadow-xl`}>
              <TransactionForm
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                editingTransaction={editingTransaction}
                onCancelEdit={() => setEditingTransaction(null)}
                categories={categories}
                setCategories={setCategories}
              />
              
              {/* Import and Category Management */}
              <div className="p-4 border-t border-gray-200 dark:border-[#35365a] space-y-2">
                <CSVImport
                  onImportTransactions={handleImportTransactions}
                  categories={categories}
                  darkMode={true}
                />
              </div>
            </div>
          </aside>

          {/* Main Dashboard */}
          <main className="space-y-8 text-[#e6e6fa]"> 
            <TransactionList
              transactions={transactions}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
              onRestore={handleRestoreTransaction}
              cardClassName='bg-[#23243a] border border-[#23243a] text-white shadow-lg rounded-xl'
            />
            <div className="grid md:grid-cols-1 gap-6">
              <CategoryChart transactions={transactions} cardClassName="" categories={categories} />
            </div>
            <ComparativeAnalysis transactions={transactions} cardClassName="" />
            
            {/* Smart Spending Navigator */}
            <SmartSpendNavigator
              transactions={transactions}
              categories={categories}
            />
          </main>
        </div>
      </div>
      <AIChatbot transactions={transactions} />
      <BudgetDialog
        open={budgetDialogOpen}
        setOpen={setBudgetDialogOpen}
        transactions={transactions}
        categoryBudgets={categoryBudgets}
        setCategoryBudgets={setCategoryBudgets}
        income={income}
        setIncome={setIncome}
        goalPrompt={goalPrompt}
        setGoalPrompt={setGoalPrompt}
        onSetGoal={handleSetGoal}
      />
    </div>
  );
};

export default Index;
