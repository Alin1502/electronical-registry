import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getMyProfile, updateProfile, changePassword, uploadAvatar } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsRow, SettingsGroup } from "@/components/settings/SettingsRow";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile } from "@/types/registry";
import { UserCircle, Camera, Sun, Moon } from "lucide-react";

export function ProfileSettings() {
  const { token, theme, setTheme } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!token) return;
    void loadProfile();
  }, [token]);

  async function loadProfile() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyProfile(token);
      setProfile(data);
      setEmail(data.email ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profilul nu s-a încărcat");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEmail() {
    if (!token) return;
    setSavingEmail(true);
    try {
      const updated = await updateProfile(token, email);
      setProfile(updated);
      toast.success("Adresa de email actualizata");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Adresa de email nu s-a actualizat");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Doar format JPEG/PNG permis");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dimensiunea maxima este de 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(token, file);
      setProfile(updated);
      toast.success("Poza de profil a fost actualizată");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Poza de profil nu s-a actualizat");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword() {
    if (!token) return;
    if (newPassword.length < 8) {
      toast.error("Parola trebuie să aibă cel puțin 8 caractere");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Parola nu coincide. Verificați din nou");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      toast.success("Parola a fost schimbată");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Parola nu a putut fi schimbată");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-sm text-muted-foreground">Profilul se încarcă...</div>;
  }

  if (!profile) {
    return <div className="py-12 text-sm text-muted-foreground">Profilul nu a putut fi încărcat</div>;
  }

  const emailUnchanged = email === (profile.email ?? "");
  const passwordFormEmpty = !currentPassword && !newPassword && !confirmPassword;

  return (
    <div className="divide-y divide-border">
      <SettingsGroup>
        <SettingsRow title="Aspect" description="Alegeți aspectul Regix pe dispozitivul dumneavoastră">
          <div className="inline-flex rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm transition-colors ${
                theme === "light"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm transition-colors ${
                theme === "dark"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </button>
          </div>
        </SettingsRow>

        <SettingsRow title="Poza de profil" description="Vizibilă tuturor utilizatorilor">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted/50 disabled:opacity-50"
                aria-label="Change profile picture"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{profile.username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {uploadingAvatar ? "Uploading..." : "JPEG/PNG, maxim 5MB"}
              </p>
            </div>
          </div>
        </SettingsRow>

        <SettingsRow title="Companie" description="Compania dumneavoastră">
          <p className="text-sm text-foreground">{profile.company_name}</p>
          {profile.is_owner && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</p>
          )}
        </SettingsRow>

        <SettingsRow title="Adresa de Email" description="Pentru notificări și recuperare cont">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button size="sm" onClick={handleSaveEmail} disabled={savingEmail || emailUnchanged}>
              {savingEmail ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </SettingsRow>

        <SettingsRow
          title="Parolă"
          description="Folosiți o parolă de minimum 8 caractere"
          divider={false}
        >
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button
              size="sm"
              onClick={handleChangePassword}
              disabled={changingPassword || passwordFormEmpty}
            >
              {changingPassword ? "Se schimbă..." : "Schimbă parola"}
            </Button>
          </div>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}