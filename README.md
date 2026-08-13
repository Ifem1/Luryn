# Luryn

**Let hostile probes teach the defense.** Luryn is a GenLayer application for explicitly owned, no-value smart-contract decoys on StudioNet/testnets. It classifies observed interaction behavior—not people, identity, or criminality—and records conservative mitigation lessons.

## What GenLayer judges

Validators independently assess the bounded question: *what does a public interaction appear to be trying to do to this declared decoy, and what defensive lesson is supported by the evidence?* Deterministic contract code remains authoritative for authorization, IDs, policy snapshots, source allowlisting, replay prevention, state transitions, and publication permissions.

The only semantic result is a bounded defensive verdict. When evidence is unavailable, malformed, weak, contradictory, or cannot responsibly support a conclusion, the contract stores `INCONCLUSIVE`. It never labels a wallet or person.

## Lifecycle and safeguards

`lab → versioned source manifest → declared decoy → observed interaction → classification → finding → mitigation`

- Owner controls policy and defenders; authorized defenders manage decoys/findings.
- The manifest is canonical JSON text: `[{"source_type":"CONTEXT","url":"https://docs.genlayer.com/full-documentation.txt"}]`.
- Interaction creation snapshots policy version, manifest hash, and decoy charter hash.
- Duplicate `(chain, decoy, transaction hash)` submissions deterministically revert.
- The evidence fingerprint is contract-derived from immutable context; it is not accepted from the LLM.
- Classifications have bounded enums and validator-facing prompt-injection resistance. A single uncertain observation is handled conservatively.

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

`verify:onchain` deploys a fresh contract if `LURYN_CONTRACT_ADDRESS` is unset, then executes the sequential lifecycle (including the duplicate rejection) against StudioNet. It retries documented StudioNet rate-limit responses and reports actual transaction hashes only after execution succeeds. It may legitimately produce an `INCONCLUSIVE` classification when the configured public source cannot establish transaction provenance.

## Current deployment truth

Verified StudioNet deployment (2026-08-13):

- Contract: `0x31D0B4C3Bca6Bbe1642CC18be3379a9012bD36fb`
- Deployment: `0xc6f94a6a032a9067eb543b4111220ffe26a9756dab81ebfb2e2b006631a080a1`
- Source commit: `5d0d80e`
- Schema verification: passed, 16 public methods.

The sequential verifier completed `create_lab`, manifest configuration, decoy registration, interaction submission, replay rejection, classification, finding grouping, and mitigation. The classification correctly reached conservative `INCONCLUSIVE` because the fixture has no transaction-specific public evidence; its fingerprint was `0xd3332acf0b0f3a2187c891961fb087e4f0bd57855018b850f17f550a49aab93d`.

## Original multi-write failure

The original `set_source_manifest` expected a `str` then called `json.loads`. The CLI's structured parameter parser decoded JSON-looking text into a GenVM list, producing `TypeError: ... not list`; its fallback error was `allowlisted https manifest required`. `register_decoy` similarly treated a GenVM `Address` as a Python string. These were calldata/type-boundary defects, not evidence of successful contract execution. The repaired contract uses native `Address` types, explicit canonical manifest validation, and GenLayerJS verification that passes the manifest as an actual string.

Further evidence and exact local results are in [docs/development-evidence.md](docs/development-evidence.md).
