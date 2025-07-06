// Minimal Express proxy for Perplexity API (ESM)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
dotenv.config();

// MongoDB Atlas connection
const uri = process.env.MONGODB_URI || "mongodb+srv://yashjadhav1509work:cpI5stwT796AxNZs@echo-spend-easy.2xsomd4.mongodb.net/?retryWrites=true&w=majority&appName=echo-spend-easy";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function connectMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectMongo();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/perplexity', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const apiKey = process.env.PERPLEXITY_API_KEY;
  console.log('🔍 API key exists:', !!apiKey);
  console.log('🔍 API key value:', apiKey);
  const body = req.body;
  console.log('🟢 Incoming body:', JSON.stringify(body));
  if (!apiKey) {
    console.error('❌ Missing API key');
    return res.status(500).json({ error: 'API key is missing in environment' });
  }
  if (!body || !body.messages) {
    console.error('❌ Missing messages in request body');
    return res.status(400).json({ error: 'Missing messages in request body' });
  }
  try {
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: body.messages,
      }),
    });
    const data = await perplexityResponse.json();
    console.log('🟣 Perplexity API response:', JSON.stringify(data));
    return res.status(perplexityResponse.status).json(data);
  } catch (error) {
    console.error('🔥 Backend error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// MongoDB CRUD API for transactions, budgets, and users
const dbName = 'echo-spend-easy';
const transactionsCollection = () => client.db(dbName).collection('transactions');
const budgetsCollection = () => client.db(dbName).collection('budgets');
const usersCollection = () => client.db(dbName).collection('users');

// ===== TRANSACTIONS CRUD =====
// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const txs = await transactionsCollection().find({}).toArray();
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

// Create a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const tx = req.body;
    tx.createdAt = new Date().toISOString();
    const result = await transactionsCollection().insertOne(tx);
    res.status(201).json({ ...tx, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
});

// Get a transaction by ID
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await transactionsCollection().findOne({ _id: new ObjectId(id) });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction', details: err.message });
  }
});

// Update a transaction by ID
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const result = await transactionsCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction', details: err.message });
  }
});

// Delete a transaction by ID
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await transactionsCollection().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  }
});

// ===== BUDGETS CRUD =====
// Get all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const { type, period, userId } = req.query;
    let filter = {};
    if (type) filter.type = type;
    if (period) filter.period = period;
    if (userId) filter.userId = userId;
    
    const budgets = await budgetsCollection().find(filter).toArray();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budgets', details: err.message });
  }
});

// Create a new budget
app.post('/api/budgets', async (req, res) => {
  try {
    const budget = req.body;
    budget.createdAt = new Date().toISOString();
    budget.updatedAt = new Date().toISOString();
    const result = await budgetsCollection().insertOne(budget);
    res.status(201).json({ ...budget, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create budget', details: err.message });
  }
});

// Get a budget by ID
app.get('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetsCollection().findOne({ _id: new ObjectId(id) });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget', details: err.message });
  }
});

// Update a budget by ID
app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    update.updatedAt = new Date().toISOString();
    const result = await budgetsCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update budget', details: err.message });
  }
});

// Delete a budget by ID
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await budgetsCollection().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete budget', details: err.message });
  }
});

// Get budget summary with spending data
app.get('/api/budgets/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetsCollection().findOne({ _id: new ObjectId(id) });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    // Get transactions for the budget period
    const transactions = await transactionsCollection().find({
      date: {
        $gte: budget.type === 'monthly' ? `${budget.period.split('_')[1]}-${budget.period.split('_')[0]}-01` : `${budget.period}-01-01`,
        $lte: budget.type === 'monthly' ? `${budget.period.split('_')[1]}-${budget.period.split('_')[0]}-31` : `${budget.period}-12-31`
      }
    }).toArray();

    // Calculate spending per category
    const categorySpending = {};
    transactions.forEach(tx => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount);
    });

    // Calculate summary
    const totalBudget = Object.values(budget.categoryBudgets).reduce((a, b) => a + b, 0);
    const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);
    const balance = totalBudget - totalSpent;

    const categoryBreakdown = {};
    Object.keys(budget.categoryBudgets).forEach(category => {
      const budgetAmount = budget.categoryBudgets[category] || 0;
      const spentAmount = categorySpending[category] || 0;
      const remaining = budgetAmount - spentAmount;
      const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;
      
      categoryBreakdown[category] = {
        budget: budgetAmount,
        spent: spentAmount,
        remaining,
        percentage
      };
    });

    res.json({
      totalBudget,
      totalSpent,
      balance,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget summary', details: err.message });
  }
});

// ===== USERS CRUD =====
// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await usersCollection().find({}).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    user.createdAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    // Set default preferences if not provided
    if (!user.preferences) {
      user.preferences = {
        currency: 'USD',
        timezone: 'UTC',
        notifications: true,
        theme: 'dark'
      };
    }
    
    const result = await usersCollection().insertOne(user);
    res.status(201).json({ ...user, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// Get a user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersCollection().findOne({ _id: new MongoClient.ObjectId(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// Update a user by ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    update.updatedAt = new Date().toISOString();
    const result = await usersCollection().findOneAndUpdate(
      { _id: new MongoClient.ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return res.status(404).json({ error: 'User not found' });
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersCollection().deleteOne({ _id: new MongoClient.ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// Get user profile with stats
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersCollection().findOne({ _id: new MongoClient.ObjectId(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get user's transactions
    const transactions = await transactionsCollection().find({ userId: id }).toArray();
    const totalTransactions = transactions.length;
    const totalSpent = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Get user's budgets
    const budgets = await budgetsCollection().find({ userId: id }).toArray();
    const totalBudget = budgets.reduce((sum, budget) => {
      return sum + Object.values(budget.categoryBudgets).reduce((a, b) => a + b, 0);
    }, 0);

    const profile = {
      id: user._id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
      stats: {
        totalTransactions,
        totalBudget,
        totalSpent,
        joinDate: user.createdAt
      }
    };

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
