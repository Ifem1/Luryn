import { NextResponse } from "next/server";

const STUDIO_RPC = "https://studio.genlayer.com/api";

export async function GET(_: Request, { params }: { params: Promise<{ txHash: string }> }) {
  const { txHash } = await params;
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
  try {
    const response = await fetch(STUDIO_RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionByHash", params: [txHash] }), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "StudioNet source unavailable" }, { status: 503 });
    const payload = await response.json() as { result?: { hash?: string; to?: string; to_address?: string; from?: string; from_address?: string; status?: string } | null };
    const tx = payload.result;
    if (!tx?.hash) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    return NextResponse.json({ hash: tx.hash.toLowerCase(), to: (tx.to_address ?? tx.to ?? "").toLowerCase(), from: (tx.from_address ?? tx.from ?? "").toLowerCase(), status: tx.status ?? "UNKNOWN", source: "StudioNet JSON-RPC" }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch { return NextResponse.json({ error: "StudioNet source unavailable" }, { status: 503 }); }
}
