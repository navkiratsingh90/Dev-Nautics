"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { MenuIcon } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/redux/store";
import { IUser } from "@/models/user-model";

interface Feature {
  title: string;
  description: string;
  href: string;
}

export default function Navbar5() {
  const userData = useAppSelector<IUser>((state: any) => state.User.userData);

  const features: Feature[] = [
    {
      title: "Code & Decode",
      description:
        "Participate in coding contests, solve daily puzzles, and challenge yourself with coding questions.",
      href: "/code-decode",
    },
    {
      title: "Feed",
      description:
        "Share your projects, ideas, and knowledge with the developer community.",
      href: "/feed",
    },
    {
      title: "Project Collaboration",
      description:
        "Find team members for your projects or join exciting new initiatives.",
      href: "/collaborations",
    },
  ];

  const navClasses = "fixed top-0 left-0 right-0 z-50 border-b bg-[rgba(248,250,251,0.92)] border-[#E8EDF2]";
  const linkBaseClasses = "text-sm no-underline font-normal transition text-[#64748B] hover:text-[#0D1B2A]";
  const dropdownPanelClasses = "w-[360px] rounded-2xl border p-2 shadow-sm bg-white border-gray-200";

  return (
    <header className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#0EA472] flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="text-base font-bold tracking-[-0.3px] text-[#0D1B2A]">
            Dev<span className="text-[#0EA472]">Nautics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="bg-transparent px-0 py-0 h-auto text-sm font-normal shadow-none hover:bg-transparent text-[#64748B] hover:text-[#0D1B2A] data-[state=open]:bg-transparent data-[state=open]:text-[#0D1B2A]"
                >
                  Explore
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={dropdownPanelClasses}>
                    {features.map((feature) => (
                      <NavigationMenuLink key={feature.title} asChild>
                        <Link
                          href={feature.href}
                          className="block rounded-xl p-3 transition hover:bg-gray-100"
                        >
                          <p className="m-0 text-[14px] font-semibold text-[#0D1B2A]">
                            {feature.title}
                          </p>
                          <p className="m-0 mt-1 text-[12px] leading-relaxed text-[#64748B]">
                            {feature.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/community" className={linkBaseClasses}>
            Community
          </Link>
          <Link href="/inbox" className={linkBaseClasses}>
            Inbox
          </Link>
          <Link href="/about" className={linkBaseClasses}>
            About us
          </Link>
        </div>

        {/* Right section */}
        <div className="hidden lg:flex items-center gap-3">
          {userData?.isVerified == true ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border border-gray-200">
                  <AvatarImage src={""} alt={userData.username} />
                  <AvatarFallback className="bg-[#0EA472] text-white">
                    {userData.username[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 rounded-2xl border shadow-sm bg-white border-gray-200 text-[#0D1B2A]">
                <DropdownMenuLabel>{userData.username}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link href={`${userData._id}`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="rounded-xl text-[#0D1B2A] hover:bg-gray-100"
                >
                  Login
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              size="icon"
              variant="ghost"
              className="text-[#64748B] hover:bg-gray-100 hover:text-[#0D1B2A]"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="top"
            className="border-b bg-white border-gray-200 text-[#0D1B2A]"
          >
            <SheetHeader>
              <SheetTitle className="text-[#0D1B2A]">
                DevConnect
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 p-2">
              <span className="text-[#64748B]">Navigation</span>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="features" className="border-gray-200">
                  <AccordionTrigger className="py-3 text-base text-[#0D1B2A]">
                    Explore
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {features.map((feature) => (
                      <Link
                        key={feature.title}
                        href={feature.href}
                        className="block py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                      >
                        {feature.title}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 space-y-2">
                <Link
                  href="/community"
                  className="block py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                >
                  Community
                </Link>
                <Link
                  href="/inbox"
                  className="block py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                >
                  Inbox
                </Link>
                <Link
                  href="/about"
                  className="block py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                >
                  About us
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {userData?.isVerified == true ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8 border border-gray-200">
                        <AvatarImage src={""} />
                        <AvatarFallback className="bg-[#0EA472] text-white text-xs">
                          {userData.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{userData.username}</span>
                    </div>

                    <Link
                      href={`${userData._id}`}
                      className="block py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                    >
                      Profile
                    </Link>

                    <button
                      className="w-full text-left py-2 px-3 rounded-xl text-sm transition text-[#64748B] hover:text-[#0D1B2A] hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl text-[#0D1B2A] hover:bg-gray-100"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button className="w-full rounded-xl bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}