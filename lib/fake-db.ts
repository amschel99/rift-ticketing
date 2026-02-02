export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  price: number;
  capacity: number;
  attendees: number;
  organizerId: string;
  organizer: string;
  status: "upcoming" | "ongoing" | "completed";
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketNumber: string;
  purchaseDate: string;
  quantity: number;
  price: number;
  status: "active" | "used" | "cancelled";
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "organizer";
  profileImage?: string;
}

const events: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description:
      "Join industry leaders discussing the future of technology, AI, and innovation.",
    date: "2024-06-15",
    time: "09:00 AM",
    location: "San Francisco Convention Center",
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    price: 150,
    capacity: 1000,
    attendees: 542,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Summer Music Festival",
    description: "Experience the best live music performances this summer.",
    date: "2024-07-20",
    time: "06:00 PM",
    location: "Central Park, New York",
    category: "Music",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    price: 75,
    capacity: 5000,
    attendees: 3200,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Business Networking Mixer",
    description:
      "Connect with entrepreneurs, investors, and business professionals.",
    date: "2024-05-10",
    time: "05:30 PM",
    location: "Downtown Rooftop Bar",
    category: "Business",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    price: 50,
    capacity: 200,
    attendees: 180,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
  {
    id: "4",
    title: "Fitness & Wellness Expo",
    description: "Explore the latest fitness trends, wellness products, and coaching.",
    date: "2024-06-05",
    time: "08:00 AM",
    location: "Sports Arena Downtown",
    category: "Health & Wellness",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    price: 30,
    capacity: 800,
    attendees: 625,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
  {
    id: "5",
    title: "Art Gallery Opening",
    description: "Contemporary art showcase featuring emerging local artists.",
    date: "2024-05-25",
    time: "07:00 PM",
    location: "Modern Art Gallery",
    category: "Arts & Culture",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    price: 25,
    capacity: 300,
    attendees: 150,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
  {
    id: "6",
    title: "Web Development Workshop",
    description:
      "Learn modern web development techniques with hands-on projects.",
    date: "2024-06-30",
    time: "10:00 AM",
    location: "Tech Hub Downtown",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
    price: 120,
    capacity: 100,
    attendees: 85,
    organizerId: "2",
    organizer: "Jane Organizer",
    status: "upcoming",
  },
];

const tickets: Ticket[] = [
  {
    id: "t1",
    eventId: "1",
    userId: "1",
    ticketNumber: "TC-001-2024",
    purchaseDate: "2024-04-20",
    quantity: 2,
    price: 300,
    status: "active",
  },
  {
    id: "t2",
    eventId: "2",
    userId: "1",
    ticketNumber: "MF-001-2024",
    purchaseDate: "2024-05-10",
    quantity: 1,
    price: 75,
    status: "active",
  },
];

export const fakeDb = {
  getEvents: async (): Promise<Event[]> => {
    return events;
  },

  getEventById: async (id: string): Promise<Event | null> => {
    return events.find((e) => e.id === id) || null;
  },

  getEventsByCategory: async (category: string): Promise<Event[]> => {
    return events.filter((e) => e.category === category);
  },

  getEventsByOrganizer: async (organizerId: string): Promise<Event[]> => {
    return events.filter((e) => e.organizerId === organizerId);
  },

  getUserTickets: async (userId: string): Promise<Ticket[]> => {
    return tickets.filter((t) => t.userId === userId);
  },

  bookTicket: async (
    eventId: string,
    userId: string,
    quantity: number
  ): Promise<Ticket> => {
    const event = events.find((e) => e.id === eventId);
    if (!event) throw new Error("Event not found");

    const ticket: Ticket = {
      id: `t${Date.now()}`,
      eventId,
      userId,
      ticketNumber: `${event.title.slice(0, 2).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-2024`,
      purchaseDate: new Date().toISOString().split("T")[0],
      quantity,
      price: event.price * quantity,
      status: "active",
    };

    tickets.push(ticket);
    event.attendees += quantity;

    return ticket;
  },

  createEvent: async (eventData: Omit<Event, "id">): Promise<Event> => {
    const newEvent: Event = {
      ...eventData,
      id: `e${Date.now()}`,
    };
    events.push(newEvent);
    return newEvent;
  },

  updateEvent: async (id: string, updates: Partial<Event>): Promise<Event | null> => {
    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex === -1) return null;

    events[eventIndex] = { ...events[eventIndex], ...updates };
    return events[eventIndex];
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    const eventIndex = events.findIndex((e) => e.id === id);
    if (eventIndex === -1) return false;

    events.splice(eventIndex, 1);
    return true;
  },
};
