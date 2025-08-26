import Menu from "@/components/shared/header/menu";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import MainNav from "./main-nav";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/">
              <Image
                src="/images/logo.svg"
                priority={true}
                alt={`${APP_NAME} logo`}
                width={40}
                height={40}
              />
            </Link>
            <MainNav className="mx-4"/>
            <div className="flex items-center ml-auto space-x-4">
              <Menu />
            </div>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </>
  );
}
