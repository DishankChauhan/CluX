"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <Link href="/">
                <h2 className="text-2xl font-bold">CluX</h2>
              </Link>
            </div>
            <h1 className="text-3xl font-semibold">Welcome back</h1>
          </div>
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <RainbowButton className="mt-2 w-full">
                  Sign In
                </RainbowButton>
                <Button variant="outline" className="w-full">
                  <FcGoogle className="mr-2 size-5" />
                  Sign in with Google
                </Button>
              </div>
            </div>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>Don't have an account?</p>
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
