import axios from 'axios';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EventEmailData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  isOnline: boolean;
  orderId?: string;
  receiptNumber?: string;
  transactionCode?: string;
  transactionHash?: string;
}

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rift Finance</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2E8C96 0%, #2A7A84 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Rift Finance</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                This is an automated email from Rift Finance. Please save this email for your records.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const createPaymentConfirmationEmail = (data: EventEmailData): string => {
  const content = `
    <h2 style="margin: 0 0 20px; color: #1F2D3A; font-size: 24px; font-weight: 600;">Payment Confirmed!</h2>
    <p style="margin: 0 0 30px; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Hello ${data.userName},
    </p>
    <p style="margin: 0 0 30px; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Thank you for your payment! Your RSVP has been confirmed.
    </p>
    
    <div style="background-color: #E9F1F4; border-radius: 6px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px; color: #2E8C96; font-size: 18px; font-weight: 600;">Event Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600; width: 120px;">Event:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Date:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Time:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Location:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventLocation}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px; color: #2E8C96; font-size: 18px; font-weight: 600;">Payment Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600; width: 140px;">Order ID:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.orderId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0; color: #30a46c; font-weight: 600;">✓ Confirmed</td>
        </tr>
        ${data.receiptNumber ? `
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">M-Pesa Receipt:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.receiptNumber}</td>
        </tr>
        ` : ''}
        ${data.transactionCode && !data.receiptNumber ? `
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Transaction Code:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.transactionCode}</td>
        </tr>
        ` : ''}
        ${data.transactionHash ? `
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Transaction Hash:</td>
          <td style="padding: 8px 0; color: #4A5568; font-family: monospace; font-size: 14px;">${data.transactionHash}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="margin: 30px 0 0; color: #4A5568; font-size: 16px; line-height: 1.6;">
      We look forward to seeing you at the event!
    </p>
    <p style="margin: 20px 0 0; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2E8C96;">Rift Finance Team</strong>
    </p>
  `;
  return getEmailTemplate(content);
};

export const createTicketEmail = (data: EventEmailData): string => {
  const content = `
    <h2 style="margin: 0 0 20px; color: #1F2D3A; font-size: 24px; font-weight: 600;">Your Event Ticket</h2>
    <p style="margin: 0 0 30px; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Hello ${data.userName},
    </p>
    <p style="margin: 0 0 30px; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Your event ticket for <strong>"${data.eventTitle}"</strong> is confirmed!
    </p>
    
    <div style="background-color: #E9F1F4; border-radius: 6px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px; color: #2E8C96; font-size: 18px; font-weight: 600;">Event Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600; width: 140px;">Event Name:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Date:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Time:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Location:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.eventLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Event Type:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.isOnline ? 'Online Event' : 'In-Person Event'}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px; color: #2E8C96; font-size: 18px; font-weight: 600;">Ticket Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600; width: 140px;">Order ID:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.orderId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Ticket Status:</td>
          <td style="padding: 8px 0; color: #30a46c; font-weight: 600;">✓ Confirmed</td>
        </tr>
        ${data.receiptNumber ? `
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">M-Pesa Receipt:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.receiptNumber}</td>
        </tr>
        ` : ''}
        ${data.transactionCode && !data.receiptNumber ? `
        <tr>
          <td style="padding: 8px 0; color: #1F2D3A; font-weight: 600;">Transaction Code:</td>
          <td style="padding: 8px 0; color: #4A5568;">${data.transactionCode}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffd13f; border-radius: 4px; padding: 20px; margin: 30px 0;">
      <h3 style="margin: 0 0 12px; color: #856404; font-size: 16px; font-weight: 600;">Important Reminders</h3>
      <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 15px; line-height: 1.8;">
        <li>Please arrive on time for the event</li>
        <li>Bring a valid ID for verification at the venue</li>
        <li>Keep this email as your ticket confirmation</li>
        <li>Contact the event organizer if you have any questions</li>
      </ul>
    </div>
    
    <p style="margin: 30px 0 0; color: #4A5568; font-size: 16px; line-height: 1.6;">
      We look forward to seeing you at the event!
    </p>
    <p style="margin: 20px 0 0; color: #4A5568; font-size: 16px; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #2E8C96;">Rift Finance Team</strong>
    </p>
  `;
  return getEmailTemplate(content);
};

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Use HTML if provided, otherwise fall back to text
    const emailBody = options.html || options.text || '';
    
    const result = await axios.post("https://mail.cradlevoices.com", {
      "token": process.env.CRADLE_TOKEN,
      "recipientEmails": [options.to],
      "emailBody": emailBody,
      "subject": options.subject,
      "senderName": "Rift Finance",
      "senderEmail": "sphere@cradlevoices.com"
    }, {});

    console.log(result);
  } catch (e) {
    console.error('Email sending error:', e);
  }
};
