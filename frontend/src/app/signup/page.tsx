import Signup from "../../components/Signup";
import img from "../../../public/images/1.webp";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <nav className="p-4 bg-white">
        <Link href="/" className="text-4xl font-bold lobster cursor-pointer">
          <span className="text-yellow-500">w</span>ebiLink
        </Link>
      </nav>

      <div className="flex md:flex-1">
        
        <div className="w-1/2 flex flex:1 items-center justify-cente relative">
          <div className=" hidden md:block bg-amber-300">
            <Image
              src={img}
              alt="Background"
              width={700}
              height={700}
              // layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>
        </div>

        <Signup />
      </div>
    </div>
  )
}
