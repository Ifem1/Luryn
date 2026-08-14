import { contractAddress, injectedClient } from "./client";
import { retryRateLimited } from "./rate-limit";
import { waitForFinalized } from "./transactions";
import type { CalldataEncodable } from "genlayer-js/types";

export type LurynWrite =
  | "create_lab" | "set_defender" | "set_source_manifest" | "register_decoy"
  | "set_decoy_active" | "submit_interaction" | "classify_interaction"
  | "group_pattern" | "set_finding_status" | "record_mitigation" | "publish_sanitized_lesson";

export async function submitLurynWrite(account: `0x${string}`, functionName: LurynWrite, args: unknown[]) {
  if (!contractAddress) throw new Error("Luryn contract address is not configured.");
  const contract = contractAddress;
  const client = await injectedClient(account);
  const hash = await retryRateLimited(() => client.writeContract({ address: contract, functionName, args: args as CalldataEncodable[], value: 0n }));
  const receipt = await waitForFinalized(account, hash);
  const leader = receipt.consensus_data?.leader_receipt?.[0];
  if (leader?.execution_result && leader.execution_result !== "SUCCESS") {
    const receipt = leader as unknown as { result?: { payload?: string }; error?: string };
    throw new Error(`${hash}: ${leader.execution_result}. ${receipt.result?.payload ?? receipt.error ?? "Contract execution failed."}`);
  }
  return { hash, receipt };
}

export function createLab(account: `0x${string}`, name: string, publicationMode: "PRIVATE" | "SANITIZED_PUBLIC") { return submitLurynWrite(account, "create_lab", [name, publicationMode]); }
