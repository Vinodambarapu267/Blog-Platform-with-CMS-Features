import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, Check, Link2, AtSign, Briefcase, Globe, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { usersApi } from "@/api/users";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

// ── Schema ────────────────────────────────────────────────────────────────────
// Roles a user can self-select on registration.
// SUPER_ADMIN and ADMIN are not self-assignable — admin must promote via updateStatus.
const SELECTABLE_ROLES: { value: Role; label: string; description: string }[] = [
  { value: "AUTHOR", label: "Author", description: "Create and manage your own posts" },
  { value: "READER", label: "Reader", description: "Read posts and leave comments" },
  { value: "GUEST", label: "Guest", description: "Browse posts only, no commenting" },
];

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Enter your full name"),
    username: z
      .string()
      .min(3, "At least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    bio: z.string().max(300, "Keep it under 300 characters").optional(),
    role: z.enum(["AUTHOR", "READER", "GUEST"] as const),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    github: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
    twitter: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
    linkedin: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
    website: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, { message: "You must accept the terms to continue" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "AUTHOR" },
  });

  const password = watch("password") ?? "";
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const socialLinks: Record<string, string> = Object.fromEntries(
        Object.entries({
          github: values.github,
          twitter: values.twitter,
          linkedin: values.linkedin,
          website: values.website,
        }).filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
      );

      // POST /api/v1/users/createuser — UserCreateRequest shape
      await usersApi.create({
        username: values.username,
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        role: values.role as Role,
        ...(values.bio?.trim() && { bio: values.bio.trim() }),
        ...(Object.keys(socialLinks).length > 0 && { socialLinks }),
      });

      toast.success("Account created — you can now sign in");
      navigate(ROUTES.login);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start publishing on Mallivin Tech CMS in minutes">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name + Username */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" placeholder="Jane Doe" {...register("displayName")} />
            {errors.displayName && <p className="text-xs text-danger">{errors.displayName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="janedoe" {...register("username")} />
            {errors.username && <p className="text-xs text-danger">{errors.username.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio">
            Bio 
          </Label>
          <Textarea
            id="bio"
            rows={3}
            placeholder="Tell readers a bit about yourself…"
            {...register("bio")}
          />
          {errors.bio && <p className="text-xs text-danger">{errors.bio.message}</p>}
        </div>

        {/* Role selection */}
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Role description */}
          {watch("role") && (
            <p className="text-xs text-text-muted">
              {SELECTABLE_ROLES.find((r) => r.value === watch("role"))?.description}
            </p>
          )}
          {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {checks.map((c) => (
              <span key={c.label} className={cn("flex items-center gap-1 text-xs", c.pass ? "text-success" : "text-text-muted")}>
                <Check className="h-3 w-3" /> {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
        </div>

        {/* Social links — collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setShowSocialLinks((s) => !s)}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3.5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            Add social links
            <span className="flex items-center gap-2 text-xs text-text-muted">
              Optional
              <ChevronDown className={cn("h-4 w-4 transition-transform", showSocialLinks && "rotate-180")} />
            </span>
          </button>

          {showSocialLinks && (
            <div className="mt-3 space-y-2.5">
              {[
                { name: "github" as const, icon: Link2, placeholder: "https://github.com/username" },
                { name: "twitter" as const, icon: AtSign, placeholder: "https://twitter.com/username" },
                { name: "linkedin" as const, icon: Briefcase, placeholder: "https://linkedin.com/in/username" },
                { name: "website" as const, icon: Globe, placeholder: "https://yourdomain.com" },
              ].map((social) => (
                <div key={social.name} className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-text-muted">
                    <social.icon className="h-4 w-4" />
                  </span>
                  <Input placeholder={social.placeholder} {...register(social.name)} />
                </div>
              ))}
              <p className="text-xs text-text-muted">
                Social link URLs must start with <code className="font-mono">https://</code> — the backend validates this.
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-xs text-text-secondary">
          <input type="checkbox" className="mt-0.5 accent-primary" {...register("agreeToTerms")} />
          I agree to the Terms of Service and Privacy Policy
        </label>
        {errors.agreeToTerms && <p className="text-xs text-danger">{errors.agreeToTerms.message}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          <UserPlus className="h-4 w-4" /> Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link to={ROUTES.login} className="text-primary-light hover:underline">
          Sign in
        </Link>
      </p>
     
    </AuthLayout>
    
  );
}
