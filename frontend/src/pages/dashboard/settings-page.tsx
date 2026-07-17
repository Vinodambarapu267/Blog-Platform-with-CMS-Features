
import { Moon, Sun, LogOut, Type } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/overlays";
import { Button } from "@/components/ui/button";
import { useTheme, type FontStyle } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
export function SettingsPage() {
  const { theme, toggleTheme, font, setFont } = useTheme();
  const { logout } = useAuth();

  return (
    <DashboardLayout>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your workspace preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how Mallivin Tech CMS looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-4 w-4 text-primary-light" /> : <Sun className="h-4 w-4 text-warning" />}
                <div>
                  <p className="text-sm font-medium">Dark mode</p>
                  <p className="text-xs text-text-muted">Reduce eye strain in low light</p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-danger/20">
          <CardHeader>
            <CardTitle className="text-danger">Danger zone</CardTitle>
            <CardDescription>Sign out of Mallivin Tech CMS on this device.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button variant="danger" onClick={() => logout()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Type className="h-4 w-4 text-primary-light" />
                <div>
                  <p className="text-sm font-medium">Font style</p>
                  <p className="text-xs text-text-muted">Choose the typeface used across the site</p>
                </div>
              </div>
              <Select value={font} onValueChange={(v) => setFont(v as FontStyle)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="system">System UI</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                </SelectContent>
              </Select>
            </div>
    </DashboardLayout>
  );
}
