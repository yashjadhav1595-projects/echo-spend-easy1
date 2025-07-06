// Migration script to move localStorage data to MongoDB
// Run this in the browser console after starting your backend server

const API_BASE = 'http://localhost:5174/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error || response.statusText}`);
    }
    
    return result;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Migration function
async function migrateToMongoDB() {
  console.log('🚀 Starting migration to MongoDB...');
  
  try {
    // Step 1: Create a default user
    console.log('📝 Creating default user...');
    const defaultUser = {
      email: 'user@example.com',
      name: 'Default User',
      preferences: {
        currency: 'USD',
        timezone: 'UTC',
        notifications: true,
        theme: 'dark'
      }
    };
    
    const user = await apiCall('/users', 'POST', defaultUser);
    console.log('✅ User created:', user._id);
    
    // Step 2: Migrate transactions
    console.log('💰 Migrating transactions...');
    const savedTransactions = localStorage.getItem('finance-transactions');
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);
      console.log(`Found ${transactions.length} transactions to migrate`);
      
      for (const tx of transactions) {
        const transactionData = {
          ...tx,
          userId: user._id,
          id: undefined // Remove the old id, MongoDB will generate _id
        };
        
        await apiCall('/transactions', 'POST', transactionData);
      }
      console.log('✅ Transactions migrated successfully');
    } else {
      console.log('ℹ️ No transactions found in localStorage');
    }
    
    // Step 3: Migrate monthly budgets
    console.log('📊 Migrating monthly budgets...');
    const monthlyBudgets = localStorage.getItem('monthly-budgets');
    if (monthlyBudgets) {
      const budgets = JSON.parse(monthlyBudgets);
      console.log(`Found ${Object.keys(budgets).length} monthly budget periods`);
      
      for (const [period, categoryBudgets] of Object.entries(budgets)) {
        const [month, year] = period.split('_');
        const budgetData = {
          userId: user._id,
          type: 'monthly',
          period: period,
          categoryBudgets: categoryBudgets,
          income: 0 // Default value, can be updated later
        };
        
        await apiCall('/budgets', 'POST', budgetData);
      }
      console.log('✅ Monthly budgets migrated successfully');
    } else {
      console.log('ℹ️ No monthly budgets found in localStorage');
    }
    
    // Step 4: Migrate yearly budgets
    console.log('📈 Migrating yearly budgets...');
    const yearlyBudgets = localStorage.getItem('yearly-budgets');
    if (yearlyBudgets) {
      const budgets = JSON.parse(yearlyBudgets);
      console.log(`Found ${Object.keys(budgets).length} yearly budget periods`);
      
      for (const [year, categoryBudgets] of Object.entries(budgets)) {
        const budgetData = {
          userId: user._id,
          type: 'yearly',
          period: year,
          categoryBudgets: categoryBudgets,
          income: 0 // Default value, can be updated later
        };
        
        await apiCall('/budgets', 'POST', budgetData);
      }
      console.log('✅ Yearly budgets migrated successfully');
    } else {
      console.log('ℹ️ No yearly budgets found in localStorage');
    }
    
    // Step 5: Migrate goals
    console.log('🎯 Migrating goals...');
    const monthlyGoals = localStorage.getItem('monthly-goals');
    const yearlyGoals = localStorage.getItem('yearly-goals');
    
    if (monthlyGoals || yearlyGoals) {
      // Update budgets with goals
      const allBudgets = await apiCall('/budgets');
      
      if (monthlyGoals) {
        const goals = JSON.parse(monthlyGoals);
        for (const [period, goalList] of Object.entries(goals)) {
          const budget = allBudgets.find(b => b.period === period && b.type === 'monthly');
          if (budget && goalList.length > 0) {
            await apiCall(`/budgets/${budget._id}`, 'PUT', {
              ...budget,
              goals: goalList
            });
          }
        }
      }
      
      if (yearlyGoals) {
        const goals = JSON.parse(yearlyGoals);
        for (const [year, goalList] of Object.entries(goals)) {
          const budget = allBudgets.find(b => b.period === year && b.type === 'yearly');
          if (budget && goalList.length > 0) {
            await apiCall(`/budgets/${budget._id}`, 'PUT', {
              ...budget,
              goals: goalList
            });
          }
        }
      }
      console.log('✅ Goals migrated successfully');
    } else {
      console.log('ℹ️ No goals found in localStorage');
    }
    
    // Step 6: Verify migration
    console.log('🔍 Verifying migration...');
    const finalTransactions = await apiCall('/transactions');
    const finalBudgets = await apiCall('/budgets');
    const userProfile = await apiCall(`/users/${user._id}/profile`);
    
    console.log('📊 Migration Summary:');
    console.log(`- Transactions: ${finalTransactions.length}`);
    console.log(`- Budgets: ${finalBudgets.length}`);
    console.log(`- User Profile:`, userProfile);
    
    console.log('🎉 Migration completed successfully!');
    console.log('💡 You can now check your MongoDB Atlas dashboard to see the data.');
    
    // Store the user ID for future reference
    localStorage.setItem('mongodb-user-id', user._id);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Function to check MongoDB data
async function checkMongoDBData() {
  console.log('🔍 Checking MongoDB data...');
  
  try {
    const transactions = await apiCall('/transactions');
    const budgets = await apiCall('/budgets');
    const users = await apiCall('/users');
    
    console.log('📊 Current MongoDB Data:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Transactions: ${transactions.length}`);
    console.log(`- Budgets: ${budgets.length}`);
    
    if (users.length > 0) {
      const userProfile = await apiCall(`/users/${users[0]._id}/profile`);
      console.log('👤 User Profile:', userProfile);
    }
    
    if (transactions.length > 0) {
      console.log('💰 Sample Transaction:', transactions[0]);
    }
    
    if (budgets.length > 0) {
      console.log('📊 Sample Budget:', budgets[0]);
    }
    
  } catch (error) {
    console.error('❌ Failed to check MongoDB data:', error);
  }
}

// Export functions for use in browser console
window.migrateToMongoDB = migrateToMongoDB;
window.checkMongoDBData = checkMongoDBData;

console.log('📦 Migration script loaded!');
console.log('Available functions:');
console.log('- migrateToMongoDB() - Migrate localStorage data to MongoDB');
console.log('- checkMongoDBData() - Check current MongoDB data'); 