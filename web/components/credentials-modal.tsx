"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCredentials } from "@/hooks/use-credentials";

export default function CredentialsModal() {
  const { setCredentials, hasCredentials } = useCredentials();
  const [open, setOpen] = useState(false);
  const [localApiToken, setLocalApiToken] = useState("");
  const [localZoneId, setLocalZoneId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasCredentials()) {
      setOpen(true);
    }
  }, [hasCredentials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!localApiToken.trim() || !localZoneId.trim()) {
      setError("Both API Token and Zone ID are required.");
      return;
    }

    setCredentials(localApiToken.trim(), localZoneId.trim());
    setError("");
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!hasCredentials()) {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Cloudflare Configuration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiToken" className="text-sm font-medium">
              Cloudflare API Token
            </label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Enter your Cloudflare API token"
              value={localApiToken}
              onChange={(e) => setLocalApiToken(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="zoneId" className="text-sm font-medium">
              Zone ID
            </label>
            <Input
              id="zoneId"
              type="text"
              placeholder="Enter your Zone ID"
              value={localZoneId}
              onChange={(e) => setLocalZoneId(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>
          {error && (
            <p className="text-xs sm:text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full text-sm sm:text-base">
            Save Credentials
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
