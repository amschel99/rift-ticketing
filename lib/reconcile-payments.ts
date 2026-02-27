import { prisma } from '@/lib/prisma';
import rift from '@/lib/rift';
import { sendEmail, createPaymentConfirmationEmail } from '@/lib/email';

const TWO_MINUTES = 2 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

let isRunning = false;

export async function reconcilePendingPayments() {
  // Prevent overlapping runs
  if (isRunning) return;
  isRunning = true;

  try {
    const now = Date.now();

    // Find PENDING invoices with a payment URL (invoice flow only),
    // older than 2 minutes (give client-side redirect time),
    // younger than 7 days
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        invoiceUrl: { not: null },
        createdAt: {
          lt: new Date(now - TWO_MINUTES),
          gt: new Date(now - SEVEN_DAYS),
        },
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                bearerToken: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            externalId: true,
          },
        },
      },
    });

    if (pendingInvoices.length === 0) return;

    console.log(`[Reconciler] Checking ${pendingInvoices.length} pending invoice(s)...`);

    // Group by organizer to minimize API calls
    const byOrganizer = new Map<string, typeof pendingInvoices>();
    for (const inv of pendingInvoices) {
      const orgId = inv.event.organizer.id;
      if (!byOrganizer.has(orgId)) byOrganizer.set(orgId, []);
      byOrganizer.get(orgId)!.push(inv);
    }

    for (const [, invoices] of byOrganizer) {
      const organizer = invoices[0].event.organizer;

      if (!organizer.bearerToken) {
        console.warn(`[Reconciler] Organizer ${organizer.id} has no bearer token, skipping`);
        continue;
      }

      try {
        // Find the oldest pending invoice for this organizer to set startDate filter
        const oldestCreatedAt = invoices.reduce(
          (min, inv) => (inv.createdAt < min ? inv.createdAt : min),
          invoices[0].createdAt
        );

        rift.setBearerToken(organizer.bearerToken);

        // Only fetch COMPLETED invoices from Rift, starting from the oldest pending invoice date
        const response = await rift.merchant.getInvoices({
          status: 'COMPLETED' as any,
          startDate: oldestCreatedAt.toISOString(),
          sortBy: 'paidAt',
          sortOrder: 'desc',
        });

        // Backend returns array directly or wrapped in { invoices: [...] }
        const riftInvoices: any[] = Array.isArray(response)
          ? response
          : (response as any).invoices || [];

        // Build a lookup map: Rift invoice URL → Rift invoice
        const riftByUrl = new Map<string, any>();
        for (const ri of riftInvoices) {
          if (ri.url) riftByUrl.set(ri.url, ri);
        }

        // Check each pending invoice
        for (const localInvoice of invoices) {
          const riftInvoice = localInvoice.invoiceUrl
            ? riftByUrl.get(localInvoice.invoiceUrl)
            : undefined;

          if (!riftInvoice) continue;

          // Rift uses COMPLETED, our DB uses CONFIRMED
          const isPaid =
            riftInvoice.status === 'COMPLETED' ||
            riftInvoice.status === 'completed';

          if (!isPaid) continue;

          console.log(
            `[Reconciler] Invoice ${localInvoice.id} was paid on Rift (paidAt: ${riftInvoice.paidAt}, method: ${riftInvoice.paymentMethod || 'unknown'}). Confirming...`
          );

          // Update invoice to CONFIRMED with payment details from Rift
          await prisma.invoice.update({
            where: { id: localInvoice.id },
            data: {
              status: 'CONFIRMED',
              receiptNumber: riftInvoice.transactionHash || riftInvoice.id,
              transactionCode: riftInvoice.transactionHash || localInvoice.transactionCode,
            },
          });

          // Upsert RSVP
          await prisma.rSVP.upsert({
            where: {
              userId_eventId: {
                userId: localInvoice.userId,
                eventId: localInvoice.eventId,
              },
            },
            update: { status: 'CONFIRMED' },
            create: {
              userId: localInvoice.userId,
              eventId: localInvoice.eventId,
              status: 'CONFIRMED',
            },
          });

          // Send confirmation email
          if (localInvoice.user.email) {
            const eventDate = new Date(localInvoice.event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const formattedTime = eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            const emailHtml = createPaymentConfirmationEmail({
              userName:
                localInvoice.user.name ||
                localInvoice.user.externalId.split('@')[0],
              eventTitle: localInvoice.event.title,
              eventDate: formattedDate,
              eventTime: formattedTime,
              eventLocation: localInvoice.event.location,
              isOnline: localInvoice.event.isOnline,
              orderId: localInvoice.orderId || undefined,
              transactionHash: riftInvoice.transactionHash || undefined,
              receiptNumber: riftInvoice.receiptNumber || undefined,
            });

            try {
              await sendEmail({
                to: localInvoice.user.email,
                subject: `RSVP Confirmed: ${localInvoice.event.title}`,
                html: emailHtml,
              });
              console.log(
                `[Reconciler] Confirmation email sent to ${localInvoice.user.email}`
              );
            } catch (emailErr) {
              console.error('[Reconciler] Email failed:', emailErr);
            }
          }

          console.log(
            `[Reconciler] Invoice ${localInvoice.id} reconciled — RSVP confirmed for user ${localInvoice.userId}`
          );
        }
      } catch (riftErr) {
        console.error(
          `[Reconciler] Rift API error for organizer ${organizer.id}:`,
          riftErr
        );
      }
    }
  } catch (err) {
    console.error('[Reconciler] Error:', err);
  } finally {
    isRunning = false;
  }
}
