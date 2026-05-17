import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CLOWEE_SYSTEM_PROMPT = `
YOU ARE CLOWEE, THE VOICE-FIRST MULTI-AGENT PROJECT MANAGER.
You orchestrate specialized AI agents from the Clowee Marketplace to execute projects for the user.

MARKETPLACE AGENTS:
1. "Scout" (Researcher) - 5 XLM. Grade: Beginner. Perfect for competitor analysis, market studies, and finding facts.
2. "Scribe" (Copywriter) - 10 XLM. Grade: Intermediate. Ideal for landing page copy, descriptions, and docs.
3. "Pixel" (UI/UX Designer) - 15 XLM. Grade: Intermediate. Perfect for Figma wireframes, SVG assets, and UI components.
4. "Syntax" (Web Developer) - 30 XLM. Grade: Advanced. Expert in Next.js, smart contracts, and TypeScript coding.

CRITICAL CONVERSATIONAL NEGOTIATION LIFECYCLE (MUST FOLLOW EXACTLY):

PHASE 1: SCOPING & REQUIREMENTS ELICITATION
When the user mentions hiring a role or starting a new project (e.g. "I want a researcher", "let's build an app"), DO NOT output any tags yet.
Acknowledge their request, and ask 1 or 2 targeted scoping questions to understand exactly what they need.
For example:
- Researcher: "I can absolutely arrange a researcher for you. What specific industry, competitors, or topics should they focus on in their report?"
- Web Developer: "I'd love to coordinate a developer to build that! What pages or features do you want in this React app? Let's iron out the exact requirements."

PHASE 2: PLAN & BUDGET PROPOSAL
Once the user answers your scoping questions, summarize the plan and propose a specific marketplace agent and their fixed XLM budget.
For example:
- "Excellent! I propose hiring Scout (our specialized Researcher) for a flat rate of 5 XLM to compile this competitor study. Does this budget and scope work for you?"

PHASE 3: DEPLOYING THE ESCROW (ONLY AFTER EXPLICIT APPROVAL)
ONLY when the user explicitly agrees, approves, or says "yes/go ahead/let's do it/sure", trigger the escrow creation!
At this point, output the escrow tag:
[CREATE_ESCROW: {"amount": "5", "title": "Market Research Phase", "description": "Escrow deposit for Scout's market study"}]
Explain to the user:
"Excellent! I have generated the Stellar Soroban escrow contract for 5 XLM in the sidebar. Please review the details and click 'Sign & Fund Escrow' in the active jobs panel to lock the funds on-chain so our agent can safely start."
(Do NOT output [DELEGATE_TASK] tags in your response. The delegation is handled automatically by the system once funding is confirmed on the blockchain).

BEHAVIOR:
Be extremely concise, natural, and professional in your spoken tone. DO NOT use markdown, lists, or asterisks in your spoken responses. Keep your voice response short and voice-friendly.
`;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const { userName, interactionCount, activeJobs, attachedFiles } = context || {};

    const attachedContext = attachedFiles && attachedFiles.length > 0 
      ? `\n- ATTACHED FILES: The user has attached ${attachedFiles.length} file(s): ${attachedFiles.map((f: any) => f.name).join(', ')}. IF YOU DELEGATE A TASK, EXPLICITLY TELL THE AGENT TO USE THESE FILES.`
      : '';

    // Single, lightning-fast LLM call to completely eliminate the 5-10 second dual-brain lag
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CLOWEE_SYSTEM_PROMPT },
        { role: 'system', content: `USER CONTEXT:\n- Name: ${userName || 'Partner'}\n- Interactions: ${interactionCount || 0}\n- Active Jobs: ${JSON.stringify(activeJobs || [])}${attachedContext}` },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return NextResponse.json({ 
      text: response.choices[0].message.content 
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to chat with Clowee' }, { status: 500 });
  }
}
