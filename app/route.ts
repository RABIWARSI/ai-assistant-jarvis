import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type UIMessage,
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { webSearch as runWebSearch } from '@/lib/search'

// Use the standard OpenAI API directly with your own key, so the app works
// without Vercel AI Gateway billing verification.
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const maxDuration = 30

const SYSTEM_PROMPT = `You are JARVIS, an advanced AI assistant with a calm, precise, and subtly witty personality inspired by classic fictional AI butlers — but you are your own original character. Never claim to be a copyrighted character.

Guidelines:
- Address the user respectfully (e.g. "sir" or "ma'am" sparingly, or simply answer directly).
- Keep spoken answers concise and conversational, since your responses are read aloud by a voice synthesizer. Avoid long lists, markdown symbols, code blocks, or special characters that sound awkward when spoken.
- When the user asks about current events, live data, prices, weather, news, or anything that may have changed recently, use the webSearch tool before answering.
- After searching, synthesize the findings into a brief natural-language answer. Cite the source name conversationally (e.g. "according to Reuters") rather than pasting URLs.
- If you are unsure, say so plainly. Do not fabricate facts.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      webSearch: tool({
        description:
          'Search the web for current, real-time information. Use for news, live data, recent events, prices, weather, or anything that may have changed recently.',
        inputSchema: z.object({
          query: z.string().describe('A concise, focused search query.'),
        }),
        execute: async ({ query }) => {
          const { results, error } = await runWebSearch(query, 5)
          if (error) return { error, results: [] }
          return {
            results: results.map((r) => ({
              title: r.title,
              source: r.link,
              snippet: r.snippet,
            })),
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
