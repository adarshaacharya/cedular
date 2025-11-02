"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const signupSchema = z.object({
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
});

export type SignupFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
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
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate with Zod
    const validationResult = signupSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        errors: validationResult.error.flatten().fieldErrors,
        success: false,
        message: validationResult.error.message,
        inputs: rawData,
      };
    }

    const { name, email, password } = validationResult.data;

    // Get base URL from environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get headers for cookies and origin
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    const origin = headersList.get("origin") || baseUrl;

    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        Origin: origin,
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    // Safely parse JSON response
    let result: { message?: string; error?: { message?: string } } = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        result = {};
      }
    }

    if (!response.ok) {
      // Extract user-friendly error message
      let errorMessage = "Failed to create account. Please try again.";

      // Handle server errors (500, etc.)
      if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (result.message) {
        // Better-auth returns specific error messages
        if (
          result.message.includes("already exists") ||
          result.message.includes("Email already")
        ) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        } else if (result.message.includes("Missing or null Origin")) {
          errorMessage = "Registration error. Please try again.";
        } else {
          errorMessage = result.message;
        }
      } else if (result.error?.message) {
        errorMessage = result.error.message;
      }

      return {
        errors: {
          _form: [errorMessage],
        },
        success: false,
        inputs: {
          name,
          email,
          // Don't send password back for security
        },
      };
    }

    // Redirect to sign-in page on success
    redirect("/sign-in");
  } catch (error) {
    console.error("Signup error:", error);

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
