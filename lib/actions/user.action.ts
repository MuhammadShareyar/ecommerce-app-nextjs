"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signInFormSchema } from "../validator";
import { signIn, signOut } from "@/auth";

// sigin user
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "User login successfull" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid credentials" };
  }
}

// signout user
export async function signOutUser() {
  await signOut();
}
