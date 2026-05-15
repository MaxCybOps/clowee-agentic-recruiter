'use client';

import React from 'react';
import { 
  development, 
  TrustlessWorkConfig 
} from "@trustless-work/escrow";

export function TrustlessWorkProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY || "";
  const baseURL = development; // Use testnet for hackathon

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
