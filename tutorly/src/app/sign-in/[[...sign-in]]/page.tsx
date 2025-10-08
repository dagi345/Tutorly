// 


"use client";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { AuthCard } from "@/components/AuthCard";

export default function SignInPage() {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const oAuth = (provider: "oauth_google") => async () => {
    if (!signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  };

  const forgot = () => {
    signIn
      ?.create({ strategy: "reset_password_email_code", identifier: email })
      .then(() => alert("Password-reset email sent!"))
      .catch(() => alert("Enter your email first"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4">
      <AuthCard>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back</h1>
        <p className="text-stone-600 mb-8">Sign in to your account</p>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={submit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-400 focus:outline-none text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-400 focus:outline-none text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold py-3 rounded-lg text-black"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          onClick={forgot}
          className="text-sm text-blue-600 hover:underline mt-2 block"
        >
          Forgot password?
        </button>

        <div className="relative my-6">
          <hr className="border-stone-300" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-50 px-3 text-sm text-stone-500">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-1 ">
          <button
            onClick={oAuth("oauth_google")}
            className="flex items-center justify-center gap-2 border border-stone-300 rounded-lg py-2.5 hover:bg-stone-100 text-black"
          >
            <FaGoogle className="text-green-400" /> Google
          </button>
          
        </div>

        <p className="text-center text-sm text-stone-600 mt-8">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}