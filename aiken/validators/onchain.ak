use cardano/address.{Credential}
use cardano/assets.{PolicyId}
use cardano/certificate.{Certificate}
use cardano/governance.{ProposalProcedure, Voter}
use cardano/transaction.{OutputReference, Transaction}

validator onchain {
  mint(_redeemer: Data, _policy_id: PolicyId, _self: Transaction) {
    True
  }

  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    True
  }

  withdraw(_redeemer: Data, _account: Credential, _self: Transaction) {
    True
  }

  publish(_redeemer: Data, _certificate: Certificate, _self: Transaction) {
    True
  }

  vote(_redeemer: Data, _voter: Voter, _self: Transaction) {
    True
  }

  propose(_redeemer: Data, _proposal: ProposalProcedure, _self: Transaction) {
    True
  }
}
