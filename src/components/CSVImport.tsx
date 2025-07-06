import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/types/Transaction';
import { faker } from '@faker-js/faker';

interface CSVImportProps {
  onImportTransactions: (transactions: Transaction[]) => void;
  categories: Array<{ value: string; label: string; emoji: string; color: string }>;
  darkMode?: boolean;
}

interface CSVRow {
  [key: string]: string;
}

interface ProcessedTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  time?: string;
  isValid: boolean;
  errors: string[];
}

// Common bank CSV formats and their field mappings
const BANK_FORMATS = {
  'hdfc': { date: 'Transaction Date', amount: 'Withdrawal Amt.', description: 'Transaction Remarks', category: 'Category' },
  'sbi': { date: 'Date', amount: 'Amount', description: 'Narration', category: 'Category' },
  'icici': { date: 'Transaction Date', amount: 'Debit', description: 'Transaction Remarks', category: 'Category' },
  'axis': { date: 'Transaction Date', amount: 'Debit Amount', description: 'Transaction Remarks', category: 'Category' },
  'generic': { date: 'Date', amount: 'Amount', description: 'Description', category: 'Category' }
};

// Smart category mapping based on description keywords
const CATEGORY_KEYWORDS = {
  'food': ['restaurant', 'food', 'meal', 'dining', 'cafe', 'pizza', 'burger', 'swiggy', 'zomato', 'khana', 'खाना'],
  'transport': ['uber', 'ola', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'parking', 'transport', 'यातायात'],
  'shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'clothes', 'shoes', 'bag', 'watch', 'jewelry', 'शॉपिंग'],
  'entertainment': ['netflix', 'prime', 'hotstar', 'movie', 'cinema', 'theatre', 'game', 'entertainment', 'मनोरंजन'],
  'health': ['pharmacy', 'medicine', 'doctor', 'hospital', 'gym', 'fitness', 'health', 'medical', 'स्वास्थ्य'],
  'bills': ['electricity', 'water', 'gas', 'internet', 'phone', 'bill', 'utility', 'recharge', 'बिल'],
  'education': ['book', 'course', 'tuition', 'college', 'university', 'education', 'study', 'शिक्षा'],
  'travel': ['flight', 'hotel', 'booking', 'travel', 'vacation', 'trip', 'यात्रा']
};

// Enhanced utility to generate meaningful mock transactions
function generateMockTransactions(count: number, categories: Array<{ value: string; label: string; emoji: string; color: string }>): ProcessedTransaction[] {
  const categoryValues = categories.map(c => c.value);
  const transactions: ProcessedTransaction[] = [];
  
  // Helper to generate a realistic time string (HH:mm)
  const generateCategoryTime = (category: string): string => {
    const minute = faker.number.int({ min: 0, max: 59 });
    let hour = faker.number.int({ min: 0, max: 23 });
    // Optionally, use category-specific logic for hour
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Realistic transaction descriptions by category
  const categoryDescriptions = {
    'food': [
      'McDonald\'s', 'Starbucks Coffee', 'Pizza Hut', 'Subway', 'KFC', 'Domino\'s Pizza',
      'Burger King', 'Taco Bell', 'Chipotle', 'Panera Bread', 'Dunkin\' Donuts',
      'Wendy\'s', 'Popeyes', 'Chick-fil-A', 'Five Guys', 'Shake Shack',
      'Grocery Store', 'Supermarket', 'Local Restaurant', 'Food Delivery', 'Catering'
    ],
    'transport': [
      'Uber Ride', 'Lyft', 'Taxi', 'Bus Fare', 'Metro Card', 'Train Ticket',
      'Gas Station', 'Shell', 'Exxon', 'BP', 'Chevron', 'Parking Fee',
      'Car Wash', 'Auto Repair', 'Oil Change', 'Tire Service', 'Car Insurance',
      'Public Transport', 'Bike Share', 'Scooter Rental'
    ],
    'shopping': [
      'Amazon.com', 'Walmart', 'Target', 'Best Buy', 'Home Depot', 'Lowe\'s',
      'Macy\'s', 'Nordstrom', 'Nike Store', 'Adidas', 'Apple Store', 'Microsoft Store',
      'GameStop', 'Barnes & Noble', 'Michaels', 'Hobby Lobby', 'PetSmart',
      'Online Shopping', 'Clothing Store', 'Electronics Store'
    ],
    'entertainment': [
      'Netflix', 'Disney+', 'Hulu', 'Amazon Prime', 'HBO Max', 'Spotify',
      'Apple Music', 'YouTube Premium', 'Movie Theater', 'Concert Tickets',
      'Theme Park', 'Museum', 'Zoo', 'Aquarium', 'Bowling Alley', 'Arcade',
      'Gaming Store', 'Book Store', 'Art Gallery', 'Theater Show'
    ],
    'health': [
      'CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Doctor Visit', 'Dentist',
      'Hospital', 'Medical Center', 'Gym Membership', 'Personal Trainer',
      'Yoga Class', 'Pilates', 'Physical Therapy', 'Chiropractor',
      'Optometrist', 'Dermatologist', 'Specialist', 'Medical Supplies',
      'Health Insurance', 'Prescription', 'Vitamins'
    ],
    'bills': [
      'Electricity Bill', 'Water Bill', 'Gas Bill', 'Internet Service',
      'Phone Bill', 'Cable TV', 'Home Insurance', 'Car Insurance',
      'Life Insurance', 'Property Tax', 'HOA Fees', 'Rent Payment',
      'Mortgage Payment', 'Credit Card Payment', 'Loan Payment',
      'Utility Bill', 'Maintenance Fee', 'Service Charge'
    ],
    'education': [
      'University Tuition', 'College Books', 'Online Course', 'Tutoring',
      'Language Class', 'Music Lessons', 'Art Class', 'Cooking Class',
      'Workshop', 'Seminar', 'Conference', 'Training Program',
      'Certification', 'Exam Fee', 'Student Loan', 'School Supplies',
      'Library Fee', 'Research Materials', 'Academic Software'
    ],
    'travel': [
      'Airline Ticket', 'Hotel Booking', 'Car Rental', 'Travel Insurance',
      'Vacation Package', 'Cruise', 'Tour Guide', 'Souvenirs',
      'Airport Parking', 'Baggage Fee', 'Travel Visa', 'Passport Fee',
      'Tourist Attraction', 'Beach Resort', 'Mountain Lodge', 'City Tour',
      'Adventure Sports', 'Cultural Experience', 'Business Trip'
    ],
    'other': [
      'ATM Withdrawal', 'Bank Transfer', 'Cash Deposit', 'Service Fee',
      'Late Fee', 'Overdraft Fee', 'Interest Payment', 'Investment',
      'Charity Donation', 'Gift Purchase', 'Pet Care', 'Home Improvement',
      'Legal Services', 'Tax Preparation', 'Financial Advisor', 'Consulting',
      'Membership Fee', 'Subscription', 'Miscellaneous', 'Unknown Transaction'
    ]
  };

  // Generate transactions with realistic patterns
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categoryValues);
    const descriptions = categoryDescriptions[category as keyof typeof categoryDescriptions] || categoryDescriptions.other;
    const description = faker.helpers.arrayElement(descriptions);
    
    // Generate realistic amounts based on category
    let amount: number;
    switch (category) {
      case 'food':
        amount = parseFloat(faker.finance.amount(5, 150, 2));
        break;
      case 'transport':
        amount = parseFloat(faker.finance.amount(10, 200, 2));
        break;
      case 'shopping':
        amount = parseFloat(faker.finance.amount(20, 500, 2));
        break;
      case 'entertainment':
        amount = parseFloat(faker.finance.amount(10, 300, 2));
        break;
      case 'health':
        amount = parseFloat(faker.finance.amount(15, 500, 2));
        break;
      case 'bills':
        amount = parseFloat(faker.finance.amount(50, 1000, 2));
        break;
      case 'education':
        amount = parseFloat(faker.finance.amount(25, 2000, 2));
        break;
      case 'travel':
        amount = parseFloat(faker.finance.amount(100, 5000, 2));
        break;
      default:
        amount = parseFloat(faker.finance.amount(5, 500, 2));
    }

    // Generate dates within the last 12 months with realistic patterns
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    const endDate = new Date();
    
    // Create more realistic date distribution (more recent transactions)
    const randomDays = Math.pow(Math.random(), 2) * (endDate.getTime() - startDate.getTime());
    const date = new Date(startDate.getTime() + randomDays);
    // Generate time
    const time = generateCategoryTime(category);

    transactions.push({
      id: `mock-${i}-${Date.now()}`,
      amount,
      description,
      category,
      date: date.toISOString().split('T')[0],
      time,
      isValid: true,
      errors: []
    });
  }

  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const CSVImport: React.FC<CSVImportProps> = ({
  onImportTransactions,
  categories,
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<ProcessedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBank, setSelectedBank] = useState('generic');
  const [selectedCount, setSelectedCount] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasApiKey = Boolean(import.meta.env.VITE_PERPLEXITY_API_KEY || import.meta.env.PERPLEXITY_API_KEY);

  const detectBankFormat = (headers: string[]): string => {
    const headerString = headers.join(' ').toLowerCase();
    
    if (headerString.includes('hdfc') || headerString.includes('withdrawal amt')) return 'hdfc';
    if (headerString.includes('sbi') || headerString.includes('narration')) return 'sbi';
    if (headerString.includes('icici') || headerString.includes('debit')) return 'icici';
    if (headerString.includes('axis') || headerString.includes('debit amount')) return 'axis';
    
    return 'generic';
  };

  const smartCategoryMapping = (description: string): string => {
    const desc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  };

  const processCSVData = (csvRows: CSVRow[]): ProcessedTransaction[] => {
    const format = BANK_FORMATS[selectedBank as keyof typeof BANK_FORMATS];
    const processed: ProcessedTransaction[] = [];

    csvRows.forEach((row, index) => {
      const errors: string[] = [];
      let isValid = true;

      // Extract data based on bank format
      const dateStr = row[format.date] || row['Date'] || row['Transaction Date'];
      const amountStr = row[format.amount] || row['Amount'] || row['Debit'] || row['Withdrawal Amt.'];
      const description = row[format.description] || row['Description'] || row['Narration'] || row['Transaction Remarks'];
      const category = row[format.category] || smartCategoryMapping(description);

      // Validate date
      let date = '';
      if (dateStr) {
        try {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
          } else {
            errors.push('Invalid date format');
            isValid = false;
          }
        } catch {
          errors.push('Invalid date format');
          isValid = false;
        }
      } else {
        errors.push('Date is required');
        isValid = false;
      }

      // Validate amount
      let amount = 0;
      if (amountStr) {
        const cleanAmount = amountStr.replace(/[^\d.-]/g, '');
        amount = parseFloat(cleanAmount);
        if (isNaN(amount)) {
          errors.push('Invalid amount format');
          isValid = false;
        }
      } else {
        errors.push('Amount is required');
        isValid = false;
      }

      // Validate description
      if (!description || description.trim().length === 0) {
        errors.push('Description is required');
        isValid = false;
      }

      // Validate category exists
      const categoryExists = categories.find(c => c.value === category);
      if (!categoryExists) {
        errors.push('Category not found');
        isValid = false;
      }

      processed.push({
        id: `csv-${index}`,
        amount: Math.abs(amount), // Always positive for expenses
        description: description.trim(),
        category: categoryExists ? category : 'other',
        date,
        isValid,
        errors
      });
    });

    return processed;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const csvRows = parseCSV(csvText);
        
        if (csvRows.length === 0) {
          alert('No valid data found in CSV file');
          setIsProcessing(false);
          return;
        }

        // Auto-detect bank format
        const detectedBank = detectBankFormat(Object.keys(csvRows[0]));
        setSelectedBank(detectedBank);

        const processed = processCSVData(csvRows);
        setCsvData(processed);
        setShowPreview(true);
      } catch (error) {
        alert('Error processing CSV file: ' + error);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    const validTransactions = csvData
      .filter(t => t.isValid)
      .map(t => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: t.date,
        time: t.time,
        createdAt: new Date().toISOString()
      }));

    if (validTransactions.length === 0) {
      alert('No valid transactions to import');
      return;
    }

    onImportTransactions(validTransactions);
    setIsOpen(false);
    setCsvData([]);
    setShowPreview(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getValidCount = () => csvData.filter(t => t.isValid).length;
  const getInvalidCount = () => csvData.filter(t => !t.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`flex items-center gap-2 ${darkMode ? 'border-[#35365a] text-[#e6e6fa] hover:bg-[#2d2e4a]' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#23243a] border-[#35365a] text-[#e6e6fa]' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Transactions from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          {!showPreview && (
            <Card className={darkMode ? 'bg-[#2d2e4a] border-[#35365a]' : 'bg-gray-50'}>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload your bank statement</h3>
                    <p className={`text-sm ${darkMode ? 'text-[#b3baff]' : 'text-gray-600'}`}>
                      Supported formats: HDFC, SBI, ICICI, Axis Bank, and generic CSV
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] hover:from-[#3dd1af] hover:to-[#5b52ef]"
                    >
                      {isProcessing ? 'Processing...' : 'Choose CSV File'}
                    </Button>
                    {/* Mock Data Generation Section */}
                    {hasApiKey && (
                      <div className="space-y-2 mt-4 p-4 border border-dashed border-[#4de3c1] rounded-lg">
                        <div className="text-center">
                          <h4 className="font-semibold text-[#4de3c1] mb-2">Generate Mock Data</h4>
                          <div className="flex items-center gap-2 justify-center">
                            <label className={`text-sm font-medium ${darkMode ? 'text-[#e6e6fa]' : 'text-gray-700'}`}>
                              Transaction Count:
                            </label>
                            <select
                              value={selectedCount}
                              onChange={(e) => setSelectedCount(Number(e.target.value))}
                              className={`p-2 rounded-md border text-sm ${
                                darkMode 
                                  ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' 
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <option value={10}>10</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                              <option value={500}>500</option>
                              <option value={1000}>1,000</option>
                              <option value={5000}>5,000</option>
                              <option value={10000}>10,000</option>
                            </select>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const mockData = generateMockTransactions(selectedCount, categories);
                            setCsvData(mockData);
                            setShowPreview(true);
                          }}
                          variant="outline"
                          className="w-full border-[#4de3c1] text-[#4de3c1] hover:bg-[#4de3c1] hover:text-[#181b2e]"
                        >
                          Generate {selectedCount.toLocaleString()} Mock Transactions
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bank Format Selection */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${darkMode ? 'text-[#e6e6fa]' : 'text-gray-700'}`}>
                      Bank Format (Auto-detected)
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className={`w-full p-2 rounded-md border ${
                        darkMode 
                          ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="generic">Generic CSV</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && csvData.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className={darkMode ? 'bg-[#2d2e4a] border-[#35365a]' : 'bg-green-50 border-green-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{getValidCount()} valid transactions</span>
                      </div>
                      {getInvalidCount() > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">{getInvalidCount()} invalid transactions</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className={darkMode ? 'border-[#35365a] text-[#e6e6fa]' : ''}
                      >
                        {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={getValidCount() === 0}
                        className="bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e]"
                      >
                        Import {getValidCount()} Transactions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Preview Table */}
              {showPreview && (
                <Card className={darkMode ? 'bg-[#2d2e4a] border-[#35365a]' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className={darkMode ? 'border-[#35365a]' : undefined}>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Status</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Date</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Time</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Amount</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Description</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Category</TableHead>
                            <TableHead className={darkMode ? 'text-[#e6e6fa]' : undefined}>Errors</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvData.slice(0, 10).map((transaction, index) => (
                            <TableRow key={index} className={darkMode ? 'border-[#35365a]' : undefined}>
                              <TableCell>
                                {transaction.isValid ? (
                                  <Badge className="bg-green-100 text-green-800">Valid</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">Invalid</Badge>
                                )}
                              </TableCell>
                              <TableCell className={darkMode ? 'text-[#e6e6fa]' : undefined}>
                                {transaction.date}
                              </TableCell>
                              <TableCell className={darkMode ? 'text-[#e6e6fa]' : undefined}>
                                {transaction.time || '-'}
                              </TableCell>
                              <TableCell className={darkMode ? 'text-[#e6e6fa]' : undefined}>
                                ${transaction.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className={darkMode ? 'text-[#e6e6fa] max-w-xs truncate' : 'max-w-xs truncate'}>
                                {transaction.description}
                              </TableCell>
                              <TableCell>
                                <Badge className={categories.find(c => c.value === transaction.category)?.color || 'bg-gray-100 text-gray-800'}>
                                  {categories.find(c => c.value === transaction.category)?.emoji} {transaction.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                {transaction.errors.length > 0 ? (
                                  <div className="text-xs text-red-500">
                                    {transaction.errors.join(', ')}
                                  </div>
                                ) : (
                                  <span className="text-green-500">✓</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {csvData.length > 10 && (
                      <div className={`text-sm mt-2 ${darkMode ? 'text-[#b3baff]' : 'text-gray-600'}`}>
                        Showing first 10 rows of {csvData.length} total rows
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 