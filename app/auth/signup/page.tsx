"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Initialize Supabase client
  useEffect(() => {
    const hasConfig =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasConfig) {
      setSupabase(createClientComponentClient());
      setIsConfigured(true);
    } else {
      setError("Supabase configuration missing. Check .env.local file.");
    }
  }, []);

  // ✅ Check session
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push("/home");
    })();
  }, [supabase, router]);

  // ✅ Email Sign-In
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      if (data.session) {
        // Store session in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }));
        
        // Get the redirect URL from query params or default to '/home'
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirectedFrom') || '/home';
        
        // Use router.push for client-side navigation
        router.push(redirectUrl);
        router.refresh(); // Ensure the page updates with the new auth state
      } else {
        // If no session but no error, user needs to verify email
        router.push('/auth/verify-email');
      }
    } catch (err: any) {
      setError(err.message || "Error creating account");
      setLoading(false);
    }
  };

  // ✅ Google OAuth
  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error signing in with Google");
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-center text-gray-800">
            ⚙️ Configuration Required
          </h2>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Add these to your <code>.env.local</code>:
          </p>
          <pre className="mt-4 bg-gray-100 p-3 rounded text-xs text-gray-800">
            NEXT_PUBLIC_SUPABASE_URL=your-supabase-url{"\n"}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center min-h-screen">
        <div className="text-center px-8 max-w-2xl">
          <Image
            src="/logo.png"
            alt="Logo"
            width={500}
            height={375}
            className="max-w-full h-auto mx-auto"
            style={{
              maxWidth: '80vw',
              height: 'auto'
            }}
          />
          <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
            Join CityPulse
          </h1>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-600">
            Create your account and get started
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-md w-full py-8">
          <div className="text-center lg:hidden mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={112}
              className="h-24 w-auto mx-auto"
            />
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>

          <div className="bg-white py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 rounded-2xl shadow-2xl border border-gray-100">
            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-300 text-red-700 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-6 sm:space-y-8">
              <form onSubmit={handleSignUp} className="space-y-6 sm:space-y-8">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-base sm:text-lg font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-base sm:text-lg"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-base sm:text-lg font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-base sm:text-lg"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    className="h-4 sm:h-5 w-4 sm:w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 sm:ml-3 block text-sm sm:text-base text-gray-700">
                    I agree to the terms
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-xl shadow-lg text-base sm:text-lg font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-xl py-3 sm:py-4 px-4 sm:px-6 bg-white hover:bg-gray-50 text-gray-700 text-base sm:text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
              >
                <FcGoogle className="text-xl sm:text-2xl" />
                Continue with Google
              </button>
            </div>

            <div className="mt-8 sm:mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm sm:text-base">
                  <span className="px-3 sm:px-4 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <a
                  href="/auth/signin"
                  className="font-medium text-gray-900 hover:text-gray-700 text-base sm:text-lg"
                >
                  Sign in to your account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
