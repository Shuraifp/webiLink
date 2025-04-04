import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-gray-200">
      
      <Link href={'/'} className="text-4xl cursor-pointer font-bold lobster"><span className="text-yellow-500">w</span>ebiLink</Link>

      <nav className="hidden md:flex space-x-12">
        <Link href="/features" className="text-gray-700 hover:text-gray-900">
          Features
        </Link>
        <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
          Plans & Pricing
        </Link>
        <Link href="/resources" className="text-gray-700 hover:text-gray-900">
          Resources
        </Link>
      </nav>

      <div className="flex space-x-3">
        <Link href="/login" className="px-4 py-2 text-blue-600 hover:underline">
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}