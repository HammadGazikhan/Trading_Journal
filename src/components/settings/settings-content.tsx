"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Bell,
  Keyboard,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react";
import {
  GlassCard,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type FeedbackState = { type: "success" | "error"; message: string } | null;

export function SettingsContent() {
  const { data: session, update: updateSession } = useSession();
  const [profileName, setProfileName] = useState(session?.user?.name || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null);

  const handleProfileSave = async () => {
    if (!profileName.trim()) {
      setProfileFeedback({ type: "error", message: "Name is required" });
      return;
    }

    setProfileSaving(true);
    setProfileFeedback(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim() }),
      });

      if (response.ok) {
        await updateSession({ name: profileName.trim() });
        setProfileFeedback({
          type: "success",
          message: "Profile updated successfully",
        });
      } else {
        const data = await response.json();
        setProfileFeedback({
          type: "error",
          message: data.error || "Failed to update profile",
        });
      }
    } catch {
      setProfileFeedback({
        type: "error",
        message: "Failed to update profile",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Current password is required",
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Password must be at least 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Passwords do not match" });
      return;
    }

    setPasswordSaving(true);
    setPasswordFeedback(null);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      if (response.ok) {
        setPasswordFeedback({
          type: "success",
          message: "Password updated successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setPasswordFeedback({
          type: "error",
          message: data.error || "Failed to update password",
        });
      }
    } catch {
      setPasswordFeedback({
        type: "error",
        message: "Failed to update password",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Section */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          {profileFeedback && (
            <FeedbackMessage
              type={profileFeedback.type}
              message={profileFeedback.message}
            />
          )}
          <Button
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="gap-2"
          >
            {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </GlassCard>

      {/* Notifications */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Notification preferences coming soon.
          </p>
        </CardContent>
      </GlassCard>

      {/* Keyboard Shortcuts */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ShortcutItem shortcut="N" description="Open new trade modal" />
            <Separator />
            <ShortcutItem shortcut="Cmd + K" description="Open search" />
            <Separator />
            <ShortcutItem shortcut="/" description="Focus search input" />
            <Separator />
            <ShortcutItem shortcut="Esc" description="Close modals" />
          </div>
        </CardContent>
      </GlassCard>

      {/* Security */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          {passwordFeedback && (
            <FeedbackMessage
              type={passwordFeedback.type}
              message={passwordFeedback.message}
            />
          )}
          <Button
            onClick={handlePasswordUpdate}
            disabled={passwordSaving}
            className="gap-2"
          >
            {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </GlassCard>

      {/* Sign Out */}
      <GlassCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <CardTitle>Sign Out</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sign out of your account on this device.
          </p>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive gap-2"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </CardContent>
      </GlassCard>
    </div>
  );
}

function ShortcutItem({
  shortcut,
  description,
}: {
  shortcut: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{description}</span>
      <kbd className="px-2 py-1 rounded bg-secondary text-sm font-mono">
        {shortcut}
      </kbd>
    </div>
  );
}

function FeedbackMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg text-sm",
        type === "success"
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      {message}
    </div>
  );
}
