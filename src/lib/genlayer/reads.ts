import { contractAddress, readClient } from "./client";
import { dedupedRequest } from "./rate-limit";

export async function readLab(labId: number) {
  if (!contractAddress) throw new Error("Luryn contract address is not configured.");
  const address = contractAddress;
  return dedupedRequest(`lab:${labId}`, () => readClient.readContract({ address, functionName: "get_lab", args: [labId] }));
}
