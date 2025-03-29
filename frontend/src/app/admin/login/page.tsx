import Link from "next/link";
import Login from "@/components/admin/Login";

const AdminLogin = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-white merriweather text-2xl font-bold text-center mb-6"><p className="text-4xl cursor-pointer inline font-bold lobster"><span className="text-yellow-500">w</span>ebiLink </p> Admin</h2>
        <Login />
        <div className="mt-4 text-center">
          <Link href="/" className="text-yellow-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
