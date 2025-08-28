import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import ProfileForm from "./profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

const UserOrderPage = async () => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="max-w-md space-y-4 mx-auto">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default UserOrderPage;
