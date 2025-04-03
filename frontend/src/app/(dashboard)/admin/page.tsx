import { Users, UserCheck, Layers } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButtom";

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <LogoutButton />
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Attendees</h3>
            <p className="text-2xl font-bold text-gray-900">9867</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <UserCheck className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Hosts</h3>
            <p className="text-2xl font-bold text-gray-900">754</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Layers className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Subscription
            </h3>
            <p className="text-2xl font-bold text-gray-900">67</p>
          </div>
        </div>
      </div>
    </div>
  );
}
