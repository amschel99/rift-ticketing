import { prisma } from '@/lib/prisma';

/**
 * Resolves an event by slug or CUID id.
 * CUIDs start with 'c' and are 25 chars. Everything else is treated as a slug.
 */
export async function resolveEventId(idOrSlug: string): Promise<string | null> {
  const isCuid = /^c[a-z0-9]{24}$/.test(idOrSlug);

  if (isCuid) {
    return idOrSlug;
  }

  // Look up by slug
  const event = await prisma.event.findUnique({
    where: { slug: idOrSlug },
    select: { id: true },
  });

  return event?.id ?? null;
}
