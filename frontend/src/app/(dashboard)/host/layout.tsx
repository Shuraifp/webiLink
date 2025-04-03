import Sidebar from "@/components/user-Dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-200">
      <Sidebar />
      
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
