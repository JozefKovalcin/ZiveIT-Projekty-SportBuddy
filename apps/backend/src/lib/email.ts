import * as brevo from "@getbrevo/brevo";

// In development without Brevo API key, we'll just log the email
const HAS_BREVO_KEY =
  !!process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== "brevo_test_key";

// Initialize Brevo API client
let apiInstance: brevo.BrevoClient | null = null;
if (HAS_BREVO_KEY) {
  try {
    apiInstance = new brevo.BrevoClient({
      apiKey: process.env.BREVO_API_KEY!,
    });
  } catch (error) {
    console.error("Failed to initialize Brevo API:", error);
    apiInstance = null;
  }
}

interface SendPasswordResetEmailParams {
  email: string;
  resetToken: string;
  userName: string;
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: SendPasswordResetEmailParams) {
  // Use frontend URL for password reset link (not backend URL!)
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

  // Development mode without Brevo - just log the reset link
  if (!HAS_BREVO_KEY) {
    console.log("\n" + "=".repeat(80));
    console.log("📧 PASSWORD RESET EMAIL (Development Mode)");
    console.log("=".repeat(80));
    console.log(`To: ${email}`);
    console.log(`User: ${userName}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=".repeat(80) + "\n");

    return {
      success: true,
      data: {
        id: "dev-mode",
        message: "Email logged to console in development mode",
      },
    };
  }

  try {
    const sendSmtpEmail = {
      subject: "SportBuddy - Reset hesla",
      to: [{ email, name: userName }],
      sender: {
        name: "SportBuddy",
        email: process.env.BREVO_SENDER_EMAIL || "no-reply@sportbuddy.local",
      },
      htmlContent: `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SportBuddy - Reset hesla</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 36px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .warning-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .warning-title {
      font-size: 15px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 8px;
    }
    .warning-text {
      font-size: 14px;
      color: #78350f;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .link-box {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      border: 1px solid #e5e7eb;
    }
    .link-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .link-text {
      font-size: 13px;
      color: #10b981;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 32px 0;
    }
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-text {
      font-size: 14px;
      color: #075985;
      line-height: 1.6;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer-brand {
      font-size: 14px;
      color: #374151;
      font-weight: 600;
      margin-bottom: 8px;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .greeting { font-size: 20px; }
      .button { padding: 14px 32px; font-size: 15px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo">SportBuddy</div>
      <div class="tagline">Tvoja komunita pre šport a zábavu</div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="greeting">Ahoj ${userName}! 👋</div>
      
      <div class="message">
        Dostali sme požiadavku na reset tvojho hesla pre SportBuddy účet.
      </div>

      <div class="message">
        Pre obnovenie hesla klikni na tlačidlo nižšie:
      </div>

      <div class="button-container">
        <a href="${resetUrl}" class="button">Resetovať heslo →</a>
      </div>

      <div class="warning-box">
        <div class="warning-title">⏰ Dôležité upozornenie</div>
        <div class="warning-text">
          Tento link je platný iba <strong>1 hodinu</strong>. Po uplynutí tejto doby budeš musieť požiadať o nový reset hesla.
        </div>
      </div>

      <div class="link-box">
        <div class="link-label">Ak tlačidlo nefunguje, skopíruj tento link:</div>
        <div class="link-text">${resetUrl}</div>
      </div>

      <div class="divider"></div>

      <div class="info-box">
        <div class="info-text">
          <strong>Nepožiadal si o reset hesla?</strong><br>
          Môžeš tento email ignorovať. Tvoje heslo ostane nezmenené a nikto nebude mať prístup k tvojmu účtu.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">SportBuddy</div>
      <div class="footer-text">
        Tento email bol odoslaný automaticky. Neodpovedaj naň.<br>
        © ${new Date().getFullYear()} SportBuddy. Všetky práva vyhradené.
      </div>
    </div>
  </div>
</body>
</html>
      `,
    };

    const data = await apiInstance!.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
