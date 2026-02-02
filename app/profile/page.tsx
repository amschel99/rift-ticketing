'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMessage('');

    setTimeout(() => {
      setSavedMessage('Profile updated successfully!');
      setIsSaving(false);
      setTimeout(() => setSavedMessage(''), 3000);
    }, 500);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="h-96 rounded-lg bg-muted animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

          <div className="grid gap-6">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Account Type
                    </div>
                    <div className="text-lg font-semibold capitalize">
                      {user.role || 'User'}
                    </div>
                  </div>
                </div>

                {savedMessage && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
                    ✓ {savedMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    disabled
                    className="opacity-75"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    January 2024
                  </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Password
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Keep your account secure by using a strong password and
                  enabling two-factor authentication.
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about events and bookings
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Event Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get reminded before your events start
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
