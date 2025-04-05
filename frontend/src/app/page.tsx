import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const userData = headersList.get("x-user");
  let user;
  if (userData) {
    user = JSON.parse(userData);
  }
  return (
    <div>
      <Navbar {...(userData && { user })} />
      <Banner {...(userData && { user })} />
    </div>
  );
}
