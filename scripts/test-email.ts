import { sendEmail } from '../lib/email';

async function testEmail() {
  console.log('Testing email sending...');
  console.log('Recipient: art68401@gmail.com');
  
  try {
    await sendEmail({
      to: 'art68401@gmail.com',
      subject: 'Test Email from Rift Finance',
      text: `
Hello!

This is a test email from the Rift Finance Sphere application.

If you receive this email, the email service is working correctly.

Test Details:
- Order ID: TEST-12345
- Event: Test Event
- Date: ${new Date().toLocaleDateString()}
- Transaction Code: TEST-TXN-001

Best regards,
Rift Finance Team
      `.trim(),
    });
    
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

testEmail();
