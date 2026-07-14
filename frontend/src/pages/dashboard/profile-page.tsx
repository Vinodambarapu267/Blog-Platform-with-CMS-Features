import { useForm } from "react-hook-form";
import { Save, Link2, AtSign, Briefcase, Globe } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateProfile } from "@/hooks/use-users";
import { ROLE_LABELS } from "@/constants";

interface ProfileFormValues {
  displayName: string;
  bio: string;
  email: string;
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: user?.username ?? "",
      bio: "",
      email: "",
      github: "",
      twitter: "",
      linkedin: "",
      website: "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const socialLinks: Record<string, string> = Object.fromEntries(
      Object.entries({
        github: values.github,
        twitter: values.twitter,
        linkedin: values.linkedin,
        website: values.website,
      }).filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
    );
      updateProfile.mutate({
      username: user?.username,   // keep the same username — backend expects it in UserDto
      displayName: values.displayName,
      bio: values.bio,
      email: values.email,
      ...(Object.keys(socialLinks).length > 0 && { socialLinks }),
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Information visible on your public author page.
          </p>
        </div>

        {/* Identity card — read-only fields from JWT */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar name={user?.username ?? "User"} size={56} />
            <div className="min-w-0">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-text-secondary">{ROLE_LABELS[user?.role ?? "READER"]}</p>
             
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>

            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" placeholder="Jane Doe" {...register("displayName")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} placeholder="Tell readers about yourself" {...register("bio")} />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Social links</CardTitle>

            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[
                { name: "github" as const, icon: Link2, placeholder: "https://github.com/username" },
                { name: "twitter" as const, icon: AtSign, placeholder: "https://twitter.com/username" },
                { name: "linkedin" as const, icon: Briefcase, placeholder: "https://linkedin.com/in/username" },
                { name: "website" as const, icon: Globe, placeholder: "https://yourdomain.com" },
              ].map((social) => (
                <div key={social.name} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-text-muted">
                    <social.icon className="h-4 w-4" />
                  </span>
                  <Input placeholder={social.placeholder} {...register(social.name)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting || updateProfile.isPending}
              disabled={!isDirty && !updateProfile.isPending}
            >
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
