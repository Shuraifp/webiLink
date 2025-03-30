"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, Layers } from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const getLinkClassName = (path: string) => {
    return `flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                pathname === path
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
  }

  return (
    <aside className="w-56 bg-gray-900 text-white">
      <div className="text-4xl font-bold p-4 lobster cursor-pointer">
        <span className="text-yellow-500">w</span>ebiLink
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/admin"
              className={getLinkClassName("/admin")}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className={getLinkClassName("/admin/users")}
            >
              <Users className="w-5 h-5" />
              Users
            </Link>
          </li>
          <li>
            <Link
              href="/admin/subscription"
              className={getLinkClassName("/admin/subscription")}
            >
              <Layers className="w-5 h-5" />
              Subscription
            </Link>
          </li>
          <li key="plans">
            <Link href="/admin/plans" className={getLinkClassName("/admin/plans")}>
              <Package className="w-5 h-5" />
              Plans
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;