import Image from "next/image";
import featureImage1 from "../../public/images/feature1.png";
import featureImage2 from "../../public/images/feature2.png"; 


const Features = () => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">
          Add flexibility, not complexity.
        </h2>

        <div className="relative flex justify-center mb-12">
          <div className="relative w-48 h-48">
            <Image
              src={featureImage1}
              alt="Feature image 1"
              // width={250}
              // height={192}
              className="absolute top-0 left-0 w-32 h-32 rounded-lg shadow-md transform -rotate-12"
            />
            <Image
              src={featureImage2}
              alt="Feature image 2"
              // width={192}
              // height={192}
              className="absolute bottom-0 right-0 w-32 h-32 rounded-lg shadow-md transform rotate-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              Instant, Secure Access
            </h3>
            <p className="text-gray-600 text-base md:text-lg">
              Join meetings directly with easy, one-click access—no downloads required.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              Seamless Host, Manage and Administration
            </h3>
            <p className="text-gray-600 text-base md:text-lg">
              Easily host, manage, and monitor meetings with a unified admin dashboard for complete control.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              Exceptional Audio Quality
            </h3>
            <p className="text-gray-600 text-base md:text-lg">
              Experience crystal-clear audio with advanced noise suppression.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;