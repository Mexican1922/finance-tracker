import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// --- Transactions ---

export interface Transaction {
  id?: string;
  uid: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Timestamp | Date;
  notes: string;
  isRecurring: boolean;
}

export const addTransaction = async (transaction: Omit<Transaction, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transaction,
      date:
        transaction.date instanceof Date
          ? Timestamp.fromDate(transaction.date)
          : transaction.date,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getTransactions = async (uid: string) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", uid),
      orderBy("date", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  } catch (e) {
    console.error("Error fetching transactions: ", e);
    throw e;
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "transactions", id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

export const updateTransaction = async (
  id: string,
  fields: Partial<Omit<Transaction, "id" | "uid">>,
) => {
  try {
    const txRef = doc(db, "transactions", id);
    await updateDoc(txRef, {
      ...fields,
      ...(fields.date instanceof Date
        ? { date: Timestamp.fromDate(fields.date) }
        : {}),
    });
  } catch (e) {
    console.error("Error updating transaction: ", e);
    throw e;
  }
};

// --- Goals ---
export interface SavingsGoal {
  id?: string;
  uid: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // e.g. "Dec 2026"
  createdAt: Timestamp | Date;
}

export const addGoal = async (goal: Omit<SavingsGoal, "id">) => {
  const docRef = await addDoc(collection(db, "goals"), {
    ...goal,
    createdAt:
      goal.createdAt instanceof Date
        ? Timestamp.fromDate(goal.createdAt)
        : goal.createdAt,
  });
  return docRef.id;
};

// --- Subscriptions ---
export interface Subscription {
  id?: string;
  uid: string;
  name: string;
  amount: number;
  billingCycle: string;
  category: string;
  nextBillingDate?: string; // Optional for now
  createdAt: Timestamp | Date;
}

export const addSubscription = async (sub: Omit<Subscription, "id">) => {
  const docRef = await addDoc(collection(db, "subscriptions"), {
    ...sub,
    createdAt:
      sub.createdAt instanceof Date
        ? Timestamp.fromDate(sub.createdAt)
        : sub.createdAt,
  });
  return docRef.id;
};
