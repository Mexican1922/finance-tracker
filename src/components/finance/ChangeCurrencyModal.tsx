"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency, CURRENCIES } from "@/hooks/useCurrency";

interface ChangeCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
}

// CURRENCIES is imported from useCurrency hook

export default function ChangeCurrencyModal({
  isOpen,
  onClose,
  currentCurrency,
}: ChangeCurrencyModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const { updateCurrency } = useCurrency();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateCurrency(selectedCurrency);
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md overflow-hidden rounded-3xl bg-background/60 p-6 shadow-2xl backdrop-blur-xl border border-foreground/10 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Wallet className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Base Currency
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {CURRENCIES.map((currency) => (
                  <label
                    key={currency.code}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all hover:bg-foreground/5 ${
                      selectedCurrency === currency.code
                        ? "border-accent bg-accent/5"
                        : "border-foreground/10 bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-medium ${selectedCurrency === currency.code ? "bg-accent text-white" : "bg-foreground/10 text-foreground/70"}`}
                      >
                        {currency.symbol}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {currency.code}
                        </div>
                        <div className="text-xs text-foreground/60">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="currency"
                      value={currency.code}
                      checked={selectedCurrency === currency.code}
                      onChange={() => setSelectedCurrency(currency.code)}
                      className="h-5 w-5 border-foreground/20 text-accent focus:ring-accent accent-accent"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
