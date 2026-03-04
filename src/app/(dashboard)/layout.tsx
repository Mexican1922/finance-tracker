import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import QuickAddFab from "@/components/finance/QuickAddFab";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationBell from "@/components/layout/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar hidden on mobile, visible on sm+ */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 pb-20 sm:pb-6 px-4 pt-6 sm:px-8 max-w-7xl mx-auto w-full relative">
          {/* Notification Bell — top right */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-40">
            <NotificationBell />
          </div>
          {children}
        </main>

        {/* Universal Quick Add Button */}
        <QuickAddFab />

        {/* Bottom Nav hidden on desktop, visible on mobile */}
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
