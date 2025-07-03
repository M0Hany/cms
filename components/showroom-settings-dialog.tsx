"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Cookies from "js-cookie";

interface ShowroomSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const COOKIE_EXPIRY = 365; // days
const COOKIE_PREFIX = "showroom_";

export function ShowroomSettingsDialog({
  isOpen,
  onClose,
}: ShowroomSettingsDialogProps) {
  const [settings, setSettings] = useState({
    app_id: "TR53CBEI82",
    api_search_key: "98ef65e220d8d74a2dfac7a67f1dba11",
    index_name: "prod_en",
    currency: "EGP"
  });

  useEffect(() => {
    // Load settings from cookies on mount
    const savedSettings = {
      app_id: Cookies.get(COOKIE_PREFIX + "app_id") || settings.app_id,
      api_search_key: Cookies.get(COOKIE_PREFIX + "api_search_key") || settings.api_search_key,
      index_name: Cookies.get(COOKIE_PREFIX + "index_name") || settings.index_name,
      currency: Cookies.get(COOKIE_PREFIX + "currency") || settings.currency
    };
    setSettings(savedSettings);
  }, []);

  const handleSave = () => {
    // Save settings to cookies
    Object.entries(settings).forEach(([key, value]) => {
      Cookies.set(COOKIE_PREFIX + key, value, { expires: COOKIE_EXPIRY });
    });

    // Trigger page reload to apply new settings
    window.location.reload();
  };

  // Log settings changes
  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Showroom Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="app_id">App ID</label>
            <Input
              id="app_id"
              value={settings.app_id}
              onChange={(e) => handleSettingChange("app_id", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="api_search_key">API Search Key</label>
            <Input
              id="api_search_key"
              value={settings.api_search_key}
              onChange={(e) => handleSettingChange("api_search_key", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="index_name">Index Name</label>
            <Input
              id="index_name"
              value={settings.index_name}
              onChange={(e) => handleSettingChange("index_name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="currency">Currency</label>
            <Input
              id="currency"
              value={settings.currency}
              onChange={(e) => handleSettingChange("currency", e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 