"use client";

import { MenuIcon, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { handleTheme } from "@/features/ThemeSlice";

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

interface Feature {
  title: string;
  description: string;
  href: string;
}

interface Navbar5Props {
  userId?: string | null;
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  accentGradient?: string;
  accentText?: string;
}

const Navbar5: React.FC<Navbar5Props> = ({
  accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400",
  accentText = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent",
}) => {
  // Redux theme state
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.Auth.userId)
  // const user = useAppSelector((state) => state.Auth.user)
  console.log(userId);
  
  const user = {
    name: "Navkirat Singh",
    email: "kirat@example.com",
    avatar: "https://github.com/shadcn.png",
  };
  const toggleDarkMode = () => dispatch(handleTheme());

  const [isLoggedIn] = useState<boolean>(true);

  // Features for dropdown – matches homepage sections
  // const features: Feature[] = [
  //   { title: "Features", description: "Explore the platform", href: "#features" },
  //   { title: "Community", description: "Join discussions", href: "#community" },
  //   { title: "Pricing", description: "View plans", href: "#pricing" },
  //   { title: "Events", description: "Upcoming hackathons", href: "#events" },
  // ];
  const features: Feature[] = [
    {
      title: "Code & Decode",
      description: "Participate in coding contests, solve daily puzzles, and challenge yourself with coding questions.",
      href : "/code-decode"
    },
    {
      title: "Feed",
      description: "Share your projects, ideas, and knowledge with the developer community.", 
      href : "/feed"
    },
    {
      title: "Project Collaboration",
      description: "Find team members for your projects or join exciting new initiatives.",
      href : "/collaborations"
    },
    {
      title: "Events",
      description: "Discover and promote tech events, hackathons, and meetups.",
      href : "/events"
    }
  ];

  const navClasses = `sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300 ${
    darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200"
  }`;

  const linkBaseClasses = `group inline-flex h-10 w-max items-center justify-center rounded-full bg-transparent px-4 py-2 text-sm font-medium transition-all duration-200 ${
    darkMode ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  }`;

  return (
    <header className={navClasses}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-bold text-sm`}>
            D
          </div>
          <span className={`text-xl font-bold tracking-tight ${accentText}`}>
            DevConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList className="flex gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`bg-transparent rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  darkMode
                    ? "text-gray-300 hover:text-white data-[state=open]:bg-gray-800 data-[state=open]:text-white"
                    : "text-gray-600 hover:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900"
                }`}
              >
                Explore
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className={`grid w-[400px] grid-cols-1 gap-2 p-4 rounded-xl border backdrop-blur-sm shadow-xl ${
                    darkMode
                      ? "bg-gray-900/95 border-gray-700"
                      : "bg-white/95 border-gray-200"
                  }`}
                >
                  {features.map((feature) => (
                    <NavigationMenuLink key={feature.title} asChild>
                      <Link
                        href={feature.href}
                        className="group rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <p
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {feature.title}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {feature.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/community" className={linkBaseClasses}>
                  Community
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/inbox" className={linkBaseClasses}>
                  Inbox
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/about" className={linkBaseClasses}>
                  About us
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side: theme toggle + auth */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-offset-2 ring-offset-transparent ring-violet-500/20 transition-all hover:ring-violet-500/40">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`w-48 rounded-xl border backdrop-blur-sm shadow-xl ${
                  darkMode
                    ? "bg-gray-900/95 border-gray-700 text-white"
                    : "bg-white/95 border-gray-200 text-gray-900"
                }`}
              >
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={darkMode ? "bg-gray-700" : "bg-gray-200"}
                />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${userId}`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className={`rounded-full ${
                    darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  className={`rounded-full bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105`}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              size="icon"
              variant="ghost"
              className={`${
                darkMode
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className={`backdrop-blur-xl border-b ${
              darkMode
                ? "bg-gray-900/95 border-gray-800 text-white"
                : "bg-white/95 border-gray-200 text-gray-900"
            }`}
          >
            <SheetHeader>
              <SheetTitle className={darkMode ? "text-white" : "text-gray-900"}>
                <span className={accentText}>DevConnect</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 p-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="features"
                  className={darkMode ? "border-gray-800" : "border-gray-200"}
                >
                  <AccordionTrigger
                    className={`py-3 text-base ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Explore
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {features.map((feature) => (
                      <Link
                        key={feature.title}
                        href={feature.href}
                        className={`block py-2 pl-4 text-sm rounded-md transition-all ${
                          darkMode
                            ? "text-gray-400 hover:text-white hover:bg-gray-800"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {feature.title}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 space-y-2">
                <Link
                  href="#community"
                  className={`block py-2 rounded-md transition-all ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Community
                </Link>
                <Link
                  href="#pricing"
                  className={`block py-2 rounded-md transition-all ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  href="#events"
                  className={`block py-2 rounded-md transition-all ${
                    darkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Events
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8 ring-2 ring-violet-500/20">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className={`justify-start ${
                        darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-800"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={toggleDarkMode}
                    >
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`justify-start ${
                        darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-800"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          darkMode
                            ? "text-gray-300 hover:text-white hover:bg-gray-800"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button
                        className={`w-full rounded-full bg-gradient-to-r ${accentGradient} text-white`}
                      >
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
};

export default Navbar5;