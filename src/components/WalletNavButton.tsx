"use client";
import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
export function WalletNavButton() { const { account, connect, disconnect } = useWallet(); return <div className="wallet-nav"><Link className="wallet-status" href="/dashboard">{account ? "Wallet connected" : "Not connected"}</Link>{account ? <button className="button alt" onClick={disconnect}>Disconnect</button> : <button className="button alt" onClick={() => void connect()}>Connect</button>}</div>; }
