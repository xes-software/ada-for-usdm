import { useCardanoContext } from "./CardanoContext";
import Link from "next/link";

export default function Main() {
  const {
    lovelace,
    selectedWallet,
    setSelectedWallet,
    isCardanoContextLoading,
  } = useCardanoContext();

  return (
    <>
      {isCardanoContextLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {selectedWallet ? (
            <div>
              <h1>Cardano {selectedWallet}</h1>
              <h1>Lovelace: {lovelace}</h1>

              <button onClick={() => setSelectedWallet(null)}>
                Remove Wallet
              </button>
            </div>
          ) : (
            <div>
              <h1>No wallet selected</h1>
              <button onClick={() => setSelectedWallet("lace")}>
                Select Wallet
              </button>

              <Link href="/stuff">Go to Stuff</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
