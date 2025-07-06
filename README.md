# 🚀 echo-spend-easy

> **AI-powered, real-time personal finance dashboard with cloud sync**  
> *Track smarter. Spend better. Visualize. Analyze. Optimize.*

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green.svg)](https://perplexity.ai/)

<div align="center">
  <img src="https://img.shields.io/badge/Features-AI%20Chatbot%20|%20Cloud%20Sync%20|%20CSV%20Import%20|%20Mock%20Data%20|%20Real-time%20Analytics%20|%20Dark%20Mode%20|%20Responsive-blue?style=for-the-badge" alt="Features" />
</div>

---

## 📝 Repository Overview

This project is a modern, full-stack personal finance dashboard built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. It features:

- **AI-powered insights** (via Perplexity AI)
- **Cloud data synchronization** (MongoDB Atlas + Google Drive)
- **CSV import/export** with smart data parsing
- **Enhanced mock data generation** with realistic timestamps
- **Real-time analytics** and interactive charts
- **Customizable budgets, goals, and categories**
- **Modern, responsive UI/UX** with glassmorphism and dark mode
- **Full-stack architecture** with Express backend

### Key Structure

- `src/components/` — All UI and feature components (budgets, charts, chatbot, etc.)
- `src/pages/` — Main pages (Index, NotFound)
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript types
- `src/utils/` — Utility functions (e.g., natural language parsing, CSV handling)
- `server.js` — Express backend for AI proxy and MongoDB integration
- `vite.config.ts` — Vite config (with Node polyfill for crypto)

### Notable Features

- **BudgetDialog**: Interactive dialog for monthly/yearly budgets and goal management
- **AIChatbot**: Embedded AI assistant for financial Q&A
- **CategoryChart, ComparativeAnalysis**: Visual analytics and trend tracking
- **CSVImport**: Smart CSV data import with preview and validation
- **MockDataGenerator**: Enhanced realistic data generation with faker.js
- **CloudSync**: MongoDB Atlas integration with data migration tools
- **Modern UI**: Uses shadcn/ui, Tailwind, and custom gradients for a beautiful, accessible experience

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Key Components](#-key-components)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏗️ Architecture](#️-architecture)
- [🎨 UI/UX Features](#-uiux-features)
- [🤖 AI Integration](#-ai-integration)
- [☁️ Cloud Integration](#️-cloud-integration)
- [📊 Data Analytics](#-data-analytics)
- [📁 Data Management](#-data-management)
- [🔧 Development](#-development)
- [📱 Responsive Design](#-responsive-design)
- [🎯 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time Transaction Tracking** - Add, edit, and delete transactions instantly
- **Smart Category Management** - Customizable spending categories with emojis
- **Live Balance Calculation** - Real-time financial overview
- **Local Storage Persistence** - Data saved automatically in browser
- **Cloud Data Sync** - MongoDB Atlas integration for cross-device access

### 🤖 AI-Powered Insights
- **Intelligent Financial Assistant** - AI chatbot for personalized advice
- **Spending Pattern Analysis** - AI-driven insights and recommendations
- **Smart Suggestions** - Context-aware transaction recommendations
- **Natural Language Processing** - Chat with your financial data

### 📊 Advanced Analytics
- **Interactive Charts** - Category-wise spending visualization
- **Comparative Analysis** - Month-over-month spending trends
- **Portfolio Analysis** - Comprehensive financial overview
- **Real-time Statistics** - Live transaction counts and balances

### 📁 Data Management
- **CSV Import/Export** - Import transaction data from CSV files
- **Smart Data Parsing** - Automatic category detection and time parsing
- **Data Preview** - Preview imported data before confirmation
- **Mock Data Generation** - Generate realistic test data with faker.js
- **Data Migration Tools** - Migrate from localStorage to MongoDB

### 🎨 Modern UI/UX
- **Dark Mode Default** - Elegant dark theme by default
- **Light Mode Toggle** - Seamless theme switching
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Modern Glassmorphism** - Beautiful gradient backgrounds

---

## 🎯 Key Components

### 🏠 **HeroSection.tsx** - Landing Experience
```typescript
// Animated hero with typewriter effect and live statistics
- Real-time balance display
- Transaction count for today
- Top spending category analysis
- Animated background gradients
- Call-to-action buttons
```

### 📝 **TransactionForm.tsx** - Smart Input System
```typescript
// Intelligent transaction entry with validation
- Natural language input parsing
- Category auto-suggestion
- Form validation with Zod
- Edit mode for existing transactions
- Custom category management
- Time input with HH:mm format
```

### 📋 **TransactionList.tsx** - Data Management
```typescript
// Comprehensive transaction display and management
- Sortable transaction list
- Edit/delete functionality
- Undo delete with restore
- Search and filter capabilities
- Responsive card layout
- Time column display
```

### 📊 **CategoryChart.tsx** - Visual Analytics
```typescript
// Interactive pie chart for spending categories
- Real-time data visualization
- Hover effects and tooltips
- Category-wise spending breakdown
- Color-coded categories
- Responsive chart sizing
```

### 🤖 **AIChatbot.tsx** - Intelligent Assistant
```typescript
// AI-powered financial advisor
- Perplexity AI integration
- Context-aware responses
- Transaction data analysis
- Personalized recommendations
- Structured response formatting
```

### 📈 **ComparativeAnalysis.tsx** - Trend Analysis
```typescript
// Advanced spending pattern analysis
- Month-over-month comparisons
- Spending trend visualization
- Category performance tracking
- Budget vs actual analysis
```

### 💳 **SummaryCards.tsx** - Quick Overview
```typescript
// Real-time financial summary
- Total balance calculation
- Monthly spending overview
- Category-wise summaries
- Animated statistics
```

### 📁 **CSVImport.tsx** - Data Import System
```typescript
// Smart CSV data import with validation
- File upload and parsing
- Data preview table
- Column mapping
- Validation and error handling
- Time column support
```

### 🎲 **MockDataGenerator.tsx** - Test Data Generation
```typescript
// Enhanced realistic data generation
- Category-specific descriptions
- Realistic timestamps (HH:mm format)
- Configurable data volume
- Faker.js integration
- Time-aware data generation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Perplexity AI API key (for AI features)
- MongoDB Atlas account (for cloud sync)

### 1. Clone the Repository
```bash
git clone https://github.com/yashjadhav1595-projects/echo-spend-easy1.git
cd echo-spend-easy1
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Required for AI features
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Required for MongoDB Atlas integration
MONGODB_URI=your_mongodb_atlas_connection_string

# Optional server configuration
PORT=5174
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 5. Start Backend Server (for AI features and MongoDB)
```bash
node server.js
```

Visit `http://localhost:5173` to see your application!

---

## 📦 Installation

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.1",
  "tailwindcss": "^3.4.11",
  "framer-motion": "^12.23.0",
  "recharts": "^2.12.7",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8",
  "faker": "^5.5.3"
}
```

### Backend Dependencies
```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "dotenv": "^17.0.1",
  "node-fetch": "^2.7.0",
  "mongodb": "^6.3.0"
}
```

---

## ⚙️ Configuration

### Environment Variables
```env
# Required for AI features
PERPLEXITY_API_KEY=your_api_key_here

# Required for MongoDB Atlas integration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Optional server configuration
PORT=5174
```

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file
5. Configure network access and database user

### Tailwind Configuration
```typescript
// tailwind.config.ts
- Custom color palette
- Dark mode support
- Animation utilities
- Responsive breakpoints
```

---

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── AIChatbot.tsx   # AI assistant
│   ├── CategoryChart.tsx
│   ├── TransactionForm.tsx
│   ├── CSVImport.tsx   # CSV import functionality
│   ├── MockDataGenerator.tsx # Mock data generation
│   └── ...
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── lib/                # Library configurations
```

### Backend Structure
```
server.js               # Express server for AI API proxy and MongoDB
├── AI Integration      # Perplexity API proxy
├── MongoDB CRUD        # Database operations
├── Data Migration      # localStorage to MongoDB migration
└── API Endpoints       # RESTful API for data management
```

---

## 🎨 UI/UX Features

### 🎭 Theme System
- **Dark Mode**: Elegant dark theme with custom colors (default)
- **Light Mode**: Clean, modern light theme
- **Smooth Transitions**: 300ms color transitions
- **Persistent Preferences**: Theme saved in localStorage
- **No Flash**: Dark mode loads immediately to prevent light mode flash

### 🎨 Design Elements
- **Glassmorphism**: Frosted glass effects
- **Gradient Backgrounds**: Beautiful color gradients
- **Micro-interactions**: Hover effects and animations
- **Typography**: Modern font hierarchy

### 📱 Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

---

## 🤖 AI Integration

### Perplexity AI Features
- **Financial Analysis**: Spending pattern recognition
- **Smart Recommendations**: Personalized advice
- **Natural Language**: Conversational interface
- **Context Awareness**: Transaction data integration

### AI Response Structure
```typescript
interface AIResponse {
  analysis: string;
  recommendations: string[];
  insights: string[];
  actionableSteps: string[];
}
```

---

## ☁️ Cloud Integration

### MongoDB Atlas Features
- **Real-time Sync**: Cross-device data synchronization
- **Data Persistence**: Cloud-based data storage
- **Backup & Recovery**: Automatic data backups
- **Scalability**: Cloud-native architecture

### Data Migration
- **localStorage to MongoDB**: Seamless data migration
- **Migration Tools**: Browser-based migration utility
- **Data Verification**: Migration verification scripts
- **Backward Compatibility**: Local storage fallback

### API Endpoints
```typescript
// Transaction Management
GET    /api/transactions     # Get all transactions
POST   /api/transactions     # Create transaction
PUT    /api/transactions/:id # Update transaction
DELETE /api/transactions/:id # Delete transaction

// Budget Management
GET    /api/budgets          # Get all budgets
POST   /api/budgets          # Create budget
PUT    /api/budgets/:id      # Update budget
DELETE /api/budgets/:id      # Delete budget

// User Management
GET    /api/users            # Get user profile
POST   /api/users            # Create user
PUT    /api/users/:id        # Update user
```

---

## 📊 Data Analytics

### Real-time Metrics
- **Live Balance**: Instant balance calculation
- **Transaction Count**: Daily transaction tracking
- **Category Analysis**: Top spending categories
- **Trend Analysis**: Month-over-month comparisons

### Chart Types
- **Pie Charts**: Category distribution
- **Bar Charts**: Monthly comparisons
- **Line Charts**: Spending trends
- **Area Charts**: Cumulative spending

---

## 📁 Data Management

### CSV Import Features
- **Smart Parsing**: Automatic column detection
- **Data Preview**: Preview before import
- **Validation**: Data format validation
- **Time Support**: HH:mm time format
- **Category Mapping**: Automatic category detection

### Mock Data Generation
- **Realistic Data**: Category-specific descriptions
- **Time Stamps**: Realistic HH:mm timestamps
- **Configurable Volume**: Adjustable data amounts
- **Faker Integration**: High-quality fake data

### Data Migration
- **Migration Tool**: Browser-based migration utility
- **Verification Scripts**: Data integrity checks
- **Backup Support**: Local storage backup
- **Rollback Capability**: Migration rollback

---

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality

---

## 📱 Responsive Design

### Mobile-First Approach
- **Touch-friendly**: Optimized for mobile interaction
- **Gesture Support**: Swipe and tap gestures
- **Offline Capability**: Local storage persistence
- **Progressive Web App**: PWA-ready

### Cross-Platform Compatibility
- **iOS Safari**: Full support
- **Android Chrome**: Full support
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Tablet Devices**: iPad, Android tablets

---

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Transaction management
- [x] Category system
- [x] Basic analytics
- [x] Dark/light mode

### Phase 2: AI Integration ✅
- [x] AI chatbot
- [x] Smart suggestions
- [x] Financial insights
- [x] Natural language processing

### Phase 3: Data Management ✅
- [x] CSV import/export
- [x] Mock data generation
- [x] Enhanced time tracking
- [x] Data validation

### Phase 4: Cloud Integration ✅
- [x] MongoDB Atlas integration
- [x] Data migration tools
- [x] Cloud sync
- [x] API endpoints

### Phase 5: Advanced Features 🚧
- [ ] Google Drive backup
- [ ] Budget planning
- [ ] Goal tracking
- [ ] Multi-currency support
- [ ] Family accounts
- [ ] Shared budgets
- [ ] Real-time sync
- [ ] Notifications

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add JSDoc comments for complex functions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful UI components
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Perplexity AI** for intelligent insights
- **Tailwind CSS** for utility-first styling
- **MongoDB Atlas** for cloud database
- **Faker.js** for realistic test data

---

<div align="center">
  <p>Made with ❤️ by the echo-spend-easy team</p>
  <p>
    <a href="https://github.com/yashjadhav1595-projects/echo-spend-easy1/stargazers">
      <img src="https://img.shields.io/github/stars/yashjadhav1595-projects/echo-spend-easy1" alt="Stars" />
    </a>
    <a href="https://github.com/yashjadhav1595-projects/echo-spend-easy1/network">
      <img src="https://img.shields.io/github/forks/yashjadhav1595-projects/echo-spend-easy1" alt="Forks" />
    </a>
    <a href="https://github.com/yashjadhav1595-projects/echo-spend-easy1/issues">
      <img src="https://img.shields.io/github/issues/yashjadhav1595-projects/echo-spend-easy1" alt="Issues" />
    </a>
  </p>
</div>
