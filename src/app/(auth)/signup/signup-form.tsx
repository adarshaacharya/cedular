"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { signupAction, type SignupFormState } from "./actions";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";

const initialState: SignupFormState = {
  errors: undefined,
  success: false,
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState<
    SignupFormState,
    FormData
  >(signupAction, initialState);

  const handleSignUpWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            disabled={isPending}
            minLength={2}
            maxLength={50}
            defaultValue={state?.inputs?.name}
            aria-invalid={state?.errors?.name ? "true" : "false"}
            aria-describedby={state?.errors?.name ? "name-error" : undefined}
          />
          {state?.errors?.name && (
            <p
              id="name-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.errors.name[0]}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            disabled={isPending}
            defaultValue={state?.inputs?.email}
            aria-invalid={state?.errors?.email ? "true" : "false"}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
          />
          {state?.errors?.email && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.errors.email[0]}
            </p>
          )}
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            required
            disabled={isPending}
            minLength={8}
            defaultValue={state?.inputs?.password}
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
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            disabled={isPending}
            aria-invalid={state?.errors?.confirmPassword ? "true" : "false"}
            aria-describedby={
              state?.errors?.confirmPassword
                ? "confirmPassword-error"
                : undefined
            }
          />
          {state?.errors?.confirmPassword && (
            <p
              id="confirmPassword-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {state.errors.confirmPassword[0]}
            </p>
          )}
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>

        {state?.errors?._form && (
          <div
            className="rounded-md bg-destructive/10 border border-destructive/20 p-3"
            role="alert"
          >
            <p className="text-sm text-destructive">{state.errors._form[0]}</p>
          </div>
        )}

        <Field>
          <LoadingButton
            type="submit"
            className="w-full font-medium h-11 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            loading={isPending}
            loadingText="Creating Account..."
          >
            Create Account
          </LoadingButton>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleSignUpWithGoogle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
