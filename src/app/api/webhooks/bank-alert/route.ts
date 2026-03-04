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
      console.error("Webhook Error: Missing uid or text", body);
      return NextResponse.json(
        { error: "Missing 'uid' or 'text' in payload." },
        { status: 400 },
      );
    }

    console.log("Received Webhook Payload:", body);

    const lowerText = text.toLowerCase();

    // 0. Strict Validation: Ignore obvious spam and internally moving money
    const blacklist = [
      "no deposit",
      "waje",
      "auto save",
      "cashbox",
      "sign up",
      "moved to your",
      "savings are on track",
      "bonus", // ignore bonus ads
      "airtime", // ignore airtime ads unless you want to track airtime
    ];

    if (blacklist.some((keyword) => lowerText.includes(keyword))) {
      console.log("Ignored promotional or internal app notification.");
      return NextResponse.json(
        { success: true, message: "Ignored promotional or internal alert." },
        { status: 200 }, // Send 200 so MacroDroid doesn't treat it as a failure
      );
    }

    // 0.5. Strict Whitelist: Ensure it actually contains financial transaction words
    const transactionKeywords = [
      "received",
      "credit",
      "cr:",
      "incoming",
      "sent you",
      "deposit", // Income
      "transfer of",
      "debit",
      "dr:",
      "payment",
      "paid", // Expense
      "amount",
      "ngn",
      "₦",
      "$",
      "usd", // Currency
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
        { status: 200 }, // Send 200 so MacroDroid doesn't treat it as a failure
      );
    }

    // 1. Determine Transaction Type (Debit vs Credit)
    // We look for common keywords in bank SMS alerts.
    let type: "income" | "expense" = "expense"; // Default to expense

    if (
      lowerText.includes("credit") ||
      lowerText.includes("cr:") ||
      lowerText.includes("received") ||
      lowerText.includes("incoming") ||
      lowerText.includes("sent you") ||
      lowerText.includes("deposit")
    ) {
      type = "income";
    }

    // 2. Extract the Amount using Regex
    // First, try to find a currency symbol followed by a number
    let amountRegex = /(?:NGN|₦|N|USD|EUR|GBP|\$|£|€)\s*([\d,]+\.?\d*)/i;
    let amountMatch = text.match(amountRegex);

    // Second, if no currency symbol, look for contextual keywords like "sent you 200"
    if (!amountMatch) {
      amountRegex = /(?:sent you|amount\s*:|transfer of)\s*([\d,]+\.?\d*)/i;
      amountMatch = text.match(amountRegex);
    }

    // Finally, fallback to finding any number that explicitly has a decimal (e.g., 208.00)
    // We avoid matching whole numbers here so we don't accidentally match an account number!
    if (!amountMatch) {
      amountRegex = /([\d,]+\.\d{2})/i;
      amountMatch = text.match(amountRegex);
    }

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
    let cleanNote = text.substring(0, 100);

    // OPay Email format: "Name:CHIBUZOR VALENTINE AZOLIBEBank:PalmPay"
    const opayEmailMatch = text.match(/Name:\s*(.*?)\s*Bank:/i);
    // OPay Push format: "Incoming Transfer Successful CHIBUZOR VALENTINE AZOLIBE has sent you"
    const opayPushMatch = text.match(/(.*?)\s+has sent you/i);
    // PalmPay Incoming format: "You received NGN 100.00 from CHIBUZOR VALENTINE AZOLIBE. Save smarter..."
    const palmpayInMatch = text.match(/You received.*?from\s+(.*?)\./i);
    // PalmPay Outgoing format: "Your transfer of NGN 100.00 to CHIBUZOR VALENTINE AZOLIBE(OPay) has been confirmed"
    const palmpayOutMatch =
      text.match(/Your transfer of.*?to\s+(.*?)\s+has typically/i) ||
      text.match(/Your transfer of.*?to\s+(.*?)\s+has been/i) ||
      text.match(/Your transfer of.*?to\s+(.*?)\s+has/i);

    if (opayEmailMatch && opayEmailMatch[1]) {
      cleanNote = `From: ${opayEmailMatch[1].trim()} (OPay)`;
    } else if (opayPushMatch && opayPushMatch[1]) {
      let name = opayPushMatch[1]
        .replace(/Incoming Transfer Successful\s*/i, "")
        .trim();
      if (name) cleanNote = `From: ${name} (OPay)`;
    } else if (palmpayInMatch && palmpayInMatch[1]) {
      cleanNote = `From: ${palmpayInMatch[1].trim()} (PalmPay)`;
    } else if (palmpayOutMatch && palmpayOutMatch[1]) {
      let name = palmpayOutMatch[1].trim();
      cleanNote = `To: ${name} (PalmPay)`;
    } else {
      // Fallback cleanup
      cleanNote = cleanNote
        .replace(/Save smarter, earn PLUS returns with safety.*/i, "")
        .trim();
      cleanNote = cleanNote
        .replace(/Get up to 6% bonus on OPay Airtime.*/i, "")
        .trim();
    }

    const newTransaction = {
      uid: uid,
      amount: amount,
      type: type,
      category: type === "income" ? "Transfer" : "General", // Default categories
      date: Timestamp.fromDate(new Date()), // Use current server time
      notes: cleanNote, // Save the cleaned note
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
