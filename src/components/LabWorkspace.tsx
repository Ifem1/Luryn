"use client";

import { useState } from "react";
import { hasConfiguredContract, contractAddress } from "@/lib/genlayer/client";
import { readLab } from "@/lib/genlayer/reads";

export function LabWorkspace() {
  const configured = hasConfiguredContract();
  const [labId, setLabId] = useState("1");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function loadLab() {
    const id = Number(labId);
    if (!Number.isInteger(id) || id < 1) { setResult("Enter a positive numeric lab ID."); return; }
    setLoading(true); setResult(null);
    try { setResult(JSON.stringify(await readLab(id), null, 2)); }
    catch (error) { setResult(error instanceof Error ? error.message : "Unable to read the lab."); }
    finally { setLoading(false); }
  }
  if (!configured) return <div className="empty"><span className="tag">CONFIGURATION REQUIRED</span><p>Luryn does not fabricate workspaces, decoys, interactions, verdicts, or transaction states. The deployment is not configured in this build.</p></div>;
  return <section className="field-card" aria-label="Luryn Labs workspace"><span className="status">StudioNet contract configured</span><h2>Authoritative lab data</h2><p className="mono">{contractAddress}</p><label className="mono" htmlFor="lab-id">Lab ID</label><p><input id="lab-id" value={labId} inputMode="numeric" onChange={(event) => setLabId(event.target.value)} /> <button className="button" onClick={loadLab} disabled={loading}>{loading ? "Reading…" : "Read lab"}</button></p>{result && <pre className="mono">{result}</pre>}</section>;
}
