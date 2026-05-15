import { NextResponse } from 'next/server';

const TRUSTLESS_WORK_API_KEY = process.env.TRUSTLESS_WORK_API_KEY;
const TRUSTLESS_API_BASE = "https://dev.api.trustlesswork.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { signer, title, description, amount, workerAddress } = body;

    if (!TRUSTLESS_WORK_API_KEY) {
      throw new Error("Missing Trustless Work API Key");
    }

    // Prepare the payload for Single Release Escrow
    // as per docs: https://docs.trustlesswork.com/trustless-work/api-rest/deploy/initialize-escrow
    const payload = {
      signer: signer, // The user's public key
      engagementId: "CLW-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      title: title,
      description: description,
      roles: {
        approver: signer,
        serviceProvider: workerAddress || signer, // Default to self for demo
        platformAddress: signer, 
        releaseSigner: signer,
        disputeResolver: signer, // In production, this would be a third party
        receiver: workerAddress || signer
      },
      amount: parseInt(amount),
      platformFee: 0,
      milestones: [
        { description: "Final Delivery and Review" }
      ],
      trusline: {
        symbol: "XLM",
        address: "Native" // Defaulting to Native XLM for the hackathon
      }
    };

    const response = await fetch(`${TRUSTLESS_API_BASE}/deployer/single-release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TRUSTLESS_WORK_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Trustless API Error:', data);
      return NextResponse.json({ error: data.message || "Failed to initialize escrow" }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      escrowId: payload.engagementId,
      unsignedTransaction: data.unsignedTransaction 
    });

  } catch (error: any) {
    console.error('Escrow Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
