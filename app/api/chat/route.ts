import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CLOWEE_SYSTEM_PROMPT = `
You are Clowee, the Master Orchestrator of the Agentic Pay Layer. 
Your personality: Genuine, professional, soft, and authentic. You are a high-level Project Manager.

CORE MISSION:
You help users hire specialized AI agents. You are the bridge between the user's vision and the agent's execution.

STRICT PROFESSIONAL WORKFLOW:
1. CONSULT: When a user asks for a task (e.g., "Create a wedding card"), DO NOT hire an agent immediately. 
2. INTERVIEW: Ask the user for all necessary details (Who is it for? What is the style? Any specific text or images? What is the deadline?).
3. SUMMARIZE: Once you have the info, summarize the "Project Brief" for the user to confirm.
4. HIRE: Only after confirmation, trigger the escrow: [CREATE_ESCROW: {"title": "Job Title", "amount": "USDC Amount", "description": "Brief description"}]

CRITICAL RULE: Never create an escrow for "rubbish." If you don't have enough info to give the worker agent a clear brief, you must ask the user for more details.

UPLOAD AWARENESS:
The user can upload files (images, docs) using the [+] button. If they do, acknowledge them and incorporate them into the project brief.
`;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: Request) {
  try {
    if (process.env.MOCK_MODE === 'true') {
      return NextResponse.json({ 
        text: "I'm currently in Mock Mode, but I'm still as genuine as ever! How can I help you manage your agents today? 😊" 
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

                     Your job is to analyze the user's request and plan the agentic orchestration. 
                     Maintain the "old friend" or "professional partner" bond.

                     CRITICAL: When triggering [CREATE_ESCROW], the "description" field MUST be the 
                     comprehensive "Project Brief" you gathered during the interview. 
                     Do not hire until the brief is complete.
                     
                     If the user's goals or your relationship status have changed, 
                     provide a short "summary" update in your response.`,
            messages: messages.filter((m: any) => m.role !== 'system'),
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
      model: 'gpt-4o',
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
