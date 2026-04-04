
'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignUp = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left marketing panel */}
      <div className="hidden w-1/2 bg-primary p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-foreground">
          Sellora
        </Link>
        <div>
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Start selling smarter today
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Join thousands of small businesses using Sellora to organize orders, delight customers, and grow revenue.
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
          <h1 className="mb-2 text-2xl font-bold">Create your account</h1>
          <p className="mb-8 text-muted-foreground">
            Get started free — no credit card required.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <Input id="fullname" placeholder="Amara Olashile Sanni" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="amara@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+234 800 000 0000" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm your password" className="mt-1.5" />
            </div>
            <Button className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
