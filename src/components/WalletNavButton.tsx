"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function WalletNavButton() {
  const [account, setAccount] = useState<string | null>(null);
  useEffect(() => {
    async function refresh() {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
      setAccount(accounts[0] ?? null);
    }
    void refresh();
    window.ethereum?.on?.("accountsChanged", (accounts: unknown) => setAccount(Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : null));
    return () => window.ethereum?.removeListener?.("accountsChanged", refresh);
  }, []);
  const label = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect wallet";
  return <Link className="button alt" href="/wallet" aria-label={account ? `Wallet connected: ${account}` : "Connect wallet"}>{label}</Link>;
}
