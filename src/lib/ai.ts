import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('Google AI API key not found');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateSummary(text: string): Promise<{ short: string; detailed: string }> {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const [shortResult, detailedResult] = await Promise.all([
    model.generateContent(`Summarize in 2-3 sentences:\n\n${text}`),
    model.generateContent(`Provide detailed summary (5-8 sentences):\n\n${text}`),
  ]);

  return {
    short: shortResult.response.text().trim(),
    detailed: detailedResult.response.text().trim(),
  };
}

export async function generateFlashcards(topic: string, count: number = 8) {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create ${count} flashcards about "${topic}".
Format: Q: [question]
A: [answer]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const flashcards = [];
  const lines = text.split('\n').filter(line => line.trim());

  let q = '', a = '';
  for (const line of lines) {
    if (line.startsWith('Q:')) {
      q = line.substring(2).trim();
    } else if (line.startsWith('A:')) {
      a = line.substring(2).trim();
      if (q && a) {
        flashcards.push({
          id: Date.now().toString() + Math.random(),
          question: q,
          answer: a,
          known: false,
        });
        q = '';
        a = '';
      }
    }
  }

  return flashcards.slice(0, count);
}

export async function generateQuiz(topic: string, count: number = 8) {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create ${count} multiple-choice questions about "${topic}".
Format:
Q: [question]
A) [option1]
B) [option2]
C) [option3]
D) [option4]
CORRECT: [A/B/C/D]
EXPLANATION: [explanation]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const questions = [];
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim());
    let question = '', options = [], correct = 0, explanation = '';

    for (const line of lines) {
      if (line.startsWith('Q:')) question = line.substring(2).trim();
      else if (/^[A-D]\)/.test(line)) options.push(line.substring(2).trim());
      else if (line.startsWith('CORRECT:')) correct = line.substring(8).trim().charCodeAt(0) - 65;
      else if (line.startsWith('EXPLANATION:')) explanation = line.substring(12).trim();
    }

    if (question && options.length === 4) {
      questions.push({
        id: Date.now().toString() + Math.random(),
        question,
        options,
        correctAnswer: Math.max(0, Math.min(3, correct)),
        explanation,
      });
    }
  }

  return questions.slice(0, count);
}

export async function generateOutline(topic: string): Promise<string> {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`Create an essay outline for: "${topic}"`);
  return result.response.text().trim();
}

export async function generateCitations(sources: string[], format: 'mla' | 'apa'): Promise<string[]> {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`Generate 5 example ${format.toUpperCase()} citations`);
  return result.response.text().split('\n').filter(l => l.trim()).slice(0, 5);
}

export async function checkGrammar(text: string) {
  if (!genAI) throw new Error('AI service not configured');

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`Check grammar in: "${text}". List issues as: ISSUE: [text] | FIX: [fix]`);
  const issues = [];
  const lines = result.response.text().split('\n');

  for (const line of lines) {
    if (line.includes('ISSUE:')) {
      const match = line.match(/ISSUE:\s*(.+?)\s*\|\s*FIX:\s*(.+)/);
      if (match) {
        issues.push({
          original: match[1].trim(),
          suggestion: match[2].trim(),
          type: 'grammar',
        });
      }
    }
  }

  return issues;
}
