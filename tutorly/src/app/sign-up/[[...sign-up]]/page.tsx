// import { SignUp } from "@clerk/nextjs";

// export default function Page() {
//   return <SignUp />;
// }

"use client";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FaGoogle, FaGithub } from "react-icons/fa";

import { AuthCard } from "@/components/AuthCard";

export default function SignUpPage() {
  const { signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const oAuth = (provider: "oauth_google") => async () => {
    if (!signUp) return;
    await signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  };

  if (step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4">
        <AuthCard>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Create account</h1>
          <p className="text-stone-600 mb-8">Start your journey today</p>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={createUser} className="space-y-5">
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

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
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    );
  }

  // verification step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 px-4">
      <AuthCard>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Check your email</h1>
        <p className="text-stone-600 mb-6">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>
        </p>

        {error && <p className="text-green-600 mb-4">{error}</p>}

        <form onSubmit={verifyCode} className="space-y-5">
          <input
            maxLength={6}
            placeholder="- - - - - -"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-2xl tracking-widest px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Verifying…" : "Verify code"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-600 mt-6">
          Wrong email?{" "}
          <button
            onClick={() => setStep("form")}
            className="font-semibold text-green-600 hover:underline"
          >
            Go back
          </button>
        </p>
      </AuthCard>
    </div>
  );
}