"use client";

import { useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff } from 'lucide-react'; // Import Eye and EyeOff icons

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [fileRetention, setFileRetention] = useState(true);
  const [apiKeys, setApiKeys] = useState(
    [{ id: 1, name: 'Default API', key: 'sk-xxxxxxxxxxxxxxxxxxxx', showKey: false }] // Added showKey state
  );

  const handleAddApiKey = () => {
    setApiKeys([...apiKeys, { id: apiKeys.length + 1, name: `API Key ${apiKeys.length + 1}`, key: '', showKey: false }]);
  };

  const handleApiKeyChange = (id: number, field: string, value: string) => {
    setApiKeys(apiKeys.map(key => (key.id === id ? { ...key, [field]: value } : key)));
  };

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  // Toggle visibility of API key
  const toggleApiKeyVisibility = (id: number) => {
    setApiKeys(apiKeys.map(key => (key.id === id ? { ...key, showKey: !key.showKey } : key)));
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
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="cn">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            {/* File Retention Policy */}
            <div className="flex items-center justify-between">
              <Label htmlFor="file-retention">File Retention (Save Files)</Label>
              <Switch
                id="file-retention"
                checked={fileRetention}
                onCheckedChange={setFileRetention}
              />
            </div>
          </div>

          {/* API Management Key Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">API Key Management</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">
                      <Input
                        value={apiKey.name}
                        onChange={(e) => handleApiKeyChange(apiKey.id, 'name', e.target.value)}
                        placeholder="API Name"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center">
                        <Input
                          type={apiKey.showKey ? 'text' : 'password'}
                          value={apiKey.key}
                          onChange={(e) => handleApiKeyChange(apiKey.id, 'key', e.target.value)}
                          placeholder="Enter your API Key"
                          className="pr-10" // Add padding to the right for the icon
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-transparent"
                          onClick={() => toggleApiKeyVisibility(apiKey.id)}
                        >
                          {apiKey.showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleAddApiKey} className="mt-4">
              Add New API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}