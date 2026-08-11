import { contractAddress, readClient } from "./client";
import { dedupedRequest } from "./rate-limit";

export async function readLab(labId: number) {
  if (!contractAddress) throw new Error("Luryn contract address is not configured.");
  return dedupedRequest(`lab:${labId}`, () => readClient.readContract({ address: contractAddress, functionName: "get_lab", args: [labId] }));
}
