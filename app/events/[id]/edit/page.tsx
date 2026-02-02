'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  category: string;
  isOnline: boolean;
  organizer: { id: string };
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    category: 'TECH',
    isOnline: false,
  });

  useEffect(() => {
    if (!user || !bearerToken) {
      router.push('/auth/login');
      return;
    }
    fetchEvent();
  }, [eventId, user, bearerToken, router]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();

      // Check if user is the organizer
      if (data.organizer.id !== user?.id) {
        setError('You are not authorized to edit this event');
        return;
      }

      setEvent(data);
      const eventDate = new Date(data.date);
      setFormData({
        title: data.title,
        description: data.description,
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: data.location,
        price: data.price.toString(),
        capacity: data.capacity.toString(),
        category: data.category,
        isOnline: data.isOnline,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Get token from localStorage as fallback
    const token = bearerToken || localStorage.getItem('bearerToken');

    if (!token) {
      setError('You must be logged in to edit events');
      router.push('/auth/login');
      return;
    }

    if (!formData.title || !formData.description || !formData.date || !formData.price || !formData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          localStorage.removeItem('bearerToken');
          localStorage.removeItem('user');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else {
          throw new Error(data.error || 'Failed to update event');
        }
        return;
      }

      router.push(`/events/${eventId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-gray-500">Loading event...</p>
        </div>
      </>
    );
  }

  if (error && !event) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => router.back()} className="w-full mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Event</CardTitle>
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
                    disabled={isSaving}
                  />
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
                    disabled={isSaving}
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
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time*</label>
                    <Input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      disabled={isSaving}
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
                      disabled={isSaving}
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
                      disabled={isSaving}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (USD)*</label>
                    <Input
                      type="number"
                      name="price"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isSaving}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Capacity*</label>
                    <Input
                      type="number"
                      name="capacity"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSaving}
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
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSaving}
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
