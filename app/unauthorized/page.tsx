import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unauthorized",
};

const Unauthorized = () => {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center space-y-4 h-[calc(100vh-200px)]">
      <h1 className="h1-bold text-4xl">Unauthorized</h1>
      <p className="text-muted-foreground">
        You are not allowed to this action!
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
};

export default Unauthorized;
