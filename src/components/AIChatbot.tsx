import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatbot: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am your AI finance assistant. Ask me anything about your spending, trends, or get recommendations!' }
  ]);
  // Store the latest raw AI response for robust popup extraction
  const [lastRawAIResponse, setLastRawAIResponse] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are a financial analyst. When asked for a budget analysis, always respond with a markdown table with columns: Category, Planned Amount, Actual Amount, Variance, Action. If you can't fill a value, use '-'. Otherwise, respond with concise, actionable, platform-specific advice, analysis, and predictions based on the user's transaction data.` },
            { role: 'user', content: `User data: ${JSON.stringify(transactions)}. User prompt: ${input}` }
          ]
        })
      });
      const data = await res.json();
      // Structure and beautify the AI response

      let aiContent = data.choices?.[0]?.message?.content || 'No response.';
      setLastRawAIResponse(aiContent); // Save the raw AI response for popup extraction

      // Remove asterisks, markdown, and reference numbers like [2][3]
      aiContent = aiContent
        .replace(/\*+/g, '')
        .replace(/_/g, '')
        .replace(/\[\d+\]/g, '') // Remove [2], [3], etc.
        .replace(/\[(\d+,?\s?)+\]/g, ''); // Remove [2, 3], [1,2], etc.

      // Extract transaction summary and actionable steps if present
      const summaryMatch = aiContent.match(/Transaction details:?([\s\S]*?)(?:Actionable|Advice|Tips|$)/i);
      const stepsMatch = aiContent.match(/(?:Actionable|Advice|Tips)[^\n]*:?([\s\S]*)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      const steps = stepsMatch ? stepsMatch[1].trim() : '';

      // Parse summary into key-value pairs for table and for text output
      let tableRows = '';
      let textRows = '';
      if (summary) {
        const lines = summary.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
        tableRows = lines.map(line => {
          const parts = line.split(/:|：/);
          if (parts.length >= 2) {
            const key = parts[0].replace(/Amount/i, 'Amount').replace(/Category/i, 'Category').replace(/Date/i, 'Date').replace(/Description/i, 'Description').replace(/Transaction ID/i, 'ID');
            let emoji = '';
            if (/amount/i.test(key)) emoji = '💵';
            else if (/category/i.test(key)) emoji = '🏷️';
            else if (/date/i.test(key)) emoji = '📅';
            else if (/description/i.test(key)) emoji = '📝';
            else if (/id/i.test(key)) emoji = '🆔';
            return `<tr><td class='pr-2 font-semibold'>${emoji} ${key}</td><td>${parts.slice(1).join(':').trim()}</td></tr>`;
          }
          return '';
        }).join('');
        textRows = lines.map(line => {
          const parts = line.split(/:|：/);
          if (parts.length >= 2) {
            const key = parts[0].replace(/Amount/i, 'Amount').replace(/Category/i, 'Category').replace(/Date/i, 'Date').replace(/Description/i, 'Description').replace(/Transaction ID/i, 'ID');
            let emoji = '';
            if (/amount/i.test(key)) emoji = '💵';
            else if (/category/i.test(key)) emoji = '🏷️';
            else if (/date/i.test(key)) emoji = '📅';
            else if (/description/i.test(key)) emoji = '📝';
            else if (/id/i.test(key)) emoji = '🆔';
            return `${emoji} <b>${key}:</b> ${parts.slice(1).join(':').trim()}`;
          }
          return '';
        }).filter(Boolean).join('<br/>');
      }

      // Parse steps into point-wise steps with right emojis
      // Also, make the steps more concise and user-friendly
      let stepsHtml = '';
      let stepsText = '';
      if (steps) {
        const stepLines = steps.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
        stepsHtml = stepLines.map((line, idx) => {
          // Remove reference numbers and make concise
          let cleanLine = line.replace(/\[\d+\]/g, '').replace(/\[(\d+,?\s?)+\]/g, '');
          // Shorten overly long sentences
          if (cleanLine.length > 180) {
            cleanLine = cleanLine.slice(0, 170).trim() + '...';
          }
          // Use different emojis for each step
          let emoji = '👉';
          if (/track|monitor/i.test(cleanLine)) emoji = '🔎';
          else if (/set|limit|cap/i.test(cleanLine)) emoji = '🎯';
          else if (/review|analyze|check/i.test(cleanLine)) emoji = '📊';
          else if (/save|saving/i.test(cleanLine)) emoji = '💡';
          else if (/spend|expense|budget/i.test(cleanLine)) emoji = '💸';
          else if (/goal|target/i.test(cleanLine)) emoji = '🏆';
          else if (/tip|advice|suggest/i.test(cleanLine)) emoji = '✨';
          else if (/diversify|diversification/i.test(cleanLine)) emoji = '🎯';
          else if (/tools|platform|automate/i.test(cleanLine)) emoji = '🤖';
          return `<li class='mb-2'><span class='mr-1'>${emoji}</span>${cleanLine}</li>`;
        }).join('');
        stepsText = stepLines.map((line, idx) => {
          let cleanLine = line.replace(/\[\d+\]/g, '').replace(/\[(\d+,?\s?)+\]/g, '');
          if (cleanLine.length > 180) {
            cleanLine = cleanLine.slice(0, 170).trim() + '...';
          }
          let emoji = '👉';
          if (/track|monitor/i.test(cleanLine)) emoji = '🔎';
          else if (/set|limit|cap/i.test(cleanLine)) emoji = '🎯';
          else if (/review|analyze|check/i.test(cleanLine)) emoji = '📊';
          else if (/save|saving/i.test(cleanLine)) emoji = '💡';
          else if (/spend|expense|budget/i.test(cleanLine)) emoji = '💸';
          else if (/goal|target/i.test(cleanLine)) emoji = '🏆';
          else if (/tip|advice|suggest/i.test(cleanLine)) emoji = '✨';
          else if (/diversify|diversification/i.test(cleanLine)) emoji = '🎯';
          else if (/tools|platform|automate/i.test(cleanLine)) emoji = '🤖';
          return `${emoji} ${cleanLine}`;
        }).join('<br/>');
      }

      // Try to render markdown tables as HTML if present, else show a button for code/table blocks
      let html = '';
      // More robust: Detect markdown tables anywhere, even with leading/trailing text or whitespace
      const markdownTableRegex = /(^|\n)\s*\|(.+\|)+\n\s*\|[-:| ]+\|?\n([\s\S]+?)(?=\n\s*\n|$)/m;
      const codeBlockRegex = /```([\s\S]*?)```/g;
      const mdTableMatch = aiContent.match(markdownTableRegex);
      const codeBlockMatch = aiContent.match(codeBlockRegex);
      if (mdTableMatch) {
        html += `<button class='ai-popup-btn bg-white/10 border border-[#4de3c1] text-[#4de3c1] px-3 py-1 rounded-lg mb-2 hover:bg-[#4de3c1]/10 transition' data-type='table'>Show Table</button>`;
      } else if (codeBlockMatch) {
        html += `<button class='ai-popup-btn bg-white/10 border border-[#4de3c1] text-[#4de3c1] px-3 py-1 rounded-lg mb-2 hover:bg-[#4de3c1]/10 transition' data-type='code'>Show Code</button>`;
      } else if (tableRows) {
        html += `<table class='w-full mb-2 text-sm border-separate border-spacing-y-1'><tbody>${tableRows}</tbody></table>`;
      }
      if (stepsHtml) {
        html += `<ol class='list-decimal pl-5 mb-2'>${stepsHtml}</ol>`;
      }
      if (!html) {
        html = `<div>${aiContent}</div>`;
      }

      setMessages((msgs) => [...msgs, { role: 'assistant', content: html }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { role: 'assistant', content: 'Sorry, there was an error contacting the AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for popup button click
  // Robust popup handler: always use the latest raw AI response
  const popupHandler = useCallback((e: any) => {
    if (e.target && e.target.classList && e.target.classList.contains('ai-popup-btn')) {
      const type = e.target.getAttribute('data-type');
      if (type === 'table') {
        // Use the latest raw AI response for table extraction
        const markdownTableRegex = /(^|\n)\s*\|(.+\|)+\n\s*\|[-:| ]+\|?\n([\s\S]+?)(?=\n\s*\n|$)/m;
        const mdTableMatch = lastRawAIResponse.match(markdownTableRegex);
        if (mdTableMatch) {
          const lines = mdTableMatch[0].split('\n').filter(Boolean);
          // Find the header row (first line starting with |)
          const headerLine = lines.find(line => line.trim().startsWith('|')) || lines[0];
          const header = headerLine.split('|').map(s => s.trim()).filter(Boolean);
          // Find all rows after the separator (---)
          const sepIdx = lines.findIndex(line => /^\s*\|?[-:| ]+\|?\s*$/.test(line));
          const rows = sepIdx >= 0 ? lines.slice(sepIdx + 1) : lines.slice(2);
          const rowCells = rows.map(row => row.split('|').map(s => s.trim()).filter(Boolean));
          const tableHtml = `<table class='w-full mb-2 text-base border-separate border-spacing-y-1'><thead><tr>${header.map(h => `<th class='font-bold border-b border-[#35365a] px-2 py-1'>${h}</th>`).join('')}</tr></thead><tbody>${rowCells.map(r => `<tr>${r.map(cell => `<td class='px-2 py-1'>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
          setPopupContent(tableHtml);
        } else {
          setPopupContent('<div class="text-red-400">No markdown table found in the AI response.</div>');
        }
      } else if (type === 'code') {
        const codeBlockRegex = /```([\s\S]*?)```/g;
        const codeBlocks = [...lastRawAIResponse.matchAll(codeBlockRegex)];
        if (codeBlocks.length > 0) {
          setPopupContent(`<pre class='bg-[#23243a] text-[#4de3c1] p-4 rounded-lg overflow-x-auto'><code>${codeBlocks.map(m => m[1]).join('\n')}</code></pre>`);
        } else {
          setPopupContent('<div class="text-red-400">No code block found in the AI response.</div>');
        }
      }
    }
  }, [lastRawAIResponse]);

  useEffect(() => {
    document.addEventListener('click', popupHandler);
    return () => document.removeEventListener('click', popupHandler);
  }, [popupHandler]);

  return (
    <>
      {/* Floating Chatbot Icon */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[#4de3c1] to-[#6c63ff] p-4 rounded-full shadow-lg hover:scale-110 transition-all"
        onClick={() => setOpen(true)}
        aria-label="Open AI Chatbot"
        style={{ display: open ? 'none' : 'block' }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
      {/* Chatbot Popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md m-6 bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#35365a] rounded-2xl shadow-2xl flex flex-col h-[70vh]">
            <button className="absolute top-3 right-3 text-[#4de3c1] hover:text-white" onClick={() => setOpen(false)} aria-label="Close chatbot"><X className="w-6 h-6" /></button>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`whitespace-pre-line ${msg.role === 'user' ? 'text-right' : 'text-left'}`}> 
                  {msg.role === 'user' ? (
                    <span className="inline-block px-3 py-2 rounded-lg max-w-[80%] bg-[#4de3c1] text-[#181b2e] ml-auto">
                      {msg.content}
                    </span>
                  ) : (
                    <span
                      className="inline-block px-3 py-2 rounded-lg max-w-[80%] bg-[#35365a] text-[#e6e6fa] text-left"
                      style={{ wordBreak: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                    />
                  )}
                </div>
              ))}
              {loading && <div className="text-[#b3baff]">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-[#35365a] bg-[#23243a] flex gap-2">
              <input
                className="flex-1 rounded-lg px-4 py-2 bg-[#181b2e] text-white border border-[#35365a] focus:outline-none focus:ring-2 focus:ring-[#4de3c1]"
                placeholder="Ask about your finances..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button type="submit" className="bg-[#4de3c1] text-[#181b2e] px-4 py-2 rounded-lg font-bold hover:bg-[#38bfa1] transition" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Popup for table/code */}
      {popupContent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur" onClick={() => setPopupContent(null)} />
          <div className="relative bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#4de3c1] rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <button className="absolute top-3 right-3 text-[#4de3c1] hover:text-white" onClick={() => setPopupContent(null)} aria-label="Close popup"><X className="w-6 h-6" /></button>
            <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: popupContent }} />
          </div>
        </div>
      )}
    </>
  );
};
