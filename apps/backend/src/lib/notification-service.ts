import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "./notification-email";
import { sendWebPush } from "./web-push";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  activityId?: string;
  metadata?: Record<string, any>;
}

// Create a single notification
export async function createNotification({
  userId, type, title, message, activityId, metadata,
}: CreateNotificationParams) {
  try {
    // Check user preferences
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Check quiet hours
    if (prefs?.quietHoursEnabled && isQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
      console.log(`Skipping notification for ${userId} - quiet hours`);
      return null;
    }

    // Check daily rate limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.notification.count({
      where: { userId, createdAt: { gte: todayStart } },
    });

    if (prefs && todayCount >= prefs.maxNotificationsPerDay) {
      console.log(`Rate limit reached for user ${userId}`);
      return null;
    }

    // Create in-app notification
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, activityId, metadata },
      include: { activity: { select: { id: true, title: true, sportType: true, date: true } } },
    });

    // Send email if enabled and instant
    if (prefs?.emailEnabled && prefs.emailFrequency === "INSTANT") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await sendNotificationEmail({ email: user.email, userName: user.name, notification });
      }
    }

    // Send push notification if enabled
    if (prefs?.pushEnabled) {
      await sendPushNotification(userId, { title, message, activityId });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

// Notify all users when an activity is deleted
export async function notifyUsersAboutActivityDeleted(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      participations: { include: { user: true } },
      organizer: true,
    },
  });

  if (!activity) return;

  const title = `Aktivita bola zrušená: ${activity.title}`;
  const message = `Organizátor zrušil aktivitu naplánovanú na ${activity.date.toLocaleString()}.`;

  const usersToNotify = activity.participations.map((p) => p.user);

  // Include organizer if needed
  // usersToNotify.push(activity.organizer);

  for (const user of usersToNotify) {
    await createNotification({
      userId: user.id,
      type: "ACTIVITY_CANCELLED",
      title,
      message,
      activityId,
    });
  }

  console.log(`Notified ${usersToNotify.length} users about deleted activity ${activityId}`);
}

// Notify organizer and participants when a user joins
export async function notifyUsersAboutUserJoined(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      organizer: true,
      participations: { include: { user: true } },
    },
  });

  if (!activity) return;

  const joiningUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!joiningUser) return;

  const title = `${joiningUser.name} sa pridal k tvojej aktivite`;
  const message = `${joiningUser.name} sa pridal k aktivite "${activity.title}" naplánovanej na ${activity.date.toLocaleString()}.`;

  const usersToNotify = [
    activity.organizer,
    ...activity.participations.map((p) => p.user),
  ].filter((u) => u.id !== userId); // Exclude joining user

  for (const user of usersToNotify) {
    await createNotification({
      userId: user.id,
      type: "PARTICIPANT_JOINED",
      title,
      message,
      activityId,
    });
  }

  console.log(`Notified ${usersToNotify.length} users about ${joiningUser.name} joining activity ${activityId}`);
}


// Notify users about new activity matching their preferences
export async function notifyUsersAboutNewActivity(activityId: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { organizer: { select: { id: true, name: true } } },
    });

    if (!activity || !activity.isPublic) return;

    // Find users with matching preferences
    const usersToNotify = await findMatchingUsers(activity);

    console.log('Users to notify:', usersToNotify.map(u => u.id));

    for (const user of usersToNotify) {
      if (user.id === activity.organizerId) continue; // Skip organizer

      console.log(`Creating notification for user ${user.id} about activity ${activity.id}`);

      await createNotification({
        userId: user.id,
        type: "NEW_ACTIVITY",
        title: "Nová aktivita v tvojom okolí! 🎉",
        message: `${activity.organizer.name} vytvoril(a) aktivitu "${activity.title}"`,
        activityId: activity.id,
        metadata: { sportType: activity.sportType, location: activity.location },
      });
    }

    console.log(`Notified ${usersToNotify.length} users about activity ${activityId}`);
  } catch (error) {
    console.error("Error notifying users about new activity:", error);
  }
}

// Find users matching activity preferences
async function findMatchingUsers(activity: any) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: activity.organizerId },
      notificationPreferences: {
        OR: [{ notifyNewActivities: true }, { notifyNewActivities: null }],
      },
    },
    include: {
      profile: { select: { favoriteSports: true, city: true } },
      notificationPreferences: true,
    },
  });

  return users.filter((user) => {
    const prefs = user.notificationPreferences;
    if (!prefs?.inAppEnabled) return false;

    // Check favorite sports filter
    if (prefs.onlyFavoriteSports && user.profile?.favoriteSports) {
      if (!user.profile.favoriteSports.includes(activity.sportType)) return false;
    }

    // Check price filter
    if (prefs.maxPrice !== null && activity.price > prefs.maxPrice) return false;

    return true;
  });
}

// Send Web Push notification
export async function sendPushNotification(
  userId: string,
  payload: { title: string; message: string; activityId?: string }
) {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

  for (const sub of subscriptions) {
    try {
      // Web Push logic - implemented in separate file
      await sendWebPush(sub, payload);
    } catch (error) {
      console.error("Push notification failed:", error);
      // Remove invalid subscription
      if ((error as any).statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}

// Check if current time is within quiet hours
function isQuietHours(start: number, end: number): boolean {
  const now = new Date().getHours();
  if (start < end) return now >= start && now < end;
  return now >= start || now < end; // Handles overnight (e.g., 22:00 - 08:00)
}

// Notify organizer and participants when a user leaves
export async function notifyUsersAboutUserLeft(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      organizer: true,
      participations: { include: { user: true } },
    },
  });

  if (!activity) return;

  const leavingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!leavingUser) return;

  const title = `${leavingUser.name} opustil aktivitu`;
  const message = `${leavingUser.name} sa odhlásil z aktivity "${activity.title}".`;

  const usersToNotify = [
    activity.organizer,
    ...activity.participations.map((p) => p.user),
  ].filter((u) => u.id !== userId); // Exclude leaving user

  for (const user of usersToNotify) {
    await createNotification({
      userId: user.id,
      type: "PARTICIPANT_LEFT",
      title,
      message,
      activityId,
    });
  }

  console.log(`Notified ${usersToNotify.length} users about ${leavingUser.name} leaving activity ${activityId}`);
}
