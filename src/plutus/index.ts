import plutus from "@/plutus/validators.json";
import {
  Data,
  applyDoubleCborEncoding,
  Constr,
  applyParamsToScript,
  MintingPolicy,
  mintingPolicyToId,
} from "@lucid-evolution/lucid";

export async function getOneShotMintValidator(
  transactionId: string,
  outputIndex: number,
) {
  const oneShotMintValidator = plutus.validators.find(
    (validator) => validator.title === "one_shot.one_shot.mint",
  );
  if (!oneShotMintValidator) {
    throw new Error("One shot validator not found");
  }
  const script = applyDoubleCborEncoding(oneShotMintValidator.compiledCode);
  const oref = new Constr(0, [transactionId, BigInt(outputIndex)]);
  const mintingScript = applyParamsToScript(script, [oref]);
  const mintingPolicy: MintingPolicy = {
    type: "PlutusV3",
    script: mintingScript,
  };
  const policyId = mintingPolicyToId(mintingPolicy);

  return {
    mintingPolicy,
    policyId,
  };
}
