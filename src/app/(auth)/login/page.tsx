import { LoginForm } from "./_components/login-form";
import { AuthIllustration } from "../_components/auth-illustration";
import Link from "next/link";
import { CedularLogo } from "@/components/brand/cedular-logo";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <CedularLogo className="h-7 w-7" />
            Cedular
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <AuthIllustration />
      </div>
    </div>
  );
}
