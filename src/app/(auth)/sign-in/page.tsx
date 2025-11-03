"use client";

import { useActionState } from "react";
import { signInAction, type SignInFormState } from "./actions";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../_components/auth-card";
import { Mail } from "lucide-react";
import Link from "next/link";

const initialState: SignInFormState = {
  errors: undefined,
  success: false,
};

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState<
    SignInFormState,
    FormData
  >(signInAction, initialState);

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
      <form action={formAction} className="space-y-5">
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
              disabled={isPending}
              required
              defaultValue={state?.inputs?.email}
              aria-invalid={state?.errors?.email ? "true" : "false"}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
            />
          </div>
          {state?.errors?.email && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.errors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            disabled={isPending}
            required
            aria-invalid={state?.errors?.password ? "true" : "false"}
            aria-describedby={
              state?.errors?.password ? "password-error" : undefined
            }
          />
          {state?.errors?.password && (
            <p
              id="password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {state?.errors?._form && (
          <div
            className="rounded-md bg-destructive/10 border border-destructive/20 p-3"
            role="alert"
          >
            <p className="text-sm text-destructive">{state.errors._form[0]}</p>
          </div>
        )}

        <LoadingButton
          type="submit"
          className="w-full font-medium h-11 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          loading={isPending}
          loadingText="Signing in..."
        >
          Sign In
        </LoadingButton>
      </form>
    </AuthCard>
  );
}
