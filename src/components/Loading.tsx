"use client";
import Logo from "./Logo";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <Logo className="w-64 h-64 animate-pulse" />
    </div>
  );
}
