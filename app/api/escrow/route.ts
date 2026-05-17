import { NextResponse } from 'next/server';
import * as StellarSdk from 'stellar-sdk';

const TRUSTLESS_WORK_API_KEY = process.env.TRUSTLESS_WORK_API_KEY;
const TRUSTLESS_API_BASE = "https://dev.api.trustlesswork.com";

// Local fallback function to generate a real Stellar payment transaction XDR
async function generateLocalEscrowFallback(signer: string, amount: string) {
  try {
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const account = await server.loadAccount(signer);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: "GDQP365E2HJZ7S67KBTKHOA644FFQGEVBBALCGHWQA3EU7BTGDHXWNQA", // Safe vault address
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(60 * 5)
      .build();
    return transaction.toXDR();
  } catch (err) {
    console.error("Local fallback generation failed:", err);
    throw err;
  }
}

export async function POST(req: Request) {
  let signer = "";
  let amount = "5";
  let title = "Agent Escrow";
  let description = "Escrow Deposit";
  const engagementId = "CLW-" + Math.random().toString(36).substr(2, 6).toUpperCase();

  try {
    const body = await req.json();
    signer = body.signer;
    amount = body.amount;
    title = body.title;
    description = body.description;
    const { workerAddress } = body;

    if (!TRUSTLESS_WORK_API_KEY) {
      throw new Error("Missing Trustless Work API Key");
    }

    const payload = {
      signer: signer,
      engagementId: engagementId,
      title: title,
      description: description,
      roles: {
        approver: signer,
        serviceProvider: workerAddress || signer,
        platformAddress: signer, 
        releaseSigner: signer,
        disputeResolver: signer,
        receiver: workerAddress || signer
      },
      amount: parseInt(amount),
      platformFee: 0,
      milestones: [
        { description: "Final Delivery and Review" }
      ],
      trusline: {
        symbol: "XLM",
        address: "Native"
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
      console.warn('Trustless API returned error, falling back to local transaction generation:', data);
      const fallbackXdr = await generateLocalEscrowFallback(signer, amount);
      return NextResponse.json({ 
        success: true, 
        escrowId: engagementId,
        unsignedTransaction: fallbackXdr,
        isMocked: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      escrowId: engagementId,
      unsignedTransaction: data.unsignedTransaction 
    });

  } catch (error: any) {
    console.warn('Escrow API Route caught exception, falling back to local transaction generation:', error.message);
    try {
      const fallbackXdr = await generateLocalEscrowFallback(signer, amount);
      return NextResponse.json({ 
        success: true, 
        escrowId: engagementId,
        unsignedTransaction: fallbackXdr,
        isMocked: true
      });
    } catch (fallbackError: any) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }
  }
}
