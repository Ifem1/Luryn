import { injectedClient } from "./client";
import { TransactionStatus } from "genlayer-js/types";
import { retryRateLimited } from "./rate-limit";
type TransactionHash = `0x${string}` & { length: 66 };

export async function waitForFinalized(address: `0x${string}`, hash: TransactionHash) {
  const client = await injectedClient(address);
  return retryRateLimited(() => client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED }));
}
