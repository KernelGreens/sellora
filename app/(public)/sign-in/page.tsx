
'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignIn = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left marketing panel */}
      <div className="hidden w-1/2 bg-primary p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-foreground">
          Sellora
        </Link>
        <div>
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Welcome back
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Your orders, customers, and insights are waiting. Pick up right where you left off.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Sellora
        </p>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-2xl font-bold text-primary">Sellora</Link>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Sign in to Sellora</h1>
          <p className="mb-8 text-muted-foreground">
            Enter your credentials to access your dashboard.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="amara@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" className="mt-1.5" />
            </div>
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
