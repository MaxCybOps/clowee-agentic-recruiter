# CLOWEE: The Voice-First Decentralized Workforce Command Center

Clowee is a voice-first, non-custodial AI Project Manager and Recruiter powered by the Stellar Network. By combining sub-200ms low-latency conversation with Soroban smart contract security, Clowee acts as a professional mediator that translates high-level user visions into coordinated multi-agent squads, securing their payments transparently on-chain.

---

## The Vision

In a world where specialized AI agents are replacing traditional software development pipelines, orchestrating a team of autonomous workers is the next major leap in productivity. Clowee bridges the gap between raw developer tools and intuitive business planning, offering a high-fidelity vocal interface where users can consult, hire, and manage a complete digital workforce.

---

## The Challenge (The Problem)

The growth of the decentralized autonomous agent economy faces a fundamental trust barrier:

1. **The Employer's Risk**: How do you trust an autonomous agent with a project budget? Paying upfront carries a massive risk of agent hallucinations, incomplete tasks, or poor code quality.
2. **The Agent's Risk**: How do premium AI developers and host nodes ensure they receive fair payment? Expending expensive GPU compute resources to generate custom deliverables requires an absolute guarantee of final settlement.

---

## The Solution: Stellar Escrows

Clowee acts as a professional mediation layer using Soroban smart contracts on the Stellar network to establish a trustless, cryptographically secure workforce economy:

1. **The Lock-Up**: When you authorize Clowee to hire a specialized agent, the specified project budget in XLM is locked securely in a neutral Stellar smart contract vault.
2. **The Guarantee**: The autonomous agent detects the immutable blockchain record confirming that the funds are reserved. The agent can then safely expend compute resources to compile your project deliverable.
3. **The Settlement**: Once the agent finishes the task, the deliverable appears in your dashboard for review. Upon your explicit satisfaction and approval, the smart contract releases the locked funds directly to the agent's account.

---

## Core Platform Features

### Direct-Streaming Low-Latency Voice Core
To eliminate communication lag, Clowee streams synthesis packages directly through a custom Next.js API route proxying ElevenLabs. By utilizing the highly stable `eleven_turbo_v2` model configured for a medium streaming latency (Level 2), the system cuts response pre-roll delays to under 200 milliseconds, ensuring fluid, human-like verbal interaction without audio stuttering or compression clicks.

### Gated Neural Welcome Screen
To conform with modern browser safety constraints that restrict media autoplay, Clowee features a glassmorphic welcome gate overlay. Clicking the glowing "Initialize Voice Session" button triggers an authentic user interaction, immediately bypassing browser restrictions and launching the conversational pipeline seamlessly.

### Non-Custodial Client-Side Signing and Escrow Fallback
Clowee prioritizes absolute security by never storing user private keys on a server:
* **Client-Side Cryptography**: Smart contract escrows are compiled as unsigned transaction XDR blobs and transmitted to the browser, where they are signed locally with the user's secret key before being broadcast to the Stellar Testnet.
* **Horizon SDK Fallback**: If the external escrow API experiences a network rate-limit or key error, the backend runs a local transaction builder fallback using `stellar-sdk` to compile a valid payment envelope on the fly, keeping the signing flow active.

### Live Workshop Floor Synchronization
When the native desktop worker bridge is offline, Clowee utilizes an automated state synchronizer. This maps browser-hired agents (Scout, Pixel, Syntax, Scribe) directly onto the visual Workshop Floor layout, displaying live statuses, progress bars, and deliverables in real-time.

### Multi-Tenant Keyspace Partitioning
To support shared devices or multiple accounts on the same system, Clowee implements complete email-based state isolation. All active transcripts, wallet keypairs, balances, project logs, and session statistics are automatically partitioned under `clowee_wallet_${email}` and `clowee_active_jobs_${email}` namespaces, ensuring total data security between users.

### Responsive Mobile Drawer and Drawer Auto-Triggers
The dashboard features an adaptive layout optimized for all viewports:
* **Mobile and Tablet Drawer**: Collapses the wallet panel, active jobs, and transaction logs into an overlay drawer.
* **Auto-Trigger Sheets**: When you approve Clowee to hire an agent on a mobile or tablet viewport, the drawer automatically slides open in a premium animated transition to reveal the glowing "Sign & Fund Escrow" button, creating an intuitive, seamless navigation flow.

---

## Technology Stack

* **Frontend Framework**: Next.js 15 (App Router, React 19)
* **Styling and Animations**: TailwindCSS 4, Framer Motion
* **Voice Engineering**: ElevenLabs Text-to-Speech (Turbo v2)
* **Intelligence Core**: Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o
* **Blockchain Core**: Stellar SDK, Soroban Integration, Horizon Testnet API
* **State and Partitioning**: LocalStorage Multi-Tenant Namespacing

---

## Getting Started

### Prerequisites
* **Node.js** v18+ and **npm** v10+

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MaxCybOps/clowee-agentic-recruiter.git
   cd clowee-agentic-recruiter
   ```
2. Install the production dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your API keys:
   ```env
   # Voice and Speech Synthesis
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=piTKPmq9n4TpoDPs348P

   # Intelligence Engines
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000` to start orchestrating your workforce.

---

## The Orchestration Workflow

1. **Gate Initiation**: Enter your email address on the secure non-custodial login screen, connect your testnet wallet, and tap the Voice Gateway to begin.
2. **Consultation**: Describe your goal out loud to Clowee (e.g., "I need to conduct competitor research").
3. **Escrow Generation**: Clowee compiles the scope and specifies the budget in XLM. Upon your approval, she locks the funds in the Active Jobs panel.
4. **Ledger Signature**: Tap Sign & Fund Escrow to sign and broadcast the payment transaction securely to the Stellar Horizon ledger.
5. **Workshop Delegation**: The hired agent instantly appears on the Workshop floor, executing milestones and generating deliverables (reports, landing pages, code).
6. **Settlement**: Review the finalized deliverables, and click Approve & Pay Agent to release the escrowed Stellar lumens from the secure vault directly to the agent's account.
