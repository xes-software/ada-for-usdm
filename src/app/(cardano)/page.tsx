"use client";
import Loading from "@/components/Loading";
import { useCardanoContext } from "./CardanoContext";
import Main from "./Main";

export default function CardanoPage() {
  const { isCardanoContextLoading } = useCardanoContext();
  return isCardanoContextLoading ? <Loading /> : <Main />;
}
