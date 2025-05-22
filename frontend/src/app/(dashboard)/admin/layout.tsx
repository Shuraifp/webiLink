import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {


  return (
    <div className="flex min-h-screen bg-gray-100 overflow-y-scroll">
      <Sidebar />
      
      <div className="flex-1">{children}</div>
    </div>
  );
}
