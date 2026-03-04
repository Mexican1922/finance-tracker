import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="glass-card w-full max-w-md p-10 text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Finance Tracker
        </h1>
        <p className="text-lg text-foreground/60">
          Your personal finances, beautifully designed.
        </p>
        <Link
          href="/login"
          className="block w-full bg-accent text-white py-3.5 px-4 rounded-2xl font-medium hover:opacity-90 transition-opacity mt-4 cursor-pointer"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
