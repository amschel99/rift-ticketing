'use client';

import React from "react"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

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
              <CardHeader className="pb-0">
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <span className="text-xl font-semibold">
                      {(user.name || user.externalId || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {user.name || user.externalId || 'User'}
                    </div>
                  </div>
                </div>
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
                  <div className="text-sm text-muted-foreground">
                    Coming soon, contact admin@riftfi.xyz to update
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

