

export interface ParsedInput {
  amount?: number;
  description?: string;
  date?: string;
  time?: string;
  category?: string;
}


// Accepts categories as an argument for dynamic matching
export const parseNaturalInput = (input: string, categories?: { value: string; label: string; emoji: string; color: string }[]): ParsedInput | null => {
  const result: ParsedInput = {};
  const text = input.trim().toLowerCase();

  // 1. Amount: first number in the string
  const amountMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1]);
  }

  // 2. Date: look for today, yesterday, last week, or explicit/natural dates
  const today = new Date();
  let dateRaw = '';
  if (/yesterday/.test(text)) {
    const d = new Date(today);
    d.setDate(today.getDate() - 1);
    result.date = d.toISOString().split('T')[0];
    dateRaw = 'yesterday';
  } else if (/today/.test(text)) {
    result.date = today.toISOString().split('T')[0];
    dateRaw = 'today';
  } else if (/last week/.test(text)) {
    const d = new Date(today);
    d.setDate(today.getDate() - 7);
    result.date = d.toISOString().split('T')[0];
    dateRaw = 'last week';
  } else {
    // dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, yyyy/mm/dd
    let dateMatch = text.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
    if (dateMatch) {
      // Try to parse as dd-mm-yyyy or dd/mm/yyyy
      let day = dateMatch[1].padStart(2, '0');
      let month = dateMatch[2].padStart(2, '0');
      let year = dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3];
      // If year is first, swap
      if (parseInt(year) > 1900 && parseInt(day) > 12) {
        // yyyy-mm-dd
        [year, month, day] = [dateMatch[1], dateMatch[2], dateMatch[3]];
      }
      result.date = `${year}-${month}-${day}`;
      dateRaw = dateMatch[0];
    } else {
      // Natural language: 3rd of July 2025, July 3, 2025, 3 July 2025
      let natDateMatch = text.match(/(\d{1,2})(st|nd|rd|th)?\s*(of)?\s*([a-zA-Z]+)\s*(\d{4})/);
      if (natDateMatch) {
        // e.g. 3rd of July 2025
        let day = natDateMatch[1].padStart(2, '0');
        let monthName = natDateMatch[4];
        let year = natDateMatch[5];
        try {
          let parsed = new Date(`${monthName} ${day}, ${year}`);
          if (!isNaN(parsed.getTime())) {
            result.date = parsed.toISOString().split('T')[0];
            dateRaw = natDateMatch[0];
          }
        } catch {}
      } else {
        // July 3, 2025 or July 3rd, 2025
        let natDateMatch2 = text.match(/([a-zA-Z]+)\s*(\d{1,2})(st|nd|rd|th)?,?\s*(\d{4})/);
        if (natDateMatch2) {
          let monthName = natDateMatch2[1];
          let day = natDateMatch2[2].padStart(2, '0');
          let year = natDateMatch2[4];
          try {
            let parsed = new Date(`${monthName} ${day}, ${year}`);
            if (!isNaN(parsed.getTime())) {
              result.date = parsed.toISOString().split('T')[0];
              dateRaw = natDateMatch2[0];
            }
          } catch {}
        }
      }
    }
  }

  // 3. Time: match "at 3 pm", "at 15:30", "at 3:30pm", "at 3pm", "at 3"
  let timeMatch = text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!timeMatch) {
    // fallback: just "3pm" or "15:30" or "3:30pm"
    timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  }
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    let minute = timeMatch[2] ? timeMatch[2] : '00';
    let ampm = timeMatch[3];
    if (ampm) {
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
    }
    result.time = `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // 4. Category: match by keyword from categories or fallback
  let foundCat = '';
  if (categories && categories.length > 0) {
    for (const cat of categories) {
      if (text.includes(cat.label.toLowerCase()) || text.includes(cat.value.toLowerCase())) {
        foundCat = cat.value;
        break;
      }
    }
  }
  if (!foundCat) {
    if (/food|grocery|restaurant/.test(text)) foundCat = 'food';
    else if (/transport|bus|train|uber|taxi|cab/.test(text)) foundCat = 'transport';
    else if (/shop|clothes|amazon|mall/.test(text)) foundCat = 'shopping';
    else if (/entertainment|movie|cinema|netflix/.test(text)) foundCat = 'entertainment';
    else if (/health|doctor|pharmacy|medicine/.test(text)) foundCat = 'health';
    else if (/bill|utility|electric|water|gas bill/.test(text)) foundCat = 'bills';
    else if (/education|school|college|course/.test(text)) foundCat = 'education';
    else if (/travel|flight|hotel|trip/.test(text)) foundCat = 'travel';
    else foundCat = 'other';
  }
  result.category = foundCat;

  // 5. Description: everything after amount, before date/time/category
  // Try to remove amount, date, time, and category words from input
  let desc = text;
  if (amountMatch) desc = desc.replace(amountMatch[0], '');
  if (dateRaw) desc = desc.replace(dateRaw, '');
  else if (result.date) desc = desc.replace(/yesterday|today|last week|\d{4}-\d{2}-\d{2}/, '');
  if (timeMatch) desc = desc.replace(timeMatch[0], '');
  if (foundCat) desc = desc.replace(foundCat, '');
  result.description = desc.replace(/spent|paid|bought|on|for|at|add|\s+/g, ' ').trim();

  // If nothing found, return null
  if (!result.amount && !result.description && !result.category && !result.date && !result.time) return null;
  return result;
};
