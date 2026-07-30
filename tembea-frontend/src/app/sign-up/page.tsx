"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { RWANDA_IMAGES } from "@/utils/constants/rwanda-images";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["client", "partner"]),
  terms: z.boolean().refine((v) => v === true, "You must accept the terms"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "client" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.name, data.email, data.password, data.role.toUpperCase() as "CLIENT" | "PARTNER");
      router.push(data.role === "partner" ? "/partner/onboarding" : "/client");
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0d7c66] to-[#145A32] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url('${RWANDA_IMAGES.landscape}')`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-2xl font-bold">Tembea</span>
          </div>

          {/* Bottom Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Start your journey with<br />
                Tembea today.
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Discover Rwanda&apos;s destinations and connect with verified local partners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-[#0B1120] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <svg className="w-8 h-8 text-[#2ECC71]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-2xl font-bold text-white">Tembea</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Join Rwanda's premier tourism marketplace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Account Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">I want to</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a2332] border border-gray-700 rounded-lg">
                {(["client", "partner"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("role", type)}
                    className={`py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
                      selectedRole === type
                        ? "bg-[#2ECC71] text-white"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {type === "client" ? "Travel" : "List Property"}
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] ${
                    errors.name ? "border-red-400" : ""
                  }`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] ${
                    errors.email ? "border-red-400" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={`w-full pl-10 pr-10 py-3 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] ${
                    errors.password ? "border-red-400" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] ${
                    errors.confirmPassword ? "border-red-400" : ""
                  }`}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-[#1a2332] text-[#2ECC71] focus:ring-[#2ECC71] focus:ring-offset-0"
                  {...register("terms")}
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#2ECC71] hover:text-[#27ae60]">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#2ECC71] hover:text-[#27ae60]">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs font-medium text-red-400">{errors.terms.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm font-medium text-red-400 bg-red-400/10 p-3 rounded-lg" role="alert">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Creating account…" : "Get Started"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-[#2ECC71] hover:text-[#27ae60]">
              Sign in <ArrowRight size={14} className="inline" aria-hidden />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
