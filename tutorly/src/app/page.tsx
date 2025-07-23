"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isSignedIn, user } = useUser();
 

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <UserButton />
      </header>

      {isSignedIn ? (
        <div>
          <p className="mb-2">Welcome {user?.firstName}</p>
          
        </div>
      ) : (
        <p>Please sign in to see tasks. <Button><SignInButton /> </Button ></p>
        
      )}
    </main>
  );
}