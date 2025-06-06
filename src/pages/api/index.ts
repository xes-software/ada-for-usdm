import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await prisma.transaction.create({
    data: {
      txHash: "0x1234567890",
    },
  });
  return res.status(200).json({ message: "OK" });
}
