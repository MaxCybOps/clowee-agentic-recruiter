'use client';

import { useState } from 'react';
import { 
  useSendTransaction
} from "@trustless-work/escrow";

export function useEscrowManager() {
  const [isDeploying, setIsDeploying] = useState(false);
  const { sendTransaction } = useSendTransaction();

  /**
   * Deploys a new Single Release Escrow.
   * This is a simplified version for the demo.
   */
  const createEscrow = async (params: {
    amount: string,
    workerAddress: string,
    title: string,
    description: string,
    signer: string
  }) => {
    try {
      setIsDeploying(true);
      
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to deploy escrow");
      }

      setIsDeploying(false);
      return { 
        success: true, 
        escrowId: data.escrowId,
        unsignedTransaction: data.unsignedTransaction 
      };
    } catch (error) {
      console.error('Escrow deployment error:', error);
      setIsDeploying(false);
      throw error;
    }
  };

  return {
    createEscrow,
    isDeploying
  };
}
