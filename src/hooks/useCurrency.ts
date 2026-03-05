"use client";

import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
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

  const updateCurrency = async (
    newCode: string,
    convertExisting: boolean = true,
  ) => {
    if (!user) return;

    if (convertExisting && newCode !== currency.code) {
      try {
        // Fetch exchange rates
        const res = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${currency.code}`,
        );
        const data = await res.json();
        const rate = data.rates[newCode];

        if (rate) {
          const batch = writeBatch(db);
          let count = 0;

          // Helper to commit and get new batch if we hit 400 operations
          let currentBatch = batch;
          const checkBatchLimit = async () => {
            count++;
            if (count >= 400) {
              await currentBatch.commit();
              currentBatch = writeBatch(db);
              count = 0;
            }
          };

          // Update transactions
          const txSnap = await getDocs(
            query(collection(db, "transactions"), where("uid", "==", user.uid)),
          );
          for (const d of txSnap.docs) {
            const amount = d.data().amount || 0;
            currentBatch.update(d.ref, { amount: amount * rate });
            await checkBatchLimit();
          }

          // Update goals
          const goalsSnap = await getDocs(
            query(collection(db, "goals"), where("uid", "==", user.uid)),
          );
          for (const d of goalsSnap.docs) {
            const currentAmount = d.data().currentAmount || 0;
            const targetAmount = d.data().targetAmount || 0;
            currentBatch.update(d.ref, {
              currentAmount: currentAmount * rate,
              targetAmount: targetAmount * rate,
            });
            await checkBatchLimit();
          }

          // Update subscriptions
          const subsSnap = await getDocs(
            query(
              collection(db, "subscriptions"),
              where("uid", "==", user.uid),
            ),
          );
          for (const d of subsSnap.docs) {
            const amount = d.data().amount || 0;
            currentBatch.update(d.ref, { amount: amount * rate });
            await checkBatchLimit();
          }

          await currentBatch.commit();
        }
      } catch (e) {
        console.error("Failed to convert existing amounts:", e);
      }
    }

    // Set new base currency
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
