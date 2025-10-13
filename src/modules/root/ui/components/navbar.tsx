"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export const Navbar = () => {

    return (
        <nav className={cn("p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
            // isScrolled && "border-border bg-background"
        )}>
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/vercel.svg" alt="" width={20} height={20} />
                    <span className="font-semibold text-lg">AuraFinance</span>
                </Link>

                <SignedOut>
                    <div className="flex gap-2">
                        <SignUpButton>
                            <Button variant="outline" size="sm">
                                Sign up
                            </Button>
                        </SignUpButton>

                        <SignInButton>
                            <Button size="sm">
                                Sign in
                            </Button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <UserButton showName/>
                </SignedIn>
            </div>
        </nav>
    )
}