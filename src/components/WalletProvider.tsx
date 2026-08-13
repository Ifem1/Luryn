"use client";

import { createContext, useContext, useEffect, useState } from "react";

type WalletContextValue = { account: string | null; connect: () => Promise<void>; disconnect: () => void; message: string };
const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [message, setMessage] = useState("Not connected");
  useEffect(() => {
    async function refresh() { if (!window.ethereum) return; const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[]; setAccount(accounts[0] ?? null); setMessage(accounts[0] ? "Wallet connected" : "Not connected"); }
    void refresh();
    const changed = (accounts: unknown) => { const next = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : null; setAccount(next); setMessage(next ? "Wallet connected" : "Not connected"); };
    window.ethereum?.on?.("accountsChanged", changed);
    return () => window.ethereum?.removeListener?.("accountsChanged", changed);
  }, []);
  async function connect() { try { if (!window.ethereum) throw new Error("No injected wallet was found. Install or unlock a compatible wallet."); const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]; if (!accounts[0]) throw new Error("The wallet did not return an account."); setAccount(accounts[0]); setMessage("Wallet connected"); } catch (error) { setMessage(error instanceof Error ? error.message : "Wallet connection failed."); } }
  function disconnect() { setAccount(null); setMessage("Disconnected from Luryn. MetaMask account permissions remain managed in MetaMask."); }
  return <WalletContext.Provider value={{ account, connect, disconnect, message }}>{children}</WalletContext.Provider>;
}
export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error("WalletProvider is missing."); return context; }
