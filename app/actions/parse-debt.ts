'use server'

import { GoogleGenAI } from '@google/genai'

export interface ParsedDebt {
  person: string
  amount: number
  currency: string
  direction: 'owe' | 'owed'
  note: string | null
  date: string | null
}

type ParseResult = {
  success: true
  data: ParsedDebt
} | {
  success: false
  error: string
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function parseDebt (
  text: string,
  knownPeople: string[],
  userCurrency: string = 'USD'
): Promise<ParseResult> {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'Gemini API key not configured' }
  }

  if (!text.trim()) {
    return { success: false, error: 'No text provided' }
  }

  const prompt = `You are a debt parsing assistant. The user will provide text describing a debt between people.

Text: "${text}"

Known people: ${knownPeople.length > 0 ? knownPeople.join(', ') : 'none'}

Extract the following information and return ONLY a valid JSON object with no markdown, no explanation, no extra text:

{
  "person": "name of the other person involved",
  "amount": 0.00,
  "currency": "USD",
  "direction": "owe" | "owed",
  "note": "brief description of what it was for",
  "date": "YYYY-MM-DD or null if not mentioned"
}

Rules:
- "direction" is "owe" if the user owes the other person, "owed" if the other person owes the user
- "person" should be just a first name, capitalized. If a name matches one in the known people list (case-insensitive), use the exact casing from the list.
- "amount" must be a positive number
- "note" should be short (max 8 words), or null if not mentioned
- "currency" defaults to ${userCurrency} if not mentioned
- "date" should be YYYY-MM-DD if mentioned, null otherwise. Today is ${new Date().toISOString().slice(0, 10)}.
- If you cannot confidently extract a person and amount, return: { "error": "Could not parse debt details" }

Examples:
- "Sarah owes me 20 dollars for lunch" → {"person":"Sarah","amount":20.00,"currency":"USD","direction":"owed","note":"lunch","date":null}
- "I paid 500 shillings for John's matatu" → {"person":"John","amount":500.00,"currency":"KES","direction":"owed","note":"matatu fare","date":null}
- "I owe Tom fifty for the concert last Friday" → {"person":"Tom","amount":50.00,"currency":"${userCurrency}","direction":"owe","note":"concert tickets","date":null}`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    const raw = (response.text ?? '').trim()

    const parsed = JSON.parse(raw)

    if (parsed.error) {
      return { success: false, error: parsed.error }
    }

    if (!parsed.person || typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      return { success: false, error: 'Could not extract a valid debt from that' }
    }

    if (parsed.direction !== 'owe' && parsed.direction !== 'owed') {
      parsed.direction = 'owed'
    }

    return {
      success: true,
      data: {
        person: parsed.person,
        amount: parsed.amount,
        currency: parsed.currency || userCurrency,
        direction: parsed.direction,
        note: parsed.note || null,
        date: parsed.date || null,
      },
    }
  } catch {
    return {
      success: false,
      error: 'Failed to parse your input. Try something like "Sarah owes me $30 for lunch".',
    }
  }
}
