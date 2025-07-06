// Verification script to check MongoDB data
// Run this with: node verify-mongodb.js

const { MongoClient } = require('mongodb');

// Your MongoDB connection string
const uri = "mongodb+srv://echo-spend-easy:echo-spend-easy@cluster0.mongodb.net/echo-spend-easy?retryWrites=true&w=majority";

async function verifyMongoDBData() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('echo-spend-easy');
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections found:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Check users
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    console.log(`\n👥 Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Sample user:', {
        _id: users[0]._id,
        email: users[0].email,
        name: users[0].name,
        createdAt: users[0].createdAt
      });
    }
    
    // Check transactions
    const transactionsCollection = db.collection('transactions');
    const transactions = await transactionsCollection.find({}).toArray();
    console.log(`\n💰 Transactions: ${transactions.length}`);
    if (transactions.length > 0) {
      console.log('Sample transaction:', {
        _id: transactions[0]._id,
        amount: transactions[0].amount,
        description: transactions[0].description,
        category: transactions[0].category,
        date: transactions[0].date,
        userId: transactions[0].userId
      });
      
      // Show spending by category
      const categorySpending = {};
      transactions.forEach(tx => {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
      });
      console.log('\n📊 Spending by category:');
      Object.entries(categorySpending).forEach(([category, amount]) => {
        console.log(`- ${category}: $${amount.toFixed(2)}`);
      });
    }
    
    // Check budgets
    const budgetsCollection = db.collection('budgets');
    const budgets = await budgetsCollection.find({}).toArray();
    console.log(`\n📈 Budgets: ${budgets.length}`);
    if (budgets.length > 0) {
      console.log('Sample budget:', {
        _id: budgets[0]._id,
        type: budgets[0].type,
        period: budgets[0].period,
        categories: Object.keys(budgets[0].categoryBudgets),
        totalBudget: Object.values(budgets[0].categoryBudgets).reduce((a, b) => a + b, 0),
        userId: budgets[0].userId
      });
      
      // Show budgets by type
      const monthlyBudgets = budgets.filter(b => b.type === 'monthly');
      const yearlyBudgets = budgets.filter(b => b.type === 'yearly');
      console.log(`- Monthly budgets: ${monthlyBudgets.length}`);
      console.log(`- Yearly budgets: ${yearlyBudgets.length}`);
    }
    
    // Database stats
    console.log('\n📊 Database Statistics:');
    console.log(`- Total documents: ${users.length + transactions.length + budgets.length}`);
    console.log(`- Total collections: ${collections.length}`);
    
    // Check for any orphaned data
    if (users.length > 0 && transactions.length > 0) {
      const userIds = users.map(u => u._id.toString());
      const orphanedTransactions = transactions.filter(tx => !userIds.includes(tx.userId));
      console.log(`- Orphaned transactions: ${orphanedTransactions.length}`);
    }
    
    console.log('\n✅ MongoDB verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying MongoDB data:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the verification
verifyMongoDBData(); 