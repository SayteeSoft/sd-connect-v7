
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, LogIn, Coins, Heart } from "lucide-react";
import { ThemeSwitcher } from "../theme-switcher";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { isLoggedIn, user, isLoading, logout, credits } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };
  
  const handleProfile = () => {
    if (user) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push('/profile');
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const navLinks = [
    { href: "/profile", label: "Profile" },
    { href: "/messages", label: "Messages" },
    { href: "/search", label: "Search" },
    { href: "/matches", label: "Matches" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-headline text-3xl font-bold text-primary">
            SD Connect
          </span>
        </Link>
        <nav className="hidden items-center justify-center space-x-6 text-lg font-medium md:flex flex-grow">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-foreground/60 transition-colors hover:text-primary",
                pathname.startsWith(link.href) && "text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          {isLoading ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : (
            <>
              {isLoggedIn && user && (user.role === 'daddy' && user.id !== 1) && (
                <Button asChild size="sm">
                  <Link href="/purchase-credits">
                    Buy Credits
                    <Badge variant="secondary" className="ml-2 rounded-full px-2">{credits}</Badge>
                  </Link>
                </Button>
              )}
              {isLoggedIn && user && (user.role === 'baby' || user.id === 1) && (
                 <div className="flex items-center gap-2 h-10 px-3 text-sm font-medium whitespace-nowrap">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Unlimited Credits</span>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.imageUrl ?? "https://placehold.co/100x100.png"}
                        data-ai-hint={user?.hint ?? "person"}
                        alt={user?.name ?? "@user"}
                      />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {isLoggedIn && user ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleProfile}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleSettings}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                     <>
                        <DropdownMenuItem onSelect={handleLogin}>
                          <LogIn className="mr-2 h-4 w-4" />
                          <span>Log In</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push('/signup')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Sign Up</span>
                        </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
