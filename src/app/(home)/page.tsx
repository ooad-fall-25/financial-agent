import { Button } from "@/components/ui/button";
import { HomeView } from "@/modules/root/ui/views/home-view";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <HomeView />
  );
}
