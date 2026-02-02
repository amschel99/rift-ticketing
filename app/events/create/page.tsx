'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, bearerToken, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    category: 'TECH',
    isOnline: false,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellingRate, setSellingRate] = useState<number | null>(null); // For converting KES to USD when creating event

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    if (bearerToken) {
      fetchExchangeRate();
    }
  }, [user, isLoading, router, bearerToken]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSellingRate(data.sellingRate || data.exchangeRate); // Use selling_rate for event creation
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || !bearerToken) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertDescription>
                  You must be logged in to create events.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full mt-4"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    if (name === 'image' && (e.target as HTMLInputElement).files?.[0]) {
      const file = (e.target as HTMLInputElement).files![0];
      setFormData({
        ...formData,
        image: file,
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.date || !formData.price || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!bearerToken) {
        throw new Error('Not authenticated. Please log in again.');
      }

      // Upload image if provided
      let imageUrl = null;
      if (formData.image) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.image);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          throw new Error(data.error || 'Failed to create event');
        }
        return;
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#E9F1F4] py-12 px-4">
        <div className="max-w-2xl mx-auto">
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

              <div>
                <label className="block text-sm font-medium mb-2">Event Title*</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="Tech Conference 2024"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description*</label>
                <textarea
                  name="description"
                  placeholder="Tell people about your event..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date*</label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time*</label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="mr-2"
                  />
                  Online Event
                </label>
              </div>

              {!formData.isOnline && (
                <div>
                  <label className="block text-sm font-medium mb-2">Location*</label>
                  <Input
                    type="text"
                    name="location"
                    placeholder="123 Main St, City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (KES)*</label>
                  <Input
                    type="number"
                    name="price"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    step="1"
                  />
                  {formData.price && sellingRate && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {(parseFloat(formData.price) / sellingRate).toFixed(2)} USD (using selling rate)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Capacity*</label>
                  <Input
                    type="number"
                    name="capacity"
                    placeholder="100"
                    value={formData.capacity}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TECH">Tech</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="SPORTS">Sports</option>
                  <option value="ARTS">Arts</option>
                  <option value="BUSINESS">Business</option>
                  <option value="EDUCATION">Education</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
