import * as brevo from "@getbrevo/brevo";

// In development without Brevo API key, we'll just log the email
const HAS_BREVO_KEY =
  !!process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== "brevo_test_key";

// Initialize Brevo API client
let apiInstance: brevo.TransactionalEmailsApi | null = null;
if (HAS_BREVO_KEY) {
  try {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );
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
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "SportBuddy - Reset hesla";
    sendSmtpEmail.to = [{ email, name: userName }];
    // Use your verified Brevo sender email (the one you registered with)
    sendSmtpEmail.sender = {
      name: "SportBuddy",
      email: "kberecky@gmail.com", // Change to your verified Brevo email
    };
    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f9f9f9;
                border-radius: 10px;
                padding: 30px;
                margin: 20px 0;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 10px;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background-color: #0066cc;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
              }
              .button:hover {
                background-color: #0052a3;
              }
              .info-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
              }
              .link {
                color: #0066cc;
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">⚽ SportBuddy</div>
              </div>
              
              <div class="content">
                <h2 style="color: #333; margin-top: 0;">Ahoj ${userName}! 👋</h2>
                
                <p>Dostali sme požiadavku na reset tvojho hesla pre SportBuddy účet.</p>
                
                <p>Pre obnovenie hesla klikni na tlačidlo nižšie:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Resetovať heslo</a>
                </div>
                
                <div class="info-box">
                  <strong>⏰ Dôležité:</strong> Tento link je platný iba <strong>1 hodinu</strong>.
                </div>
                
                <p>Ak tlačidlo nefunguje, skopíruj a vlož tento link do prehliadača:</p>
                <p class="link">${resetUrl}</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666; font-size: 14px;">
                  <strong>Nepoža doval si reset hesla?</strong><br>
                  Môžeš tento email ignorovať. Tvoje heslo ostane nezmenené.
                </p>
              </div>
              
              <div class="footer">
                <p>SportBuddy - Nájdi si spoluhráčov! 🏀⚽🎾</p>
                <p style="font-size: 12px; color: #999;">
                  Tento email bol odoslaný automaticky. Neodpovedaj naň.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

    const data = await apiInstance!.sendTransacEmail(sendSmtpEmail);
    console.log("Password reset email sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
