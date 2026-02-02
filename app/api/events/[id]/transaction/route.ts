import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';

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

    const { transactionCode, hash, orderId, paymentType } = await request.json();

    // Must have either transactionCode (M-Pesa) or hash (on-chain)
    if (!transactionCode && !hash) {
      return NextResponse.json({ error: 'Transaction code or hash is required' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find the invoice by orderId and verify it belongs to this user and event
    const invoice = await prisma.invoice.findUnique({
      where: {
        orderId: orderId,
      },
      include: {
        event: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found for this order ID' }, { status: 404 });
    }

    // Verify the invoice belongs to the logged-in user
    if (invoice.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized: This order does not belong to you' }, { status: 403 });
    }

    // Verify the invoice is for this event
    if (invoice.eventId !== eventId) {
      return NextResponse.json({ error: 'Order ID does not match this event' }, { status: 400 });
    }

    // Get event organizer's bearer token for Rift SDK queries
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            bearerToken: true,
          },
        },
      },
    });

    if (!event?.organizer.bearerToken) {
      return NextResponse.json({ error: 'Event organizer not authenticated with Rift' }, { status: 500 });
    }

    // Check if invoice is older than 1 minute - if so and no receipt, mark as failed
    const invoiceAge = Date.now() - new Date(invoice.createdAt).getTime();
    const oneMinuteInMs = 1 * 60 * 1000; // 1 minute in milliseconds
    const isInvoiceExpired = invoiceAge >= oneMinuteInMs;

    // STEP 1: Update transaction_code/hash in DB first
    if (transactionCode) {
      // Update invoice with transaction code (M-Pesa)
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          transactionCode: transactionCode,
        },
      });
    } else if (hash) {
      // Update invoice with hash (on-chain)
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          transactionCode: hash, // Store hash in transactionCode field for on-chain
        },
      });
    }

    // If invoice is expired and we're just now getting transaction code, check immediately
    // If still no receipt after quick check, mark as failed
    if (isInvoiceExpired) {
      console.log(`Invoice is ${Math.round(invoiceAge / 1000)}s old, doing quick check before marking as failed...`);
    }

    // STEP 2: Query Rift SDK to check if receipt_number exists
    // Set bearer token for Rift SDK
    rift.setBearerToken(event.organizer.bearerToken);

    let isSuccess = false;
    let receiptNumber: string | null = null;
    let paymentStatus: string | null = null;

    // Handle M-Pesa payment (transaction_code) - Poll with increasing intervals
    if (transactionCode) {
      try {
        // Poll intervals: 2s, 5s, 15s, 30s (exponential backoff)
        const pollIntervals = [2000, 5000, 15000, 30000]; // in milliseconds
        let attempts = 0;

        while (attempts < pollIntervals.length) {
          // Query onramp order status using transaction code
          const onrampStatus = await rift.onrampV2.getOnrampStatus(transactionCode);
          console.log(`Onramp status (attempt ${attempts + 1}):`, onrampStatus);

          // Handle nested response structure (response may have 'order' property)
          const order = (onrampStatus as any).order || onrampStatus;
          const orderReceiptNumber = order.receipt_number;
          const orderStatus = order.status;

          // Check if receipt_number exists (payment successful)
          if (orderReceiptNumber) {
            isSuccess = true;
            receiptNumber = orderReceiptNumber;
            paymentStatus = orderStatus || 'success';
            break; // Payment confirmed, exit polling loop
          }

          // Check if payment failed
          if (orderStatus?.toLowerCase() === 'failed' || 
              orderStatus?.toLowerCase() === 'cancelled') {
            paymentStatus = orderStatus;
            break; // Payment failed, exit polling loop
          }

          // No receipt_number yet, wait with increasing interval before next poll
          if (attempts < pollIntervals.length - 1) {
            const waitTime = pollIntervals[attempts];
            console.log(`Waiting ${waitTime}ms before next poll...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          attempts++;
        }

        // If we didn't get receipt_number, check if invoice is expired
        if (!isSuccess && !paymentStatus) {
          if (isInvoiceExpired) {
            // Invoice is 2+ minutes old with no receipt - mark as failed
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: {
                status: 'FAILED',
              },
            });
            return NextResponse.json({
              success: false,
              error: 'Payment was not successful. The payment did not complete within 1 minute. Please try again.',
              status: 'failed',
            }, { status: 400 });
          }
          paymentStatus = 'pending';
        }
      } catch (riftError: any) {
        console.error('Error querying Rift SDK for M-Pesa:', riftError);
        // Transaction code already saved, but can't verify payment status
        // If invoice is expired, mark as failed
        if (isInvoiceExpired) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'FAILED',
            },
          });
            return NextResponse.json({
              success: false,
              error: 'Payment was not successful. Unable to verify payment status. Please try again.',
              status: 'failed',
            }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: 'Transaction code saved. Unable to verify payment status at this time.',
          warning: riftError.message,
          status: 'pending',
        });
      }
    }

    // Handle on-chain payment (hash) - Poll with increasing intervals
    if (hash) {
      try {
        // Poll intervals: 2s, 5s, 15s, 30s (exponential backoff)
        const pollIntervals = [2000, 5000, 15000, 30000]; // in milliseconds
        let attempts = 0;
        let matchingDeposit: any = null;

        while (attempts < pollIntervals.length) {
          // Get all deposits and find the one matching the hash
          const depositsResponse = await rift.deposits.getAllDeposits();
          const deposits = depositsResponse.deposits || [];
          
          // Find deposit with matching transaction hash
          matchingDeposit = deposits.find(
            (deposit: any) => deposit.transactionHash?.toLowerCase() === hash.toLowerCase()
          );

          if (matchingDeposit) {
            // Verify amount matches (convert invoice amount to string for comparison)
            const invoiceAmount = invoice.amount.toString();
            const depositAmount = matchingDeposit.amount;
            
            // Check if amounts match (with some tolerance for decimals)
            const amountMatches = Math.abs(parseFloat(invoiceAmount) - parseFloat(depositAmount)) < 0.01;

            if (!amountMatches) {
              return NextResponse.json({
                error: `Amount mismatch. Expected ${invoiceAmount} USDC, but deposit was ${depositAmount} USDC`,
              }, { status: 400 });
            }

            // Check if deposit is processed
            if (matchingDeposit.processed) {
              // All checks passed - payment is successful
              isSuccess = true;
              receiptNumber = matchingDeposit.transactionHash; // Use hash as receipt number
              paymentStatus = 'confirmed';
              break; // Deposit found and processed, exit polling loop
            }
            // Deposit found but not processed yet, continue polling
          }

          // Deposit not found or not processed yet, wait with increasing interval before next poll
          if (attempts < pollIntervals.length - 1) {
            const waitTime = pollIntervals[attempts];
            console.log(`Waiting ${waitTime}ms before next poll...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          attempts++;
        }

        // If we exhausted attempts without finding processed deposit
        if (!isSuccess) {
          // Check if invoice is expired (2+ minutes old)
          if (isInvoiceExpired) {
            // Invoice is 2+ minutes old with no matching deposit - mark as failed
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: {
                status: 'FAILED',
              },
            });
            return NextResponse.json({
              success: false,
              error: 'Payment was not successful. No matching deposit found within 1 minute. Please try again.',
              status: 'failed',
            }, { status: 400 });
          }
          
          if (matchingDeposit && !matchingDeposit.processed) {
            return NextResponse.json({
              success: false,
              message: 'Deposit found but not yet processed. Please wait.',
              status: 'pending',
            });
          } else {
            return NextResponse.json({
              success: false,
              message: 'Deposit not found. Payment may still be processing.',
              status: 'pending',
            });
          }
        }
      } catch (riftError: any) {
        console.error('Error querying Rift SDK for on-chain deposit:', riftError);
        // Hash already saved, but can't verify deposit
        // If invoice is expired, mark as failed
        if (isInvoiceExpired) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'FAILED',
            },
          });
            return NextResponse.json({
              success: false,
              error: 'Payment was not successful. Unable to verify deposit. Please try again.',
              status: 'failed',
            }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: 'Hash saved. Unable to verify deposit at this time.',
          warning: riftError.message,
          status: 'pending',
        });
      }
    }

    // If payment was successful, create/confirm RSVP
    if (isSuccess) {
      // Update invoice with receipt number and status
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          receiptNumber: receiptNumber,
          status: 'CONFIRMED',
        },
      });

      // Check if RSVP already exists
      const existingRsvp = await prisma.rSVP.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: eventId,
          },
        },
      });

      // Create RSVP if it doesn't exist
      if (!existingRsvp) {
        await prisma.rSVP.create({
          data: {
            userId: user.id,
            eventId: eventId,
            status: 'CONFIRMED',
          },
        });
      } else if (existingRsvp.status !== 'CONFIRMED') {
        // Update existing RSVP to confirmed
        await prisma.rSVP.update({
          where: { id: existingRsvp.id },
          data: { status: 'CONFIRMED' },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and RSVP created',
        receiptNumber: receiptNumber,
        status: paymentStatus,
      });
    } else {
      // Payment not yet successful, but transaction info is saved
      return NextResponse.json({
        success: true,
        message: paymentType === 'mpesa' 
          ? 'Transaction code saved. Payment is still processing.'
          : 'Hash saved. Payment verification pending.',
        status: paymentStatus || 'pending',
      });
    }
  } catch (error: any) {
    console.error('Transaction code save error:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}
