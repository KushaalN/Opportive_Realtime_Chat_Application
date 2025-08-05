import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-xl">
              ChatConnect
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-black text-white hover:bg-gray-800 text-sm px-4">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* Hero section */}
        <section className="py-20 text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            Connect Instantly
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            A sleek, real-time chat application where users connect via
            usernames.
          </h3>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/signup" className="flex items-center hover:underline">
              Start chatting <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="flex items-center hover:underline">
              Sign in <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-[#f5f5f7] text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            Chat Features
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            Everything you need for seamless communication
          </h3>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/signup" className="flex items-center hover:underline">
              Try it now <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="flex items-center hover:underline">
              Sign in <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Real-Time Messaging</h4>
              <p className="text-gray-500">
                Instant message delivery with typing indicators and read
                receipts for seamless communication.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">User Discovery</h4>
              <p className="text-gray-500">
                Find and connect with others using their unique usernames. Build
                your network effortlessly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Status Indicators</h4>
              <p className="text-gray-500">
                See who's online, offline, or away. Stay connected with
                real-time presence updates.
              </p>
            </div>
          </div>
        </section>

        {/* Grid section for other features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              Simple Registration
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Get started in seconds with minimal information
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link to="/signup" className="flex items-center hover:underline">
                Sign up now <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="flex items-center hover:underline">
                Already have an account? <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded-md w-full flex items-center px-3">
                  <span className="text-xs text-gray-400">Username</span>
                </div>
                <div className="h-10 bg-gray-100 rounded-md w-full flex items-center px-3">
                  <span className="text-xs text-gray-400">Full Name</span>
                </div>
                <div className="h-10 bg-gray-100 rounded-md w-full flex items-center px-3">
                  <span className="text-xs text-gray-400">Email</span>
                </div>
                <div className="h-10 bg-gray-100 rounded-md w-full flex items-center px-3">
                  <span className="text-xs text-gray-400">Phone Number</span>
                </div>
                <div className="h-10 bg-black rounded-md w-full flex items-center justify-center">
                  <span className="text-xs text-white">Create Account</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              Modern Interface
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Beautiful design with customizable themes
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link to="/signup" className="flex items-center hover:underline">
                Try it out <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center hover:underline"
              >
                View demo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-gray-50 rounded w-16"></div>
                  </div>
                </div>
                <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-bl-sm ml-8 text-xs">
                  Hey! How are you doing?
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-br-sm mr-8 text-xs">
                  I'm great! Just working on some new features.
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-xs text-gray-400">typing...</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] py-12 text-xs text-gray-500">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="border-b border-gray-300 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                ChatConnect
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Security
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Get Started
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/signup" className="hover:underline">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:underline">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    User Guide
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Community
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    YouTube
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>Copyright © 2025 ChatConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
