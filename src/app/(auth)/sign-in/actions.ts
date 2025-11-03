"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
  message?: string;
  inputs?: {
    email?: string;
    password?: string;
  };
};

export async function signInAction(
  prevState: SignInFormState | null,
  formData: FormData
): Promise<SignInFormState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate with Zod
  const validationResult = signInSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: validationResult.error.message,
      inputs: {
        email: (rawData.email as string | null) ?? undefined,
        // Don't send password back for security
      },
    };
  }

  const { email, password } = validationResult.data;

  // Use server-side API for server actions
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    // Redirect to dashboard or home page on success
    redirect("/");
  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error ? error.message : "Invalid email or password",
        ],
      },
      success: false,
      inputs: {
        email,
        // Don't send password back for security
      },
    };
  }
}
