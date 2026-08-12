from pathlib import Path
import pytest
from gltest.direct import VMContext, create_test_addresses, deploy_contract

CONTRACT = Path(__file__).parents[2] / "contracts" / "luryn.py"
MANIFEST = '[{"source_type":"CONTEXT","url":"https://docs.genlayer.com/full-documentation.txt"}]'
CHARTER = '{"purpose":"Synthetic no-value canary"}'
TX = "0x" + "11" * 32

@pytest.fixture()
def setup():
    owner, stranger = create_test_addresses(2)
    vm = VMContext()
    with vm.activate():
        vm.sender = owner
        contract = deploy_contract(CONTRACT, vm)
        yield vm, contract, owner, stranger

def create_lab(vm, contract):
    contract.create_lab("Test lab", "PRIVATE")
    contract.set_source_manifest(1, MANIFEST)
    return contract.register_decoy(1, "0x" + "aa" * 20, 61999, CHARTER)

def test_sequential_configuration_and_snapshot(setup):
    vm, contract, _, _ = setup
    decoy_id = create_lab(vm, contract)
    assert int(decoy_id) == 1
    assert contract.get_lab(1)["policy_version"] == 2
    assert contract.get_decoy(1)["active"] is True

def test_replay_and_owner_guards(setup):
    vm, contract, _, stranger = setup
    create_lab(vm, contract)
    contract.submit_interaction(1, TX, "session")
    with vm.expect_revert("duplicate interaction"):
        contract.submit_interaction(1, TX, "session")
    with vm.prank(stranger), vm.expect_revert("lab owner required"):
        contract.set_source_manifest(1, MANIFEST)

def test_malformed_manifest_and_inactive_decoy_revert(setup):
    vm, contract, _, _ = setup
    contract.create_lab("Test lab", "PRIVATE")
    with vm.expect_revert("sources_json must be JSON text"):
        contract.set_source_manifest(1, "not-json")
    create_lab(vm, contract)
    contract.set_decoy_active(1, False)
    with vm.expect_revert("inactive decoy"):
        contract.submit_interaction(1, TX, "")

def test_classification_stores_protocol_fingerprint(setup):
    vm, contract, _, _ = setup
    create_lab(vm, contract)
    contract.submit_interaction(1, TX, "session")
    vm.mock_web("docs.genlayer.com", {"status": 200, "body": "public context only"})
    vm.mock_llm(".*", '{"interaction_class":"INCONCLUSIVE","intent_confidence":"HIGH","pattern_family":"UNKNOWN","evidence_strength":"STRONG","novelty_band":"UNKNOWN","recommended_defense":"NO_ACTION","short_reason":"No transaction endpoint was provided."}')
    contract.classify_interaction(1)
    result = contract.get_classification(1)
    assert result["interaction_class"] == "INCONCLUSIVE"
    assert result["intent_confidence"] == "LOW"
    assert result["evidence_fingerprint"].startswith("0x")
