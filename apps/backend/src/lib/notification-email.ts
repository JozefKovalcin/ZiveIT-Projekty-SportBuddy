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
    sendSmtpEmail.sender = { name: "SportBuddy", email: "kberecky@gmail.com" };
    sendSmtpEmail.htmlContent = generateEmailHtml(userName, notification, activityUrl, unsubscribeUrl);

    await apiInstance!.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return { success: false, error };
  }
}

function generateEmailHtml(userName: string, notification: any, activityUrl: string | null, unsubscribeUrl: string) {
  const activity = notification.activity;
  const sportEmoji = getSportEmoji(activity?.sportType);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}
    .container{background:#0a0a0a;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.1)}
    .header{text-align:center;margin-bottom:24px}
    .logo{font-size:28px;font-weight:bold;color:#10b981}
    .content{background:rgba(255,255,255,0.05);padding:24px;border-radius:12px}
    h2{color:#fff;margin:0 0 8px}
    p{color:#9ca3af;margin:8px 0}
    .activity-card{background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:20px;margin:20px 0}
    .activity-title{color:#10b981;font-size:18px;font-weight:bold;margin-bottom:8px}
    .activity-detail{color:#d1d5db;font-size:14px}
    .button{display:inline-block;padding:14px 32px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0}
    .footer{text-align:center;margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1)}
    .footer a{color:#6b7280;font-size:12px}
  </style></head><body><div class="container">
    <div class="header"><div class="logo">⚽ SportBuddy</div></div>
    <div class="content">
      <h2>Ahoj ${userName}! 👋</h2>
      <p style="font-size:16px;color:#fff">${notification.message}</p>
      ${activity ? `<div class="activity-card">
        <div class="activity-title">${sportEmoji} ${activity.title}</div>
        <div class="activity-detail">📅 ${new Date(activity.date).toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
        <div class="activity-detail">📍 ${activity.location || "Miesto neuvedené"}</div>
      </div>` : ""}
      ${activityUrl ? `<div style="text-align:center"><a href="${activityUrl}" class="button">Zobraziť aktivitu</a></div>` : ""}
    </div>
    <div class="footer"><a href="${unsubscribeUrl}">Spravovať notifikácie</a></div>
  </div></body></html>`;
}

function getSportEmoji(sportType?: string): string {
  const emojis: Record<string, string> = {
    FOOTBALL: "⚽", BASKETBALL: "🏀", TENNIS: "🎾", VOLLEYBALL: "🏐",
    BADMINTON: "🏸", TABLE_TENNIS: "🏓", RUNNING: "🏃", CYCLING: "🚴",
    SWIMMING: "🏊", GYM: "💪", OTHER: "🎯",
  };
  return emojis[sportType || "OTHER"] || "🎯";
}
