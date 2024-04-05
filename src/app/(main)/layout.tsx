import { signOut } from "@/auth";
import Header from "@/components/layout/header";

interface IProps {
  children: React.ReactNode;
}
const MainLayout = ({ children }: IProps) => {
  return (
    <>
      <Header />
      <main className="">{children}</main>
    </>
  );
};

export default MainLayout;
