import { NextResponse } from "next/server";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

// Ensure this route is always evaluated dynamically (no caching)
export const dynamic = "force-dynamic";

/**
 * Expected POST payload:
 * {
 *   "uid": "user_id_from_firebase",
 *   "text": "Your transfer of NGN 100.00 to NAME(OPay) has been confirmed by the beneficiary bank"
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, text } = body;

    if (!uid || !text) {
      console.error("Webhook Error: Missing uid or text", body);
      return NextResponse.json(
        { error: "Missing 'uid' or 'text' in payload." },
        { status: 400 },
      );
    }

    console.log("Received Webhook Payload:", body);

    const lowerText = text.toLowerCase();

    // 0. Strict Validation: Ignore obvious spam and internal-only transfers
    const blacklist = [
      "no deposit",
      "waje",
      "auto save",
      "cashbox",
      "sign up",
      "moved to your",
      "savings are on track",
      "bonus",
      "airtime",
    ];

    if (blacklist.some((keyword) => lowerText.includes(keyword))) {
      console.log("Ignored promotional or internal app notification.");
      return NextResponse.json(
        { success: true, message: "Ignored promotional or internal alert." },
        { status: 200 },
      );
    }

    // 0.5. Strict Whitelist: Ensure it actually contains a real financial keyword
    const transactionKeywords = [
      "received",
      "credit",
      "cr:",
      "incoming",
      "sent you",
      "deposit",
      "transfer of",
      "debit",
      "dr:",
      "payment",
      "paid",
      "amount",
      "ngn",
      "₦",
      "$",
      "usd",
    ];

    const isActualTransaction = transactionKeywords.some((keyword) =>
      lowerText.includes(keyword),
    );

    if (!isActualTransaction) {
      console.log(
        "Ignored non-transactional notification (no valid keywords found).",
      );
      return NextResponse.json(
        { success: true, message: "Ignored non-transactional alert." },
        { status: 200 },
      );
    }

    // 1. Bank-Specific Pattern Matching — determines BOTH type and clean note
    let type: "income" | "expense" = "expense"; // Default to expense
    let cleanNote = "";

    // --- PalmPay Debit (Push Notification) ---
    // "Your transfer of NGN 100.00 to NAME(Opay) has been confirmed by the beneficiary bank. Kindly note..."
    const palmpayDebitMatch = text.match(
      /Your transfer of.*?to\s+(.*?)\s+has(?:\s+been|\s+typically)?/i,
    );

    // --- PalmPay Credit (Push Notification) ---
    // "You received NGN 100.00 from NAME. Save smarter..."
    const palmpayCreditMatch = text.match(/you received.*?from\s+(.*?)\./i);

    // --- OPay Credit (Push Notification) ---
    // "Incoming Transfer Successful NAME has sent you 100.00 naira..."
    const opayPushCreditMatch = text.match(/(.*?)\s+has sent you/i);

    // --- OPay Credit (Email) ---
    // "Name:CHIBUZOR VALENTINE AZOLIBEBank:PalmPay"
    const opayEmailCreditMatch = text.match(/Name:\s*(.*?)\s*Bank:/i);

    // --- OPay Debit (Email) ---
    // "Your transfer of ₦200.00 to NAME is successful"
    const opayDebitEmailMatch = text.match(
      /your transfer of.*?to\s+(.*?)(?:\s+is successful|\s+has been)/i,
    );

    if (palmpayDebitMatch && palmpayDebitMatch[1]) {
      type = "expense";
      cleanNote = `To: ${palmpayDebitMatch[1].trim()} (PalmPay)`;
    } else if (palmpayCreditMatch && palmpayCreditMatch[1]) {
      type = "income";
      cleanNote = `From: ${palmpayCreditMatch[1].trim()} (PalmPay)`;
    } else if (
      opayEmailCreditMatch &&
      opayEmailCreditMatch[1] &&
      lowerText.includes("your transfer of")
    ) {
      // OPay Debit Email: "Your transfer of ₦100.00 is successful. Transfer Details: Name:RECIPIENT Bank:PalmPay"
      // Both "your transfer of" AND "Name:...Bank:" appear together — this is an EXPENSE
      type = "expense";
      cleanNote = `To: ${opayEmailCreditMatch[1].trim()} (OPay)`;
    } else if (opayEmailCreditMatch && opayEmailCreditMatch[1]) {
      // OPay Credit Email: Someone sent money TO you — "Name:SENDER Bank:..."
      type = "income";
      cleanNote = `From: ${opayEmailCreditMatch[1].trim()} (OPay)`;
    } else if (opayPushCreditMatch && opayPushCreditMatch[1]) {
      const name = opayPushCreditMatch[1]
        .replace(/Incoming Transfer Successful\s*/i, "")
        .trim();
      type = "income";
      if (name) cleanNote = `From: ${name} (OPay)`;
    } else if (opayDebitEmailMatch && opayDebitEmailMatch[1]) {
      type = "expense";
      cleanNote = `To: ${opayDebitEmailMatch[1].trim()} (OPay)`;
    } else {
      // Generic fallback for other banks / emails
      if (
        lowerText.includes("credit") ||
        lowerText.includes("received") ||
        lowerText.includes("incoming") ||
        lowerText.includes("deposit") ||
        lowerText.includes("sent you")
      ) {
        type = "income";
      }
      cleanNote = text
        .substring(0, 120)
        .replace(/save smarter, earn PLUS returns with safety.*/i, "")
        .replace(/get up to \d+% bonus on OPay Airtime.*/i, "")
        .replace(/kindly note the actual credited time.*/i, "")
        .trim();
    }

    // 2. Extract the Amount using Regex
    let amountRegex = /(?:NGN|₦|N|USD|EUR|GBP|\$|£|€)\s*([\d,]+\.?\d*)/i;
    let amountMatch = text.match(amountRegex);

    if (!amountMatch) {
      amountRegex = /(?:sent you|amount\s*:|transfer of)\s*([\d,]+\.?\d*)/i;
      amountMatch = text.match(amountRegex);
    }

    if (!amountMatch) {
      amountRegex = /([\d,]+\.\d{2})/i;
      amountMatch = text.match(amountRegex);
    }

    let amount = 0;
    if (amountMatch && amountMatch[1]) {
      const cleanNumber = amountMatch[1].replace(/,/g, "");
      amount = parseFloat(cleanNumber);
    }

    if (amount === 0 || isNaN(amount)) {
      return NextResponse.json(
        { error: "Could not parse amount from text.", originalText: text },
        { status: 422 },
      );
    }

    // 3. Save the Transaction to Firebase
    const newTransaction = {
      uid: uid,
      amount: amount,
      type: type,
      category: type === "income" ? "Transfer" : "General",
      date: Timestamp.fromDate(new Date()),
      notes: cleanNote || text.substring(0, 100),
      isRecurring: false,
    };

    const docRef = await addDoc(collection(db, "transactions"), newTransaction);

    return NextResponse.json({
      success: true,
      message: "Transaction added successfully via Webhook.",
      transactionId: docRef.id,
      parsedData: { amount, type, notes: newTransaction.notes },
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
