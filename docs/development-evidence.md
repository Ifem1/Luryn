# Development evidence

## Steward remediation — 2026-08-14

The contract now requires at least one canonical `TRANSACTION_EVIDENCE` HTTPS source with a `{tx_hash}` placeholder. At classification time, validators fetch the source independently and require structured fetched data to contain both the submitted transaction hash and the registered decoy target. The interaction retains an immutable full charter snapshot, which is supplied to the judgment prompt. The resulting fingerprint now binds the transaction ID, immutable policy and manifest/charter hashes, plus a digest of the canonical URL/source-type/status/body-hash bundle.

Only the lab owner or an authorized defender can classify. Missing, malformed, unavailable, or off-target transaction evidence causes a `[TRANSIENT]` rollback and leaves the interaction `OBSERVED`, so it can be retried instead of being permanently settled by an arbitrary caller. Direct tests cover valid targeted evidence, off-target retryability, and unauthorized classification.

Fresh StudioNet deployment completed 2026-08-14: `0xa88b5bd7c0a9cf172b69271c94151d2c9672d13c7c3f65f6ae8f393674735ea0` → `0x5047a87c052344233E47df9f20E4BBAB912CAd02`. The full lifecycle reached `MITIGATED`; its evidence fingerprint was `0x0ac475c6f7733b1e8b737aec9441c852fd5d87bdea028e331384c4db9aeda9fa` and its evidence digest was `0xa1ec398c025f70e24c6eae884050958138b5dfc586d8d14287a209a66065c82f`.

## P0 sequential-write failure (2026-08-11)

The original deployed contracts exposed `set_source_manifest(lab_id, sources_json: str)`, but the smoke test passed a JSON array directly through the GenLayer CLI. The CLI parser decoded it as GenVM array/map calldata before Python execution. The contract then assumed native Python `str`, `list`, and `dict` values. This produced:

- `TypeError: json.loads(...): not str, bytes or bytearray, not list`;
- an allowlist rollback after fallback parsing found no native `dict` URL entry;
- an `Address`/`str` mismatch in decoy registration;
- `unknown decoy` / `inactive decoy` cascades in later writes.

Receipts showed those transactions could reach a terminal consensus status while the leader execution result was `ERROR`; finality alone was not success.

## Repair

The current contract makes the boundary unambiguous: the manifest is canonical JSON **text**, exactly as sent by GenLayerJS. It validates 1–4 `{ "source_type": "CONTEXT" | "TRANSACTION_EVIDENCE", "url": "https://…" }` entries and snapshots canonical text/hash/version when an interaction is created. The on-chain verifier uses GenLayerJS, not the CLI's JSON argument parser.

## Local verification

Run 2026-08-12:

```text
genvm-lint check contracts/luryn.py --json  PASS (3 checks)
pytest tests/direct -v                      PASS (4 tests)
npm run test                                PASS (1 test)
npm run lint                                PASS
npm run typecheck                           PASS
npm run build                               PASS
```

The direct suite includes the lifecycle, authorization, replay rejection, malformed manifest, inactive-decoy rejection, mocked consensus, and protocol-derived fingerprint path. Windows needs the contained `gltest` fd-0 cleanup workaround in `tests/direct/conftest.py`.
# Development evidence

## P0: post-first-write failure

The original `set_source_manifest` schema used a string and then called `json.loads`. The Studio CLI decoded JSON-looking calldata into a GenVM list before contract execution. That produced `TypeError: the JSON object must be str, bytes or bytearray, not list`; validation then surfaced `allowlisted https manifest required`. A separate `register_decoy` path used string operations on a native GenVM `Address`, producing `AttributeError: 'Address' object has no attribute 'startswith'`.

The repair uses the native `Address` type, canonical manifest JSON text, a strict documented manifest shape, and GenLayerJS writes for string calldata. It also inspects leader execution results after terminal consensus status.

## Local gates executed 2026-08-12

- `genvm-lint check contracts/luryn.py --json`: passed (16 methods: 11 writes, 5 views).
- `pytest tests/direct -v`: 4 passed.
- `npm.cmd exec eslint src -- --max-warnings=0`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 1 passed.
- `npm.cmd run build`: passed before the final, type-safe rate-limit-only update; the final lint/typecheck/test gates were rerun after it.

## StudioNet evidence

### Verified complete cycle — 2026-08-13

Deployment: `0xc6f94a6a032a9067eb543b4111220ffe26a9756dab81ebfb2e2b006631a080a1` → `0x31D0B4C3Bca6Bbe1642CC18be3379a9012bD36fb`.

- create lab: `0x275bc1ebc2995c3f745f6652df4334d76e9f46031b8956484becafc5db17bd39`
- set manifest: `0xa078f2491eab47d20cfc9a5898a5aff0ae609716934634ed7eaff2e66c9aeed3`
- register decoy: `0x70e90b16098f3c4f189e4911c7ae5b67260ac5473b31841513452060c2e1ae36`
- submit interaction: `0xf26084193f0e93d7b995a9e38313fdf5478811eb8226407cd42d4efcf83bc9cd`
- duplicate replay (expected rollback): `0x577f54683abada50d9ad51f7ce02eb69c8edb2bb1b39c12529a3371974a29dfe`
- classify: `0xe32a230983e80691409c55cb4b189115d88b670b56a67cf845c57c91ff6bd35f`
- group finding: `0x55d1fc89de5bd275a3c7f609e60943e23f351ae374bbfb52814fdb02ba85f91e`
- record mitigation: `0xe55a7341acbb31fd035da66419002266b1584afe1dbdf572c05d3a95d9d2b3ad`

The real consensus verdict was `INCONCLUSIVE`, `LOW`, `WEAK`, `UNKNOWN`, `HUMAN_REVIEW`, with policy version `2`, one session call, and deterministic fingerprint `0xd3332acf0b0f3a2187c891961fb087e4f0bd57855018b850f17f550a49aab93d`. The resulting finding status read back as `MITIGATED`. Schema verification passed with 16 methods.

Fresh verification deployment submitted: `0x627e79ddc4501f4f0af403f358940751d4d700f64050b850e93f091b50120a2e`.

The following real sequential writes were submitted from one fresh verifier account before StudioNet applied its global 500-request/hour ceiling:

1. `create_lab`: `0x81d44b520520276dd87d2672b6bc9e4c9fbf4a0abbcaa0b96a92891a263c46a8`
2. `set_source_manifest`: `0x79989cb862b8bec1f445ad1cbf5ab270eca721a1c35a78b94789c659d9a73100`
3. `register_decoy`: `0x920c0dae75856f6f41ff7aa3f64f729856e0eda0cb83dbe6079631632d7083cf`
4. `submit_interaction`: `0x93ad8630c46435e77b38e80fc238a51e7fba7b5cefdfd29915bc21e3ccb4c0f3`
5. duplicate `submit_interaction`: `0xa2d3e03974a671f563cc1253232d40a5e0db4c69403f8a9b389a389f449e4a3b`

The verifier’s first pass stopped because it read the duplicate leader error from the wrong GenLayerJS receipt field. That was corrected to use `leader.error`. The fresh rerun then met the external StudioNet `500 requests per hour` ceiling during receipt polling. No unverified contract address is advertised as a current deployment. The verifier now honours both minute and hourly rate-limit forms; rerun `npm.cmd run verify:onchain` after the external window resets.
