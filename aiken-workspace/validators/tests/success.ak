use cardano/address.{from_verification_key}
use cardano/assets.{PolicyId, from_asset, zero}
use cardano/transaction.{
  Input, NoDatum, Output, OutputReference, Transaction, placeholder,
}
use one_shot

test successful_mint() {
  let policy_id: PolicyId =
    #"1c1b7afe8affbee1505cf3ec5a58bd2734d4ffdfcc9b9f059625bd76"
  let utxo_ref =
    OutputReference {
      transaction_id: #"1c1b7afeeeffbee1505cf3ec5a58bd2734d4ffdfcc9b9f059625bd76",
      output_index: 0,
    }
  let tx =
    Transaction {
      ..placeholder,
      inputs: [
        Input {
          output_reference: utxo_ref,
          output: Output {
            address: from_verification_key(
              #"1c1b7afeeeffbee1505cf3ec5a58bdeee4d4ffdfcc9b9f059625bd76",
            ),
            value: zero,
            datum: NoDatum,
            reference_script: None,
          },
        },
      ],
      mint: from_asset(policy_id, "Hello", 100),
    }

  one_shot.one_shot.mint(utxo_ref, Void, policy_id, tx)
}
