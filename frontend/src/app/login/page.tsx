import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import BackgroundIMG from "../../../public/images/login.jpeg";

export default function Home() {
  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen flex items-center justify-center bg-cover bg-center`}
        style={{ backgroundImage: `url(${BackgroundIMG.src})` }}
      >
        <div className="p-8 w-full max-w-md">
          <h2 className="text-3xl raleway font-bold text-center mb-6">
            Log in
          </h2>
          <Login />
        </div>
      </div>
    </>
  );
}
