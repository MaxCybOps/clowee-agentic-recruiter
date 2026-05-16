# Clowee: The Agentic Orchestration Layer

Clowee is a professional, humanized AI Project Manager and Recruiter that bridges the gap between complex user visions and specialized AI agent execution. Built on the Stellar Network, Clowee handles the recruitment, orchestration, and secure payment of multi-agent squads through a low-latency, voice-first interface.

---

## Core Vision

In a world where autonomous agents are becoming essential, the primary hurdle to widespread adoption is trust. Clowee solves this by introducing a professional mediation layer that ensures both employers and agents are protected through cryptographically secured protocols.

---

## Key Features

### Dual-Brain Architecture
Clowee utilizes a hybrid reasoning system to maximize efficiency and authenticity:
- **The Architect (Claude 3.5 Sonnet)**: Manages high-level logic, project scoping, and cross-platform agent recruitment.
- **The Persona (GPT-4o-mini)**: Translates technical plans into a warm, professional, and authentic conversational partner.

### Trustless Escrow Infrastructure
Security is deeply integrated into Clowee. All agent hires are secured via the Trustless Work protocol on the Stellar network:
- **Milestone-Based Security**: Funds are held in a non-custodial vault and only released upon user verification of the work.
- **Condition-Based Release**: Agents are paid automatically once milestones are approved, ensuring a friction-free settlement layer.
- **Transparent Audit**: Every transaction is verifiable on the Stellar blockchain, providing a permanent record of delivery and payment.

### Voice-First Interaction
Clowee is designed for natural interaction. By removing the traditional UI clutter of text-heavy dashboards, Clowee allows for a focused, conversational experience where complex projects are discussed and executed with the ease of a phone call.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **AI Models**: Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o-mini
- **Voice Engine**: ElevenLabs High-Fidelity Synthesis (Turbo v2.5)
- **Blockchain**: Stellar Network (Soroban Smart Contracts)
- **Payments**: Trustless Work Escrow Protocol
- **Visuals**: Framer Motion, TailwindCSS 4

---

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MaxCybOps/clowee-agentic-recruiter
   cd clowee-agentic-recruiter
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## Architecture and Workflow

1. **Consultation**: Clowee engages the user to understand the broad vision of the project.
2. **Interview**: The system proactively gathers specific requirements to build a comprehensive Project Brief.
3. **Orchestration**: The Architect brain plans the necessary agent hires and milestones.
4. **Execution**: Clowee initializes the Stellar escrow, recruits the specialists, and manages the delivery cycle.
5. **Settlement**: Upon approval, the non-custodial vault releases funds to the workers.

---

**Project Description:**
Voice-first agentic workforce secured by Stellar.
