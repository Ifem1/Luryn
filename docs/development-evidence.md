# Development evidence

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

Fresh verification deployment submitted: `0x627e79ddc4501f4f0af403f358940751d4d700f64050b850e93f091b50120a2e`.

The following real sequential writes were submitted from one fresh verifier account before StudioNet applied its global 500-request/hour ceiling:

1. `create_lab`: `0x81d44b520520276dd87d2672b6bc9e4c9fbf4a0abbcaa0b96a92891a263c46a8`
2. `set_source_manifest`: `0x79989cb862b8bec1f445ad1cbf5ab270eca721a1c35a78b94789c659d9a73100`
3. `register_decoy`: `0x920c0dae75856f6f41ff7aa3f64f729856e0eda0cb83dbe6079631632d7083cf`
4. `submit_interaction`: `0x93ad8630c46435e77b38e80fc238a51e7fba7b5cefdfd29915bc21e3ccb4c0f3`
5. duplicate `submit_interaction`: `0xa2d3e03974a671f563cc1253232d40a5e0db4c69403f8a9b389a389f449e4a3b`

The verifier’s first pass stopped because it read the duplicate leader error from the wrong GenLayerJS receipt field. That was corrected to use `leader.error`. The fresh rerun then met the external StudioNet `500 requests per hour` ceiling during receipt polling. No unverified contract address is advertised as a current deployment. The verifier now honours both minute and hourly rate-limit forms; rerun `npm.cmd run verify:onchain` after the external window resets.
