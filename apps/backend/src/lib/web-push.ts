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
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body || payload.message,
        url: payload.url,
        activityId: payload.activityId,
        tag: payload.tag || `notification-${Date.now()}`,
      })
    );

    console.log(`[Web Push] Sent to ${subscription.endpoint.slice(-20)}`);
    return true;
  } catch (error: any) {
    console.error("[Web Push] Failed:", error.statusCode, error.body);

    // Return false for invalid subscriptions (410 Gone, 404 Not Found)
    if (error.statusCode === 410 || error.statusCode === 404) {
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
