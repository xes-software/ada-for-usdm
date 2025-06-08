use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}

validator one_shot(utxo_ref: OutputReference) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    let Transaction { inputs, mint, .. } = self
    let minted_pairs =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    when minted_pairs is {
      [Pair(_asset_name, _quantity)] ->
        list.any(inputs, fn(input) { input.output_reference == utxo_ref })
      _ -> False
    }
  }

  else(_) {
    fail
  }
}
