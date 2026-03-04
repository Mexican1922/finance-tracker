"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/components/auth/AuthProvider";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export function useCurrency() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrency(CURRENCIES[0]);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().baseCurrency) {
        const code = docSnap.data().baseCurrency;
        const found = CURRENCIES.find((c) => c.code === code);
        if (found) {
          setCurrency(found);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateCurrency = async (newCode: string) => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      { baseCurrency: newCode },
      { merge: true },
    );
  };

  const formatAmount = (amount: number) => {
    return `${currency.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return { currency, loading, updateCurrency, formatAmount };
}
