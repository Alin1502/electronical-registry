import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getMyProfile, updateProfile, changePassword, uploadAvatar } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile } from "@/types/registry";
import { UserCircle, Camera, Save, KeyRound } from "lucide-react";

export function ProfileSettings() {
  const { token, setProfile: setAuthProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setLocalProfile] = useState<UserProfile | null>(null);
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
      setLocalProfile(data);
      setAuthProfile?.(data ?? null);
      setEmail(data.email ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEmail() {
    if (!token) return;
    setSavingEmail(true);
    try {
      const updated = await updateProfile(token, email);
      setLocalProfile(updated);
      setAuthProfile?.(updated ?? null);
      toast.success("Email updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file || !token) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPEG or PNG images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(token, file);
      setLocalProfile(updated);
      setAuthProfile?.(updated ?? null);
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword() {
    if (!token) return;
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Could not load profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar + identity */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/30">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted/50 disabled:opacity-50"
              aria-label="Change profile picture"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="flex-1 space-y-1 text-center sm:text-left">
            <p className="text-lg font-semibold text-foreground">{profile.username}</p>
            <p className="text-sm text-muted-foreground">{profile.company_name}</p>
            {profile.is_owner && (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</p>
            )}
            {uploadingAvatar && <p className="text-xs text-muted-foreground">Uploading...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="text-sm font-semibold text-foreground">Email address</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sm:max-w-sm"
            />
            <Button onClick={handleSaveEmail} disabled={savingEmail || email === (profile.email ?? "")}>
              <Save className="mr-2 h-4 w-4" />
              {savingEmail ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="h-4 w-4" />
            Change password
          </h3>
          <div className="grid gap-3 sm:max-w-sm">
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
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-fit"
            >
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}