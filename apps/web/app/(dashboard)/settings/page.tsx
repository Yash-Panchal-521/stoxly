"use client";

import { useState } from "react";
import { useAuth } from "@/auth/auth-provider";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  /* ── Display name ── */
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [nameLoading, setNameLoading] = useState(false);

  /* ── Password change ── */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ── Delete account ── */
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isPasswordUser = user?.providerData.some(
    (p) => p.providerId === "password",
  );

  /* ── Handlers ── */

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = displayName.trim();
    if (trimmed === (user.displayName ?? "")) return;
    setNameLoading(true);
    try {
      await updateProfile(user, { displayName: trimmed });
      toast("Name updated successfully.");
    } catch {
      toast("Failed to update name.", "error");
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("Password must be at least 8 characters.", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Password updated successfully.");
    } catch {
      toast("Incorrect current password.", "error");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user || !user.email) return;
    setDeleteLoading(true);
    try {
      if (isPasswordUser) {
        const credential = EmailAuthProvider.credential(
          user.email,
          deletePassword,
        );
        await reauthenticateWithCredential(user, credential);
      }
      await deleteUser(user);
      await logout();
      router.push("/login");
    } catch {
      toast("Failed to delete account. Check your password.", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-h2 text-text-primary">Settings</h1>
        <p className="text-body text-text-secondary mt-1">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="stoxly-card space-y-5">
        <div>
          <h2 className="text-h3 text-text-primary">Profile</h2>
          <p className="text-small text-text-secondary mt-0.5">
            Update your display name.
          </p>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1">
          <label className="text-small font-medium text-text-secondary">
            Email
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            readOnly
            className="stoxly-input w-full cursor-not-allowed opacity-60"
          />
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="displayName"
              className="text-small font-medium text-text-secondary"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="stoxly-input w-full"
            />
          </div>
          <button
            type="submit"
            disabled={nameLoading}
            className="btn-primary h-9 px-5 text-small disabled:opacity-50"
          >
            {nameLoading ? "Saving…" : "Save Name"}
          </button>
        </form>
      </section>

      {/* Change Password (only for email/password accounts) */}
      {isPasswordUser && (
        <section className="stoxly-card space-y-5">
          <div>
            <h2 className="text-h3 text-text-primary">Change Password</h2>
            <p className="text-small text-text-secondary mt-0.5">
              Must be at least 8 characters.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="currentPassword"
                className="text-small font-medium text-text-secondary"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="stoxly-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="newPassword"
                className="text-small font-medium text-text-secondary"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="stoxly-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="text-small font-medium text-text-secondary"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="stoxly-input w-full"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary h-9 px-5 text-small disabled:opacity-50"
            >
              {passwordLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </section>
      )}

      {/* Danger Zone */}
      <section className="stoxly-card space-y-5 border-danger/30">
        <div>
          <h2 className="text-h3 text-danger">Danger Zone</h2>
          <p className="text-small text-text-secondary mt-0.5">
            Permanently delete your account and all associated data. This cannot
            be undone.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger h-9 px-5 text-small"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-4 rounded-xl border border-danger/30 bg-danger/[0.06] p-4">
            <p className="text-small font-medium text-danger">
              This action is irreversible. All portfolios, holdings, and
              transactions will be deleted.
            </p>

            {isPasswordUser && (
              <div className="space-y-1">
                <label
                  htmlFor="deletePassword"
                  className="text-small font-medium text-text-secondary"
                >
                  Confirm with your password
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="stoxly-input w-full"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn-danger h-9 px-5 text-small disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete My Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                }}
                className="btn-secondary h-9 px-5 text-small"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
