'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  const { user, bearerToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'TECH',
    price: '',
    capacity: '',
    isOnline: false,
  });

  const categories = [
    { value: 'TECH', label: 'Tech' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'ARTS', label: 'Arts' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user || !bearerToken) {
      router.push('/auth/login');
      return;
    }

    if (!formData.title || !formData.description || !formData.date || !formData.price || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <Link href="/organizer" className="inline-flex items-center gap-2 mb-8 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Tech Conference 2024"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event in detail"
                    className="w-full h-24 rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date *
                    </label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time *
                    </label>
                    <Input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Online Event */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isOnline"
                      checked={formData.isOnline}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Online Event</span>
                  </label>
                </div>

                {/* Location */}
                {!formData.isOnline && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location *
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., San Francisco Convention Center"
                      required={!formData.isOnline}
                    />
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price & Capacity */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (USD) *
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Capacity *
                    </label>
                    <Input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Event'}
                  </Button>
                  <Link href="/organizer">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
