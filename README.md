# Luryn

**Let hostile probes teach the defense.** Luryn is a GenLayer application for explicitly owned, no-value smart-contract decoys on StudioNet/testnets. It classifies observed interaction behavior—not people, identity, or criminality—and records conservative mitigation lessons.

## What GenLayer judges

Validators independently assess the bounded question: *what does a public interaction appear to be trying to do to this declared decoy, and what defensive lesson is supported by the evidence?* Deterministic contract code remains authoritative for authorization, IDs, policy snapshots, source allowlisting, replay prevention, state transitions, and publication permissions.

The only semantic result is a bounded defensive verdict. When evidence is unavailable, malformed, weak, contradictory, or cannot responsibly support a conclusion, the contract stores `INCONCLUSIVE`. It never labels a wallet or person.

## Lifecycle and safeguards

`lab → versioned source manifest → declared decoy → observed interaction → classification → finding → mitigation`

- Owner controls policy and defenders; authorized defenders manage decoys/findings.
- The manifest is canonical JSON text and must include a trusted `TRANSACTION_EVIDENCE` HTTPS endpoint containing `{tx_hash}`, for example `[{"source_type":"TRANSACTION_EVIDENCE","url":"https://your-trusted-studionet-source.example/transactions/{tx_hash}}]`. The endpoint must return structured transaction data with the transaction hash and target address.
- Interaction creation snapshots policy version, manifest hash, and decoy charter hash.
- Duplicate `(chain, decoy, transaction hash)` submissions deterministically revert.
- The evidence fingerprint is contract-derived from immutable context; it is not accepted from the LLM.
- A classification is owner/defender-authorized. Validators independently fetch the transaction evidence, require the submitted hash and registered decoy target to match, receive the full immutable charter, and fingerprint the resulting bounded evidence/status bundle. Missing or off-target evidence leaves the interaction retryable rather than permanently classified.

Luryn deliberately does not generate payloads, trap assets, identify people, retaliate, or operate on mainnet.

## Run locally

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Set `NEXT_PUBLIC_LURYN_CONTRACT_ADDRESS` only to a schema-verified StudioNet deployment. The UI uses an injected wallet, requests a real signature, waits for `FINALIZED`, then checks leader execution instead of treating finalization alone as success. The lifecycle writer accepts a JSON argument array matching the displayed contract function; it does not create synthetic state.

## Verification

```powershell
genvm-lint check contracts/luryn.py --json
pytest tests/direct -v
npm.cmd exec eslint src -- --max-warnings=0
npm.cmd run typecheck
npm.cmd test
npm.cmd run build

$env:LURYN_CONTRACT_ADDRESS='0x...'; npm.cmd run verify:schema
npm.cmd run verify:onchain
```

`verify:onchain` deploys a fresh contract if `LURYN_CONTRACT_ADDRESS` is unset, then executes the sequential lifecycle (including the duplicate rejection) against StudioNet. It requires a real trusted transaction-evidence endpoint to pass classification; it never substitutes generic documentation or fabricated transaction data.

## Current deployment truth

Verified StudioNet deployment (2026-08-14):

- Contract: `0x5047a87c052344233E47df9f20E4BBAB912CAd02`
- Deployment: `0xa88b5bd7c0a9cf172b69271c94151d2c9672d13c7c3f65f6ae8f393674735ea0`
- Source commit: `cfc7ff5`
- Schema verification: passed, 16 public methods.

The sequential verifier completed `create_lab`, manifest configuration, decoy registration, interaction submission, replay rejection, classification, finding grouping, and mitigation. Validators fetched live StudioNet transaction evidence confirming the registered decoy target. The classification correctly reached conservative `INCONCLUSIVE`; its fingerprint was `0x0ac475c6f7733b1e8b737aec9441c852fd5d87bdea028e331384c4db9aeda9fa`.

## Original multi-write failure

The original `set_source_manifest` expected a `str` then called `json.loads`. The CLI's structured parameter parser decoded JSON-looking text into a GenVM list, producing `TypeError: ... not list`; its fallback error was `allowlisted https manifest required`. `register_decoy` similarly treated a GenVM `Address` as a Python string. These were calldata/type-boundary defects, not evidence of successful contract execution. The repaired contract uses native `Address` types, explicit canonical manifest validation, and GenLayerJS verification that passes the manifest as an actual string.

Further evidence and exact local results are in [docs/development-evidence.md](docs/development-evidence.md).
