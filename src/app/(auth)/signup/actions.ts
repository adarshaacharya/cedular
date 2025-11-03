"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
  success?: boolean;
  message?: string;
  inputs?: {
    name?: string;
    email?: string;
    password?: string;
  };
};

export async function signupAction(
  prevState: SignupFormState | null,
  formData: FormData
): Promise<SignupFormState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Validate with Zod
  const validationResult = signupSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      success: false,
      message: validationResult.error.message,
      inputs: {
        name: (rawData.name as string | null) ?? undefined,
        email: (rawData.email as string | null) ?? undefined,
        password: (rawData.password as string | null) ?? undefined,
        // Don't send password back for security
      },
    };
  }

  const { name, email, password } = validationResult.data;

  // Use server-side API for server actions
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: await headers(),
    });

    // Redirect to sign-in page on success
    redirect("/sign-in");
  } catch (error) {
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again.",
        ],
      },
      success: false,
      inputs: {
        name,
        email,
        password,
        // Don't send password back for security
      },
    };
  }
}
