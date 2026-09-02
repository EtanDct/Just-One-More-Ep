"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface AuthFormState {
  error?: string;
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw error; // rethrow: this is Next.js's internal redirect signal, not a real error
  }
}
