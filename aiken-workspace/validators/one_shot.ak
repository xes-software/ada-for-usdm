use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}

validator one_shot(utxo_ref: OutputReference) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    let Transaction { inputs, mint, .. } = self
    expect [Pair(_asset_name, _quantity)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()
    let is_output_consumed =
      list.any(inputs, fn(input) { input.output_reference == utxo_ref })
    is_output_consumed
  }

  else(_) {
    fail
  }
}
