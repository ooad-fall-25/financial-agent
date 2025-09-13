"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const words = ["Generate your gadget with Aura"];

export const HomeView = () => {

    const getTextColors = (theme: string) => {
        if (theme === "dark") {
            return ["hsl(var(--foreground))"];
        }
        return ["hsl(var(--foreground))"];
    };


    return (
        <div className={cn("flex flex-col max-w-5xl mx-auto w-full transition-all duration-300")}>
            <section className="space-y-6 py-[16vh] 2xl:py-48">
                <div className="flex flex-col items-center gap-y-8">
                    {/* <Image
                        src="/logo.svg"
                        alt="Vibe"
                        width={50}
                        height={50}
                        className="hidden md:block"
                    /> */}
                    <h1 className="text-2xl md:text-5xl font-bold text-center font-libre">

                        {/* <TextType
                        text={words}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor={true}
                        cursorCharacter="|"
                        // textColors={getTextColors(currectTheme)}
                    /> */}
                        Smarter Financial Data Extraction & News Aggregation
                    </h1>

                    {/* <TextLoop className='text-base md:text-xl text-muted-foreground text-center max-w-5xl w-full mx-auto'>
                    <span>How can I assist you today?</span>
                    <span>What is octave in music</span>
                    <span>How to study linear algebra</span>
                    <span>Build a simple landing page in tsx</span>
                </TextLoop> */}
                    <p className='text-base md:text-xl text-muted-foreground text-center max-w-5xl w-full mx-auto'>
                        FinSight is your intelligent agent for financial data and news. It autonomously collects, analyzes, and summarizes market insights while supporting personalized queries, multilingual sources, and privacy-first data processing.
                    </p>

                    <Button asChild className="" size="lg">
                        <Link href="/home">
                            go to dashboard
                        </Link>
                    </Button>
                </div>
            </section>

        </div>
    )
}