import webpush from "web-push";

// Configure VAPID keys (generate once and store in env)
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:your@email.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body?: string;
  message?: string;
  url?: string;
  activityId?: string;
  tag?: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendWebPush(subscription: PushSubscription, payload: PushPayload): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log("[Web Push] VAPID keys not configured, skipping push");
    return false;
  }

  try {
    console.log("[Web Push] Preparing to send notification:", { title: payload.title, hasActivityId: !!payload.activityId });
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const notificationPayload = {
      title: payload.title,
      body: payload.body || payload.message,
      url: payload.url,
      activityId: payload.activityId,
      tag: payload.tag || `notification-${Date.now()}`,
    };

    console.log("[Web Push] Sending notification:", notificationPayload);

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(notificationPayload)
    );

    console.log(`[Web Push] Successfully sent to ${subscription.endpoint.slice(-20)}`);
    return true;
  } catch (error: any) {
    console.error("[Web Push] Failed:", { 
      statusCode: error.statusCode, 
      body: error.body,
      message: error.message 
    });

    // Return false for invalid subscriptions (410 Gone, 404 Not Found)
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log("[Web Push] Subscription is invalid (410/404)");
      return false;
    }

    throw error;
  }
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

// Export for notification-service.ts to use
export { webpush };
