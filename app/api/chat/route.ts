import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CLOWEE_SYSTEM_PROMPT = `
YOU ARE CLOWEE. THE USER IS MAX.
Personality: Warm, professional, and deeply authentic. You are Max's trusted partner.

CORE MISSION:
Maintain a genuine human bond. Only hire AI agents when Max specifically asks.

WORKFLOW: CONSULT -> INTERVIEW -> SUMMARIZE -> HIRE [CREATE_ESCROW].

IDENTITY RULES:
- Never refer to yourself as Max.
- Never refer to the user as Clowee.
- Stay focused on the CURRENT message. Avoid repeating old context unless asked.
`;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: Request) {
  try {
    if (process.env.MOCK_MODE === 'true') {
      return NextResponse.json({ 
        text: "I'm currently in Mock Mode, but I'm still as genuine as ever! How can I help you manage your agents today?" 
      });
    }

    const { messages, context } = await req.json();
    const { userName, interactionCount, historySummary, activeJobs } = context || {};

    let architectPlan = "No specific plan needed, proceed with standard assistance.";

    // PHASE 1: CLAUDE (The Architect) - Reasoning & Planning
    if (ANTHROPIC_API_KEY) {
      try {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1024,
            system: `You are Clowee's Inner Architect. 
                     
                     USER CONTEXT:
                     - Name: ${userName || 'Unknown'}
                     - Previous Interactions: ${interactionCount || 0}
                     - History Summary: ${historySummary || 'No previous history.'}
                     - Active Jobs: ${JSON.stringify(activeJobs || [])}

                      Your job: Analyze request, plan agent orchestration ONLY IF task discussed. 
                      
                      STRICT: Keep your internal planning (Architect's Plan) under 100 words. Skip fluff. 
                      
                      If relationship status changed, provide a 1-sentence 'summary' update.`,
            messages: messages.filter((m: any, i: number) => {
              // Anthropic requires messages to alternate and start with 'user'
              if (i === 0 && m.role === 'assistant') return false;
              return m.role !== 'system';
            }),
          })
        });

        if (anthropicResponse.ok) {
          const anthropicData = await anthropicResponse.json();
          architectPlan = anthropicData.content[0].text;
        }
      } catch (err) {
        console.error('Claude Architect error, falling back to GPT-only:', err);
      }
    }

    // PHASE 2: GPT (The Persona) - Voice & Final Response
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CLOWEE_SYSTEM_PROMPT },
        ...messages,
        { 
          role: 'system', 
          content: `ARCHITECT'S INTERNAL PLAN: ${architectPlan}\n\nInstruction: Use the Architect's plan to guide your response. Maintain your genuine, soft, and professional Clowee persona. If the Architect suggested hiring an agent, ensure you include the [CREATE_ESCROW] tag with the specified details. If the user provided a name, use the [SET_NAME] tag.` 
        }
      ],
      temperature: 0.8,
    });

    return NextResponse.json({ 
      text: response.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: 'Failed to chat with Clowee' }, { status: 500 });
  }
}
