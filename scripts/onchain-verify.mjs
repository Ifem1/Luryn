import { createAccount, createClient, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { readFile } from "node:fs/promises";

let address = process.env.LURYN_CONTRACT_ADDRESS;
const privateKey = process.env.LURYN_PRIVATE_KEY ?? generatePrivateKey();
if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) throw new Error("LURYN_PRIVATE_KEY must be a 32-byte hex key.");
const client = createClient({ chain: studionet, account: createAccount(privateKey) });
const transactionEvidenceUrl = process.env.LURYN_TRANSACTION_EVIDENCE_URL_TEMPLATE;
if (!transactionEvidenceUrl?.startsWith("https://") || !transactionEvidenceUrl.includes("{tx_hash}")) throw new Error("Set LURYN_TRANSACTION_EVIDENCE_URL_TEMPLATE to a trusted HTTPS JSON transaction endpoint containing {tx_hash}.");
const manifest = JSON.stringify([{ source_type: "TRANSACTION_EVIDENCE", url: transactionEvidenceUrl }]);
const charter = JSON.stringify({ purpose: "Synthetic no-value testnet canary", assets: "none", prohibited_response_actions: ["transfer", "retaliation"] });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One request rail for the verifier. It intentionally stays below StudioNet's
// 30-RPM public limit even when an SDK write needs additional RPC calls.
let nextRequestAt = 0;
async function paced(run) { const wait = Math.max(0, nextRequestAt - Date.now()); if (wait) await sleep(wait); nextRequestAt = Date.now() + 6_000; return run(); }
async function retryRateLimit(run) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { return await paced(run); } catch (error) {
      const detail = String(error); const seconds = Number(detail.match(/retry_after_seconds:\s*(\d+)/)?.[1] ?? (/per hour/i.test(detail) ? 3600 : 60));
      if (!/rate limit|32029/i.test(detail) || attempt === 4) throw error;
      console.warn(`Studio rate limit; waiting ${seconds}s before retry ${attempt + 1}/4.`); await sleep((seconds + 2) * 1000);
    }
  }
  throw new Error("rate retry exhausted");
}
async function receipt(hash) {
  const tx = await retryRateLimit(() => client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 30_000, retries: 30 }));
  const leader = tx.consensus_data?.leader_receipt?.[0];
  if (leader?.execution_result && leader.execution_result !== "SUCCESS") {
    const reason = leader.result?.payload ?? leader.genvm_result?.error_description ?? "Contract execution failed";
    throw new Error(`${hash}: ${leader.execution_result}: ${reason}`);
  }
  return tx;
}
async function read(name, args) { return retryRateLimit(() => client.readContract({ address, functionName: name, args, jsonSafeReturn: true })); }
async function write(name, args) { const hash = await retryRateLimit(() => client.writeContract({ address, functionName: name, args, value: 0n })); console.log(`submitted ${name}: ${hash}`); return receipt(hash); }

if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) {
  const code = await readFile("contracts/luryn.py", "utf8"); const deployment = await retryRateLimit(() => client.deployContract({ code, args: [] })); console.log(`submitted deployment: ${deployment}`);
  const deployed = await receipt(deployment); address = deployed.to_address;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) throw new Error(`Deployment did not expose a contract address: ${deployment}`);
}
await write("create_lab", ["Luryn on-chain verifier", "SANITIZED_PUBLIC"]);
await write("set_source_manifest", [1, manifest]);
if ((await read("get_lab", [1]))?.policy_version < 2) throw new Error("manifest snapshot missing");
await write("register_decoy", [1, address, 61999, charter]);
if (!(await read("get_decoy", [1]))?.active) throw new Error("decoy missing");
const interactionTx = await write("submit_interaction", [1, "0x" + "11".repeat(32), "verifier-session"]);
if ((await read("get_interaction", [1]))?.lifecycle !== "OBSERVED") throw new Error("interaction missing");
let replayRejected = false;
try { await write("submit_interaction", [1, "0x" + "11".repeat(32), "verifier-session"]); } catch (error) { replayRejected = /duplicate interaction/i.test(String(error)); }
if (!replayRejected) throw new Error("replay was not rejected");
const classificationTx = await write("classify_interaction", [1]);
const classification = await read("get_classification", [1]); if (!classification?.evidence_fingerprint) throw new Error("classification provenance missing");
await write("group_pattern", [1, "[1]", "Verifier finding"]); await write("record_mitigation", [1, "0x" + "22".repeat(32)]);
const finding = await read("get_pattern_dossier", [1]); if (finding?.status !== "MITIGATED") throw new Error("mitigation missing");
console.log(JSON.stringify({ ok: true, address, interactionTx: interactionTx.hash, classificationTx: classificationTx.hash, classification, finding }, null, 2));
