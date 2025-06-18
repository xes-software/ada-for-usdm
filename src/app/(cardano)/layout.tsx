import { CardanoProvider } from "./CardanoContext";
import prisma from "@/lib/prisma";

export default async function CardanoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const transactions = await prisma.transaction.findMany();
  console.log("Logging transactions:", transactions);
  return (
    <CardanoProvider>
      <section>{children}</section>
    </CardanoProvider>
  );
}
