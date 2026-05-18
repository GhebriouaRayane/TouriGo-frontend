import { Capacitor, registerPlugin } from "@capacitor/core";

export type PushPermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";

type TokenRegistration = {
  value: string;
};

type PushNotificationSchema = {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

type PushNotificationActionPerformed = {
  notification: PushNotificationSchema;
};

type PushNotificationPermissionStatus = {
  receive: PushPermissionState;
};

type PluginListenerHandle = {
  remove: () => Promise<void>;
};

type PushNotificationsPlugin = {
  checkPermissions: () => Promise<PushNotificationPermissionStatus>;
  requestPermissions: () => Promise<PushNotificationPermissionStatus>;
  register: () => Promise<void>;
  addListener: (
    eventName:
      | "registration"
      | "registrationError"
      | "pushNotificationReceived"
      | "pushNotificationActionPerformed",
    listener: (event: any) => void
  ) => Promise<PluginListenerHandle>;
};

export const PushNotifications = registerPlugin<PushNotificationsPlugin>("PushNotifications");
const PushDiagnostics = registerPlugin<{
  getStatus: () => Promise<{
    configured?: boolean;
    initialized?: boolean;
    error?: string;
  }>;
}>("PushDiagnostics");

const PUSH_DEVICE_ID_STORAGE_KEY = "tourigo-push-device-id";

export function isNativePushPlatform() {
  return Capacitor.isNativePlatform();
}

export function getPushPlatform(): "android" | "ios" | "web" {
  const platform = Capacitor.getPlatform();
  if (platform === "android" || platform === "ios") {
    return platform;
  }
  return "web";
}

export function getOrCreatePushDeviceId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.localStorage.getItem(PUSH_DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `push-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  window.localStorage.setItem(PUSH_DEVICE_ID_STORAGE_KEY, nextId);
  return nextId;
}

export async function getNativePushConfigurationStatus() {
  if (!isNativePushPlatform()) {
    return {
      configured: false,
      initialized: false,
      error: "Push natif indisponible sur cette plateforme.",
    };
  }

  if (Capacitor.getPlatform() !== "android") {
    return {
      configured: true,
      initialized: true,
    };
  }

  try {
    const status = await PushDiagnostics.getStatus();
    return {
      configured: Boolean(status.configured),
      initialized: Boolean(status.initialized),
      error: status.error,
    };
  } catch (error) {
    return {
      configured: false,
      initialized: false,
      error: error instanceof Error ? error.message : "Diagnostic push Android indisponible.",
    };
  }
}

export type NativePushListenerCallbacks = {
  onRegistered: (token: string) => void | Promise<void>;
  onForegroundNotification?: (notification: PushNotificationSchema) => void;
  onRegistrationError?: (error: unknown) => void;
  onNotificationAction?: (event: PushNotificationActionPerformed) => void;
};

export async function startNativePushListeners(callbacks: NativePushListenerCallbacks) {
  const handles = await Promise.all([
    PushNotifications.addListener("registration", (token: TokenRegistration) => {
      void callbacks.onRegistered(token.value);
    }),
    PushNotifications.addListener("registrationError", (error: unknown) => {
      callbacks.onRegistrationError?.(error);
    }),
    PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
      callbacks.onForegroundNotification?.(notification);
    }),
    PushNotifications.addListener("pushNotificationActionPerformed", (event: PushNotificationActionPerformed) => {
      callbacks.onNotificationAction?.(event);
    }),
  ]);

  return async () => {
    await Promise.all(handles.map((handle) => handle.remove()));
  };
}
