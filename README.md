# Luryn

**Let hostile probes teach the defense.** Luryn is an experimental GenLayer-native defensive cyberdeception lab for explicitly owned, bounded smart-contract decoys on Studionet. It classifies observed interaction behavior, not people or criminality.

## The GenLayer judgment

> What does this observed interaction appear to be trying to do to this declared defensive decoy, and what defensive lesson can responsibly be extracted from it?

Ordinary contracts record calls but cannot independently judge contextual intent from changing public evidence. Luryn uses GenLayer validator consensus for that semantic question while keeping authorization, IDs, policy locks, chain ID, replay checks, and state transitions deterministic.

## Lifecycle

`OBSERVED → CLASSIFYING → BENIGN | SCANNER | SUSPICIOUS | LIKELY_EXPLOIT_ATTEMPT | INCONCLUSIVE → MITIGATED`

The contract at `contracts/luryn.py` stores labs, decoys, observations, and compact verdicts. It locks a source manifest and uses a custom leader/validator pattern: both derive the result independently; validators require supported class and defense agreement. Weak, stale, blocked, or contradictory evidence must resolve safely as `INCONCLUSIVE`.

## Safety boundary

- Studionet/testnet and synthetic assets only.
- No deposits, malicious token mechanics, exploit payloads, credential collection, retaliation, or deanonymization.
- Public research must be sanitized. Verdicts are evidence-limited hypotheses, not accusations.

## Run

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

The current Studionet deployment is `0x660FDD28c566A262cC8f5Bf29769f1fd08d4ca16`. Deployment transaction: `0x7cefb0086efb6d171540efec598ad3fe556cd019ce9cd9fbd21065781552be79`. Until a local environment configures this address, the UI deliberately shows configuration-required and does not invent labs, addresses, transactions, or verdicts.

## Contract quality gates

Install the GenLayer tools, then run:

```powershell
pip install genvm-linter genlayer-test
genvm-lint check contracts/luryn.py --json
pytest tests/direct/ -v
```

The GenLayer dependency header is pinned to the currently documented runner hash. A live consensus path requires a configured GenLayer environment and independent public evidence adapters; no deployment has been made by this repository.

## Keeper

`scripts/keeper.mjs` is intentionally dry-run by default. A keeper may trigger a due classification transaction but must never produce the verdict or bypass contract checks.

## Current limitations

The contract contains the canonical core lifecycle and independent semantic validation pattern. The frontend is a truthful shell until a deployed address and verified `genlayer-js` schema are supplied. Source adapters, complete direct/integration tests, deployment, and dynamic contract reads are planned before a production-like rollout.
