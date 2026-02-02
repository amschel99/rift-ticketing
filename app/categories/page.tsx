'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Music,
  Briefcase,
  Heart,
  Palette,
  BookOpen,
} from 'lucide-react';

const categories = [
  {
    name: 'Technology',
    icon: Zap,
    description: 'Tech conferences, workshops, and networking events',
    count: 24,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Music',
    icon: Music,
    description: 'Concerts, festivals, and live performances',
    count: 18,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Business',
    icon: Briefcase,
    description: 'Seminars, meetups, and professional events',
    count: 32,
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Health & Wellness',
    icon: Heart,
    description: 'Fitness classes, yoga, and wellness workshops',
    count: 15,
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Arts & Culture',
    icon: Palette,
    description: 'Exhibitions, theater, and cultural events',
    count: 12,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Education',
    icon: BookOpen,
    description: 'Courses, seminars, and learning opportunities',
    count: 28,
    color: 'from-yellow-500 to-amber-500',
  },
];

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Event Categories</h1>
            <p className="text-lg text-muted-foreground">
              Explore events across different categories and find what interests you
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() =>
                    router.push(`/events?category=${category.name}`)
                  }
                  className="group relative overflow-hidden rounded-lg border border-border bg-background transition-all hover:shadow-lg hover:border-primary"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  <div className="relative p-8 flex flex-col h-full">
                    <div className="mb-4">
                      <div
                        className={`inline-flex rounded-lg bg-gradient-to-br ${category.color} p-3`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>

                    <p className="text-muted-foreground text-sm flex-1 mb-4">
                      {category.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xs font-medium text-muted-foreground">
                        {category.count} events
                      </span>
                      <span className="text-sm font-medium text-primary">
                        Browse →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="mb-6 opacity-90">
              Post your event or create a custom category
            </p>
            <Link href="/organizer/create">
              <Button className="bg-white text-primary hover:bg-gray-100">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
