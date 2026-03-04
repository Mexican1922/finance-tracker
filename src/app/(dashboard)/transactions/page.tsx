import TransactionList from "@/components/finance/TransactionList";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 pb-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Review your income and expenses over time.
        </p>
      </header>

      <TransactionList />
    </div>
  );
}
