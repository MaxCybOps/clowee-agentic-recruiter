import * as StellarSdk from 'stellar-sdk';

/**
 * Creates a new Stellar account (Keypair).
 * In a real app, this should be stored securely or handled by a wallet extension.
 */
export function createStellarAccount() {
  const pair = StellarSdk.Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

/**
 * Funds a testnet account using Friendbot.
 */
export async function fundTestnetAccount(publicKey: string) {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    return await response.json();
  } catch (error) {
    console.error('Friendbot error:', error);
    throw error;
  }
}

/**
 * Gets the balance of a Stellar account.
 */
export async function getAccountBalance(publicKey: string) {
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Horizon error:', error);
    return [];
  }
}

/**
 * Signs and submits an unsigned transaction XDR to the Stellar Testnet.
 */
export async function signAndSubmitTransaction(unsignedXdr: string, secretKey: string) {
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  try {
    const pair = StellarSdk.Keypair.fromSecret(secretKey);
    const tx = StellarSdk.TransactionBuilder.fromXDR(unsignedXdr, 'Test SDF Network ; September 2015');
    tx.sign(pair);
    const result = await server.submitTransaction(tx);
    return { success: true, hash: result.hash };
  } catch (error: any) {
    console.error('Failed to sign/submit Stellar transaction:', error);
    const detail = error.response?.data?.extras?.result_codes?.transaction || error.message;
    throw new Error(detail || "Transaction failed");
  }
}
