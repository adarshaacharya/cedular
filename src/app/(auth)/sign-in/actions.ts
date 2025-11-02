"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
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
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate with Zod
    const validationResult = signInSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        errors: validationResult.error.flatten().fieldErrors,
        success: false,
        message: validationResult.error.message,
        inputs: {
          email: rawData.email,
          // Don't send password back for security
        },
      };
    }

    const { email, password } = validationResult.data;

    // Get base URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get headers for cookies and origin
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    const origin = headersList.get("origin") || baseUrl;

    const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        Origin: origin,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        errors: {
          _form: [
            result.message ||
              result.error?.message ||
              "Invalid email or password. Please try again.",
          ],
        },
        success: false,
        inputs: {
          email,
          // Don't send password back for security
        },
      };
    }

    // Redirect to dashboard or home page on success
    redirect("/");
  } catch (error) {
    console.error("Sign-in error:", error);

    // Handle redirect error (expected when redirect is called)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        ],
      },
      success: false,
    };
  }
}
