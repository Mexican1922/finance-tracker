"use client";

import { useState } from "react";
import { X, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const { user } = useAuth();

  // Initialize state with current user data if available
  const [name, setName] = useState(user?.displayName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");
    try {
      // 1. Update Profile (DisplayName / Photo)
      await updateProfile(user, {
        displayName: name,
        photoURL: photoUrl,
      });

      // 2. Sync displayName to Firestore 'users' collection
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: name,
      });

      onClose();
    } catch (err: any) {
      console.error("Error updating profile", err);
      if (err.code === "auth/requires-recent-login") {
        setError(
          "Changing your email requires a recent login. Please log out and log back in to verify your identity.",
        );
      } else {
        setError(err.message || "An error occurred while updating.");
      }
    } finally {
      setIsLoading(false);
    }
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                  <UserIcon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Edit Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 py-3 px-4 outline-none ring-accent transition-all focus:border-accent focus:bg-transparent focus:ring-1"
                />
                <p className="mt-2 text-xs text-foreground/50 text-center">
                  Or you can use a service like Gravatar linked to your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
