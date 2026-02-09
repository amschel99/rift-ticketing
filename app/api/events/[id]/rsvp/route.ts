import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';
import { OfframpCurrency } from '@rift-finance/wallet';
import { sendEmail, createPaymentConfirmationEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: eventId } = await Promise.resolve(params);
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if event exists with organizer info
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: true,
        organizer: {
          select: {
            id: true,
            bearerToken: true,
            riftUserId: true,
            walletAddress: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already RSVPed (only check confirmed RSVPs)
    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    if (existingRsvp && existingRsvp.status === 'CONFIRMED') {
      return NextResponse.json({ error: 'Already RSVPed to this event' }, { status: 400 });
    }

    // Check capacity (only count confirmed RSVPs)
    const confirmedRsvps = event.rsvps.filter(r => r.status === 'CONFIRMED');
    if (confirmedRsvps.length >= event.capacity) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }

    // Check if event is free (price === 0)
    const isFreeEvent = event.price === 0 || event.price <= 0;

    // For free events, skip payment and directly create RSVP
    if (isFreeEvent) {
      // Create or update RSVP
      const rsvp = await prisma.rSVP.upsert({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: eventId,
          },
        },
        update: {
          status: 'CONFIRMED',
        },
        create: {
          userId: user.id,
          eventId: eventId,
          status: 'CONFIRMED',
        },
      });

      // Create invoice record with 0 amount for free events
      await prisma.invoice.create({
        data: {
          userId: user.id,
          eventId: eventId,
          amount: 0,
          currency: 'USDC',
          chain: 'BASE',
          status: 'CONFIRMED',
          orderId: `free-event-${eventId}-${user.id}`,
        },
      });

      // Send confirmation email
      let emailSent = false;
      if (user.email) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const emailHtml = createPaymentConfirmationEmail({
          userName: user.name || user.externalId.split('@')[0],
          eventTitle: event.title,
          eventDate: formattedDate,
          eventTime: formattedTime,
          eventLocation: event.location,
          isOnline: event.isOnline,
        });

        try {
          await sendEmail({
            to: user.email,
            subject: `RSVP Confirmed: ${event.title}`,
            html: emailHtml,
          });
          emailSent = true;
          console.log(`Confirmation email sent to ${user.email} for free event ${event.title}`);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'RSVP confirmed for free event',
        rsvp,
        emailSent: emailSent,
        userEmail: user.email || null,
      });
    }

    // Check if there's already a pending invoice for this user/event
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: user.id,
        eventId: eventId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If there's a pending invoice with a URL and the price hasn't changed, return it
    if (existingInvoice?.invoiceUrl && existingInvoice.amount === event.price) {
      return NextResponse.json({
        success: true,
        paymentUrl: existingInvoice.invoiceUrl,
        message: 'Payment link already generated',
      });
    }

    // If the price changed, mark the old invoice as stale so a new one is created
    if (existingInvoice && existingInvoice.amount !== event.price) {
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: { status: 'FAILED' },
      });
    }

    // Get originUrl, orderId, and paymentMethod from request body
    const body = await request.json().catch(() => ({}));
    const originUrl = body.originUrl || 
      `${request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000'}/events/${eventId}`;
    const orderId = body.orderId;
    const paymentMethod = body.paymentMethod || 'invoice'; // 'invoice' or 'wallet'

    // If paying with wallet, check balance and send transaction
    if (paymentMethod === 'wallet') {
      if (!user.bearerToken) {
        return NextResponse.json({ error: 'User not authenticated with Rift' }, { status: 401 });
      }

      if (!event.organizer.walletAddress) {
        return NextResponse.json({ error: 'Event organizer wallet address not found' }, { status: 400 });
      }

      // Check user's wallet balance
      rift.setBearerToken(user.bearerToken);
      
      // Get exchange rate - use buying_rate for wallet payments
      const exchangeResponse = await rift.offramp.previewExchangeRate({
        currency: 'KES' as OfframpCurrency,
      });
      const buyingRate = exchangeResponse.buying_rate || exchangeResponse.rate || 1;
      
      // Event price is in USD, convert to KES for display, then back to USD for payment
      // For wallet payments, we use buying_rate
      const priceInKES = event.price * buyingRate;
      const priceInUSDC = event.price; // Already in USD

      const balanceResponse = await rift.wallet.getTokenBalance({
        token: 'USDC',
        chain: 'BASE',
      });

      const balances = balanceResponse.data || [];
      // Balance has both 'chain' and 'chainName' - check both for BASE
      const usdcBalance = balances.find((b: any) => 
        b.token === 'USDC' && (b.chain === 'BASE' || b.chainName === 'BASE')
      );
      const balance = usdcBalance?.amount || 0;

      if (balance < priceInUSDC) {
        return NextResponse.json({ 
          error: 'Insufficient balance',
          balance,
          required: priceInUSDC,
        }, { status: 400 });
      }

      // Send payment to organizer's wallet
      try {
        // Note: transaction.send requires authentication - using externalId from user
        // The bearer token is already set, so this should work
        const transactionResponse = await rift.transactions.send({
          to: event.organizer.walletAddress,
          value: priceInUSDC.toString(), // Send USD amount
          token: 'USDC',
          chain: 'BASE',
          externalId: user.externalId,
          password: '', // May be required by type but bearer token auth should handle it
        } as any);

        // Payment successful - create RSVP and invoice
        const invoice = await prisma.invoice.create({
          data: {
            userId: user.id,
            eventId: eventId,
            amount: event.price,
            currency: 'USDC',
            chain: 'BASE',
            status: 'CONFIRMED',
            receiptNumber: transactionResponse.transactionHash || null,
            orderId: orderId || `event-${eventId}-${user.id}`,
          },
        });

        // Create or update RSVP
        const rsvp = await prisma.rSVP.upsert({
          where: {
            userId_eventId: {
              userId: user.id,
              eventId: eventId,
            },
          },
          update: {
            status: 'CONFIRMED',
          },
          create: {
            userId: user.id,
            eventId: eventId,
            status: 'CONFIRMED',
          },
        });

        // Send confirmation email
        let emailSent = false;
        if (user.email) {
          // Format date nicely
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          });
          const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          const emailHtml = createPaymentConfirmationEmail({
            userName: user.name || user.externalId.split('@')[0],
            eventTitle: event.title,
            eventDate: formattedDate,
            eventTime: formattedTime,
            eventLocation: event.location,
            isOnline: event.isOnline,
            orderId: invoice.orderId || undefined,
            transactionHash: transactionResponse.transactionHash || undefined,
          });

          try {
            await sendEmail({
              to: user.email,
              subject: `RSVP Confirmed: ${event.title}`,
              html: emailHtml,
            });
            emailSent = true;
            console.log(`Confirmation email sent to ${user.email} for event ${event.title}`);
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the request if email fails, but log it
          }
        } else {
          console.warn(`User ${user.id} does not have an email address, skipping email notification`);
        }

        return NextResponse.json({
          success: true,
          message: 'Payment successful and RSVP confirmed',
          rsvp,
          transactionHash: transactionResponse.transactionHash || null,
          emailSent: emailSent,
          userEmail: user.email || null,
        });
      } catch (txError: any) {
        console.error('Wallet payment error:', txError);
        return NextResponse.json({ 
          error: txError.message || 'Failed to process wallet payment' 
        }, { status: 500 });
      }
    }

    // Invoice payment flow (existing code)
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Create invoice with Rift using the ORGANIZER's token (event creator)
    // DO NOT create RSVP yet - only create it after payment is confirmed
    let paymentUrl: string | undefined;
    try {
      // Use the organizer's bearer token to create the invoice
      if (!event.organizer.bearerToken) {
        throw new Error('Event organizer not authenticated with Rift.');
      }

      // Set bearer token for Rift SDK using organizer's token
      rift.setBearerToken(event.organizer.bearerToken);

      // Get exchange rate - use selling_rate for invoice payments
      const exchangeResponse = await rift.offramp.previewExchangeRate({
        currency: 'KES' as OfframpCurrency,
      });
      const sellingRate = exchangeResponse.selling_rate || exchangeResponse.rate || 1;
      
      // Event price is already stored in USD, use it directly for invoice
      // selling_rate is used when user pays with invoice (they pay in KES, we convert to USD)
      const invoiceAmount = event.price; // Already in USD

      // Create invoice using Rift SDK merchant API
      // Pass orderId (camelCase) so Rift can include it in the redirect URL
      const invoiceRequest = {
        description: `Event ticket: ${event.title}`,
        chain: 'BASE' as const,
        token: 'USDC' as const,
        amount: invoiceAmount, // USD amount
        recipientEmail: user.email || undefined,
        originUrl: originUrl,
        orderId: orderId, // Pass orderId to Rift so it's included in redirect (?ref=pay&transaction_code=...&order_id=...)
      };

      const invoiceResponse = await rift.merchant.createInvoice(invoiceRequest);

      // Extract payment URL from invoice response
      // CreateInvoiceResponse has { invoice: { url: string, ... } }
      const invoice = invoiceResponse.invoice || (invoiceResponse as any);
      paymentUrl = invoice.url || undefined;

      console.log('Invoice created:', { invoiceResponse, paymentUrl });

      if (!paymentUrl) {
        throw new Error('Payment URL not found in invoice response');
      }

      // Save invoice to database (but NOT RSVP yet)
      await prisma.invoice.create({
        data: {
          userId: user.id,
          eventId: eventId,
          amount: event.price,
          currency: 'USDC',
          chain: 'BASE',
          invoiceUrl: paymentUrl,
          status: 'PENDING',
          orderId: orderId,
        },
      });
    } catch (invoiceError: any) {
      console.error('Invoice creation error:', invoiceError);
      return NextResponse.json({ 
        error: invoiceError.message || 'Failed to create payment link. Please try again.' 
      }, { status: 500 });
    }

    // Return payment URL - RSVP will be created after payment is confirmed
    return NextResponse.json({
      success: true,
      paymentUrl,
      message: 'Payment link generated. Complete payment to confirm your RSVP.',
    });
  } catch (error: any) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 });
  }
}
