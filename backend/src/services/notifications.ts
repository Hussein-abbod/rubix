import { Notification } from "../models/Notification";

export async function createNotification({
  userId,
  projectId,
  type,
  message,
}: {
  userId: string;
  projectId?: string;
  type: "deadline_reminder" | "daily_summary" | "overdue_alert" | "assignment" | "mention";
  message: string;
}) {
  return Notification.create({
    user: userId,
    project: projectId,
    type,
    message,
    sentAt: new Date(),
  });
}

export async function getUnreadNotifications(userId: string) {
  return Notification.find({ user: userId, read: false })
    .sort({ sentAt: -1 })
    .limit(20)
    .populate("project", "name");
}

export async function markAsRead(notificationId: string) {
  return Notification.findByIdAndUpdate(notificationId, { read: true });
}

export async function markAllAsRead(userId: string) {
  return Notification.updateMany({ user: userId, read: false }, { read: true });
}
