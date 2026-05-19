/**
 * In-app notification helpers.
 *
 * Firebase / Capacitor push-notification support has been removed.
 * Notifications are now delivered exclusively while the app is open,
 * via the polling mechanism in NotificationCenterContext.
 */

export type PushPermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";
