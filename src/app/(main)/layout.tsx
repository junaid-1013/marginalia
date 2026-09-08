import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Header from "@/components/layout/header";

interface IProps {
  children: React.ReactNode;
}

const MainLayout = async ({ children }: IProps) => {
  const session = await auth();
  // the middleware already sends visitors to /login, this covers a session that expired mid-request
  if (!session?.user) redirect("/login");

  const { name, email, image } = session.user;
  return (
    <>
      <Header user={{ name, email, image }} />
      <main>{children}</main>
    </>
  );
};

export default MainLayout;
