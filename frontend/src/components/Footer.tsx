import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-3xl text-white font-bold lobster"
                >
                  <span className="text-yellow-500">w</span>ebiLink
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-gray-400 hover:text-gray-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/our-vision"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Our Vision
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-gray-400 hover:text-gray-200"
                >
                  View All Features
                </Link>
              </li>
              <li>
                <Link
                  href="/features#transcript&recording"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Record Meetings
                </Link>
              </li>
              <li>
                <Link
                  href="/features#transcript&recording"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Meeting Transcription
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Pricing</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-gray-200"
                >
                  For Meetings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/support"
                  className="text-gray-400 hover:text-gray-200"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
