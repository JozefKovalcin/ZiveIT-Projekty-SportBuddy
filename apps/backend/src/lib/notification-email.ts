import * as brevo from "@getbrevo/brevo";

const HAS_BREVO_KEY = !!process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== "brevo_test_key";

let apiInstance: brevo.TransactionalEmailsApi | null = null;
if (HAS_BREVO_KEY) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);
}

interface NotificationEmailParams {
  email: string;
  userName: string;
  notification: { type: string; title: string; message: string; activityId?: string | null; activity?: any };
}

export async function sendNotificationEmail({ email, userName, notification }: NotificationEmailParams) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const activityUrl = notification.activityId ? `${frontendUrl}/activities/${notification.activityId}` : null;
  const unsubscribeUrl = `${frontendUrl}/profile/notifications`;

  if (!HAS_BREVO_KEY) {
    console.log("\n" + "=".repeat(60));
    console.log("🔔 NOTIFICATION EMAIL (Dev Mode)");
    console.log(`To: ${email} | Title: ${notification.title}`);
    if (activityUrl) console.log(`Activity: ${activityUrl}`);
    console.log("=".repeat(60) + "\n");
    return { success: true };
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `SportBuddy - ${notification.title}`;
    sendSmtpEmail.to = [{ email, name: userName }];
    sendSmtpEmail.sender = { name: "SportBuddy", email: process.env.BREVO_SENDER_EMAIL || "kberecky@gmail.com" };
    sendSmtpEmail.htmlContent = generateEmailHtml(userName, notification, activityUrl, unsubscribeUrl);

    console.log('[Email] Sending via Brevo to:', email);
    const result = await apiInstance!.sendTransacEmail(sendSmtpEmail);
    console.log('[Email] ✅ Successfully sent! Message ID:', result.body?.messageId || result.response?.body?.messageId);
    return { success: true };
  } catch (error) {
    console.error("[Email] ❌ Failed to send:", error);
    return { success: false, error };
  }
}

function generateEmailHtml(userName: string, notification: any, activityUrl: string | null, unsubscribeUrl: string) {
  const activity = notification.activity;
  const sportEmoji = getSportEmoji(activity?.sportType);

  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SportBuddy Notifikácia</title>
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
      margin-bottom: 30px;
      line-height: 1.7;
    }
    .activity-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #10b981;
      border-radius: 16px;
      padding: 24px;
      margin: 24px 0;
    }
    .activity-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(16, 185, 129, 0.2);
    }
    .activity-emoji {
      font-size: 32px;
      margin-right: 12px;
    }
    .activity-title {
      font-size: 20px;
      font-weight: 700;
      color: #065f46;
      flex: 1;
    }
    .activity-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .activity-detail {
      display: flex;
      align-items: center;
      font-size: 15px;
      color: #047857;
    }
    .activity-detail-icon {
      font-size: 18px;
      margin-right: 10px;
      width: 24px;
      text-align: center;
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
      transition: all 0.3s ease;
    }
    .button:hover {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      transform: translateY(-2px);
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 32px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin-bottom: 16px;
    }
    .footer-link {
      color: #10b981;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }
    .footer-text {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.5;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .greeting { font-size: 20px; }
      .activity-title { font-size: 18px; }
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
      <div class="message">${notification.message}</div>

      ${activity ? `
      <div class="activity-card">
        <div class="activity-header">
          <div class="activity-emoji">${sportEmoji}</div>
          <div class="activity-title">${activity.title}</div>
        </div>
        <div class="activity-details">
          <div class="activity-detail">
            <span class="activity-detail-icon">📅</span>
            <span>${new Date(activity.date).toLocaleDateString("sk-SK", { 
              weekday: "long", 
              day: "numeric", 
              month: "long", 
              year: "numeric",
              hour: "2-digit", 
              minute: "2-digit" 
            })}</span>
          </div>
          <div class="activity-detail">
            <span class="activity-detail-icon">📍</span>
            <span>${activity.location || "Miesto neuvedené"}</span>
          </div>
          ${activity.maxParticipants ? `
          <div class="activity-detail">
            <span class="activity-detail-icon">👥</span>
            <span>${activity._count?.participations || 0}/${activity.maxParticipants} účastníkov</span>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      ${activityUrl ? `
      <div class="button-container">
        <a href="${activityUrl}" class="button">Zobraziť aktivitu →</a>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${unsubscribeUrl}" class="footer-link">Spravovať notifikácie</a>
      </div>
      <div class="footer-text">
        Tento email si dostal/a, pretože máš zapnuté notifikácie v SportBuddy.<br>
        © ${new Date().getFullYear()} SportBuddy. Všetky práva vyhradené.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getSportEmoji(sportType?: string): string {
  const emojis: Record<string, string> = {
    FOOTBALL: "⚽", BASKETBALL: "🏀", TENNIS: "🎾", VOLLEYBALL: "🏐",
    BADMINTON: "🏸", TABLE_TENNIS: "🏓", RUNNING: "🏃", CYCLING: "🚴",
    SWIMMING: "🏊", GYM: "💪", OTHER: "🎯",
  };
  return emojis[sportType || "OTHER"] || "🎯";
}
