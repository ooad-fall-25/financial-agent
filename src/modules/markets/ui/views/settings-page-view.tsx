"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Language, useSettingsStore } from '@/stores/settings-store';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [fileRetention, setFileRetention] = useState(true);

  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage); 

  useEffect(() => {
    if (theme) { 
      setDarkMode(theme === 'dark' || theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [theme]);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? 'dark' : 'light'); // Set the global theme
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            {/* File Retention Policy - Fix 2: Reordered */}
            <div className="flex items-center justify-between">
              <Label htmlFor="file-retention">File Retention (Save Files)</Label>
              <Switch
                id="file-retention"
                checked={fileRetention}
                onCheckedChange={setFileRetention}
              />
            </div>

            {/* Dark Mode Toggle - Fix 2: Reordered */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}