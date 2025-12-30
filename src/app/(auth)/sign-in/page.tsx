"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../_components/auth-card";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      callbackURL: "/dashboard",
    });

    if (error) {
      setError(error.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your account to continue"
      footer={
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSignIn} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              className="pl-10"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder=""
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div
            className="rounded-md bg-destructive/10 border border-destructive/20 p-3"
            role="alert"
          >
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <LoadingButton
          type="submit"
          className="w-full font-medium h-11 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          loading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </LoadingButton>
      </form>
    </AuthCard>
  );
}
