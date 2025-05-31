import Image from "next/image";
import React from "react";
import bannerIMG from "../../public/images/bannerIMG.jpg";
import Link from "next/link";
import { UserData } from "@/types/type";

interface BannerProps {
  user?: UserData;
}

const Banner: React.FC<BannerProps> = ({ user }) => {

  return (
    <section className="bg-pink-100 py-12 md:py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Engaging and collaborative web communication
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Simplified online meeting software with enterprise-grade security –
            perfect for a work-wherever world.
          </p>
          {!user ? (
            <div className="flex space-x-4">
              <Link
                href="/pricing"
                className="bg-yellow-400 text-black font-semibold py-3 px-6 cursor-pointer rounded-lg hover:bg-yellow-500 transition"
              >
                Buy Now
              </Link>
              <Link
                href="/login"
                className="border border-gray-900 text-gray-900 font-semibold py-3 px-6 cursor-pointer rounded-lg hover:bg-gray-100 transition"
              >
                Try Free
              </Link>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link href="/host" className="bg-yellow-400 text-gray-900 font-semibold py-3 px-6 cursor-pointer rounded-lg shadow-md hover:bg-yellow-500 transition">
  Go Live Now
</Link>
            </div>
          )}
        </div>

        <div className="md:w-1/2 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-pink-300 rounded-lg z-0"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-300 rounded-lg z-0"></div>

          <div className="relative z-10">
            <Image
              src={bannerIMG}
              alt="Webinar screenshot"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-24 h-24 bg-black bg-opacity-0.5 rounded-full flex items-center justify-center cursor-pointer animate-pulseCustom hover:bg-opacity-30 transition-all duration-300 ease-in-out"
                aria-label="Play video"
                role="button"
              >
                {/* Play Triangle */}
                <div className="w-0 h-0 border-l-[24px] border-l-amber-300 border-y-[16px] border-y-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
