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
          <Button variant="outline" type="button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
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
