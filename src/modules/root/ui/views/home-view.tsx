"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const features = [
    {
        title: "Intelligent News Aggregation",
        description: "Stay ahead of the market with AI-curated news from global sources. Get summaries in English or Chinese to quickly grasp market-moving information."
    },
    {
        title: "Comprehensive Market Data",
        description: "Access real-time and historical data for stocks, ETFs, and cryptocurrencies. Make informed decisions with a complete view of the market."
    },
    {
        title: "Dynamic Portfolio Manager",
        description: "Track your investments with our intuitive portfolio manager. Connect your assets and let our AI analyze your holdings to provide personalized insights."
    },
    {
        title: "Your Personal Financial AI",
        description: "Upload financial documents for analysis, ask complex financial questions, or get a summary of your portfolio's health. Your private and secure financial genius."
    }
];

export const HomeView = () => {
    return (
        <div className={cn("flex flex-col max-w-7xl mx-auto w-full transition-all duration-300 px-4")}>
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-8">
                <h1 className="text-4xl md:text-6xl font-bold font-libre tracking-tight">
                    The Future of Financial Intelligence
                </h1>
                <p className='text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto'>
                    AuraFinance is your all-in-one platform for intelligent financial data, news aggregation, and portfolio analysis. We empower you to make smarter decisions with cutting-edge AI.
                </p>
                <div className="flex justify-center gap-x-4">
                    <Button asChild size="lg">
                        <Link href="/home">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">A Powerful Suite of Financial Tools</h2>
                    <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto">
                        From breaking news to deep portfolio analysis, AuraFinance provides everything you need to navigate the financial markets with confidence.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature) => (
                        <Card key={feature.title} className="bg-card/50">
                            <CardHeader>
                                <div className="flex items-center gap-x-4">
                                    <CheckCircle className="w-8 h-8 text-primary" />
                                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};