import { CardanoProvider } from "./CardanoContext";

export default function CardanoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardanoProvider>
      <section>{children}</section>
    </CardanoProvider>
  );
}
