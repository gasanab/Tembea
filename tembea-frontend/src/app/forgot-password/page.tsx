"use client";

import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authApi } from "@/lib/api-client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "We could not submit your request. Please try again.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#D5F5E3] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-premium p-8 md:p-10">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#145A32] mb-6 transition-colors"
          >
            <ArrowLeft size={16} aria-hidden /> Back to sign in
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <span className="w-12 h-12 rounded-2xl bg-[#D5F5E3] flex items-center justify-center mb-4">
                  <Mail size={24} className="text-[#145A32]" aria-hidden />
                </span>
                <h1 className="text-2xl font-black text-gray-900">Reset your password</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the email you used to sign up and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label htmlFor="reset-email" className="text-sm font-bold text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`field-control pl-10 ${errors.email ? "border-red-400" : ""}`}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {errors.root?.message && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {errors.root.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-base btn-dark w-full justify-center text-base py-3"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-[#145A32]" aria-hidden />
              </div>
              <h2 className="text-xl font-black text-gray-900">Check your inbox</h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                If an account exists for <span className="font-bold text-gray-700">{getValues("email")}</span>,
                password-reset instructions will be sent there.
              </p>
              <Link href="/sign-in" className="btn-base btn-dark inline-flex">
                Back to sign in <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
