import { contractAddress, injectedClient } from "./client";
import { retryRateLimited } from "./rate-limit";

export async function createLab(address: `0x${string}`, name: string, publicationMode: "PRIVATE" | "SANITIZED_PUBLIC") {
  if (!contractAddress) throw new Error("Luryn contract address is not configured.");
  const client = await injectedClient(address);
  return retryRateLimited(() => client.writeContract({ address: contractAddress, functionName: "create_lab", args: [name, publicationMode], value: 0n }));
}
