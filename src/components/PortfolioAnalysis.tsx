import React, { useEffect, useState } from 'react';

interface PortfolioAnalysisProps {
  transactions: any[];
}

const fetchPortfolioAnalysis = async (transactions: any[]) => {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || import.meta.env.PERPLEXITY_API_KEY;
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'pplx-70b-online',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst. Given a list of transactions, provide a concise, insightful portfolio analysis and spending advice.'
        },
        {
          role: 'user',
          content: `Here are my transactions: ${JSON.stringify(transactions)}. Please analyze my spending and give advice.`
        }
      ]
    })
  });
  if (!response.ok) throw new Error('Failed to fetch analysis');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No analysis available.';
};

export const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactions.length === 0) return;
    setLoading(true);
    setError(null);
    fetchPortfolioAnalysis(transactions)
      .then(setAnalysis)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [transactions]);

  return (
    <div className="mt-8 p-6 rounded-xl shadow-lg bg-gradient-to-br from-[#23243a] to-[#2d2e4a] text-[#e6e6fa] border border-[#35365a]">
      <h2 className="text-2xl font-bold mb-2 text-[#4de3c1]">AI Portfolio Analysis</h2>
      {loading && <p>Analyzing your portfolio...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && (
        <p className="whitespace-pre-line">{analysis || 'Add transactions to get an AI-powered analysis of your spending.'}</p>
      )}
    </div>
  );
};
