import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/overlays";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/constants";


const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
const usernameSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type EmailForm = z.infer<typeof emailSchema>;
type UsernameForm = z.infer<typeof usernameSchema>;

export function LoginPage() {
  const { loginWithEmail, loginWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.dashboard;

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const usernameForm = useForm<UsernameForm>({ resolver: zodResolver(usernameSchema) });

  const handleSuccess = () => {
    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  const onEmailSubmit = async (values: EmailForm) => {
    try {
      await loginWithEmail(values.email, values.password);
      handleSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  const onUsernameSubmit = async (values: UsernameForm) => {
    try {
      await loginWithUsername(values.username, values.password);
      handleSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    }
  };

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Mallivin Tech CMS workspace">
      <Tabs defaultValue="email">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
          <TabsTrigger value="username" className="flex-1">Username</TabsTrigger>
        </TabsList>

        {/* /api/v1/auth/login — email + password */}
        <TabsContent value="email">
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...emailForm.register("email")} />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-danger">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="email-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  {...emailForm.register("password")}
                />
                <PasswordToggle />
              </div>
              {emailForm.formState.errors.password && (
                <p className="text-xs text-danger">{emailForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" loading={emailForm.formState.isSubmitting}>
              <LogIn className="h-4 w-4" /> Sign in with email
            </Button>
          </form>
        </TabsContent>

        {/* /api/v1/auth/token — username + password (AuthenticationManager) */}
        <TabsContent value="username">
          <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="janedoe" {...usernameForm.register("username")} />
              {usernameForm.formState.errors.username && (
                <p className="text-xs text-danger">{usernameForm.formState.errors.username.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username-password">Password</Label>
              <div className="relative">
                <Input
                  id="username-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  {...usernameForm.register("password")}
                />
                <PasswordToggle />
              </div>
              {usernameForm.formState.errors.password && (
                <p className="text-xs text-danger">{usernameForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" loading={usernameForm.formState.isSubmitting}>
              <LogIn className="h-4 w-4" /> Sign in with username
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link to={ROUTES.register} className="text-primary-light hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
