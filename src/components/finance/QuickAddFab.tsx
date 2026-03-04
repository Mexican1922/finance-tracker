"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";

export default function QuickAddFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <AddTransactionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
