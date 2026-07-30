"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api-client";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Use at most 72 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [complete, setComplete] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword(token, data.password);
      setComplete(true);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Your password could not be reset. Please request a new link.",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#D5F5E3] to-white p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-premium md:p-10">
        <Link href="/sign-in" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#145A32]">
          <ArrowLeft size={16} aria-hidden /> Back to sign in
        </Link>

        {!token ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <KeyRound size={26} className="text-amber-700" aria-hidden />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Reset link is invalid</h1>
            <p className="mt-2 text-sm text-gray-500">This page needs the token from your password-reset email.</p>
            <Link href="/forgot-password" className="btn-base btn-dark mt-6 inline-flex">Request a new link</Link>
          </div>
        ) : complete ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={28} className="text-emerald-700" aria-hidden />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Password updated</h1>
            <p className="mt-2 text-sm text-gray-500">You can now sign in with your new password.</p>
            <Link href="/sign-in" className="btn-base btn-dark mt-6 inline-flex">Sign in</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D5F5E3]">
                <KeyRound size={24} className="text-[#145A32]" aria-hidden />
              </span>
              <h1 className="text-2xl font-black text-gray-900">Choose a new password</h1>
              <p className="mt-1 text-sm text-gray-500">Use at least 8 characters, including an uppercase letter and a number.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">New password</label>
                <input id="password" type="password" autoComplete="new-password" className={`field-control ${errors.password ? "border-red-400" : ""}`} {...register("password")} />
                {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="text-sm font-bold text-gray-700">Confirm password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" className={`field-control ${errors.confirmPassword ? "border-red-400" : ""}`} {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs font-semibold text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              {errors.root?.message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{errors.root.message}</p>}
              <button type="submit" disabled={isSubmitting} className="btn-base btn-dark w-full justify-center py-3 text-base disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
