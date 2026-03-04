import { NextResponse } from "next/server";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

// Ensure this route is always evaluated dynamically (no caching)
export const dynamic = "force-dynamic";

/**
 * Expected POST payload:
 * {
 *   "uid": "user_id_from_firebase",
 *   "text": "Acct:1234 Debit: NGN 5,000.00 Desc: GROCERIES Date: 03-Oct"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, text } = body;

    if (!uid || !text) {
      return NextResponse.json(
        { error: "Missing 'uid' or 'text' in payload." },
        { status: 400 },
      );
    }

    // 1. Determine Transaction Type (Debit vs Credit)
    // We look for common keywords in bank SMS alerts.
    const lowerText = text.toLowerCase();
    let type: "income" | "expense" = "expense"; // Default to expense

    if (
      lowerText.includes("credit") ||
      lowerText.includes("cr:") ||
      lowerText.includes("received")
    ) {
      type = "income";
    }

    // 2. Extract the Amount using Regex
    // This regex looks for currency symbols or words (NGN, $, USD), followed by optional spaces,
    // then numbers with optional commas and decimals.
    // E.g., Matches: "NGN 5,000.00", "$45.99", "1,234.56"
    const amountRegex = /(?:NGN|USD|EUR|GBP|\$|£|€)?\s*([\d,]+\.?\d*)/i;
    const amountMatch = text.match(amountRegex);

    let amount = 0;
    if (amountMatch && amountMatch[1]) {
      // Remove commas and parse to float
      const cleanNumber = amountMatch[1].replace(/,/g, "");
      amount = parseFloat(cleanNumber);
    }

    if (amount === 0 || isNaN(amount)) {
      return NextResponse.json(
        {
          error: "Could not parse amount from text.",
          originalText: text,
        },
        { status: 422 },
      );
    }

    // 3. Create the Transaction Object matching our Schema
    const newTransaction = {
      uid: uid,
      amount: amount,
      type: type,
      category: type === "income" ? "Transfer" : "General", // Default categories
      date: Timestamp.fromDate(new Date()), // Use current server time
      notes: text.substring(0, 100), // Save the first 100 chars of the SMS as a note
      isRecurring: false,
    };

    // 4. Save to Firebase
    const docRef = await addDoc(collection(db, "transactions"), newTransaction);

    return NextResponse.json({
      success: true,
      message: "Transaction added successfully via Webhook.",
      transactionId: docRef.id,
      parsedData: {
        amount,
        type,
      },
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
