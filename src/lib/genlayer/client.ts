import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

type Eip1193Provider = { request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown> };
declare global { interface Window { ethereum?: Eip1193Provider } }

export const contractAddress = process.env.NEXT_PUBLIC_LURYN_CONTRACT_ADDRESS as `0x${string}` | undefined;
export const readClient = createClient({ chain: studionet, account: createAccount() });

export function hasConfiguredContract(): boolean { return Boolean(contractAddress); }

export async function injectedClient(address: `0x${string}`) {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("No injected EIP-1193 wallet detected.");
  const client = createClient({ chain: studionet, account: address, provider: window.ethereum });
  await client.connect("studionet");
  return client;
}
