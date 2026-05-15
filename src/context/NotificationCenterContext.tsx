import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import {
  ApiNotification,
  getNotificationsApi,
  registerPushTokenApi,
  unregisterPushTokenApi,
} from "../lib/api";
import {
  PushNotifications,
  getOrCreatePushDeviceId,
  getPushPlatform,
  isNativePushPlatform,
  startNativePushListeners,
} from "../lib/pushNotifications";

type NotificationCenterContextValue = {
  notifications: ApiNotification[];
  loadingNotifications: boolean;
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
};

const NotificationCenterContext = createContext<NotificationCenterContextValue | undefined>(undefined);

const NOTIFICATION_POLL_INTERVAL_MS = 15000;

function showBrowserNotification(notification: ApiNotification) {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return;
  }
  if (document.visibilityState === "visible" || Notification.permission !== "granted") {
    return;
  }

  try {
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      tag: `tourigo-notification-${notification.id}`,
    });
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };
  } catch {
    // Ignore browsers or webviews that do not support runtime notifications.
  }
}

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const knownNotificationIdsRef = useRef<Set<number>>(new Set());
  const registeredPushTokenRef = useRef<string | null>(null);
  const previousAuthTokenRef = useRef<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setLoadingNotifications(false);
      hasLoadedOnceRef.current = false;
      knownNotificationIdsRef.current = new Set();
      return;
    }

    setLoadingNotifications((current) => (hasLoadedOnceRef.current ? current : true));

    try {
      const freshNotifications = await getNotificationsApi(token, 100);
      const nextKnownIds = new Set(freshNotifications.map((notification) => notification.id));

      if (hasLoadedOnceRef.current) {
        const newUnreadNotifications = freshNotifications
          .filter(
            (notification) =>
              !notification.is_read && !knownNotificationIdsRef.current.has(notification.id)
          )
          .sort(
            (left, right) =>
              new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
          );

        newUnreadNotifications.forEach((notification) => {
          toast(notification.title, {
            description: notification.body,
            duration: 6000,
          });
          showBrowserNotification(notification);
        });
      }

      setNotifications(freshNotifications);
      knownNotificationIdsRef.current = nextKnownIds;
      hasLoadedOnceRef.current = true;
    } catch {
      if (!hasLoadedOnceRef.current) {
        setNotifications([]);
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, [token]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, NOTIFICATION_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshNotifications, token]);

  useEffect(() => {
    if (!isNativePushPlatform()) {
      previousAuthTokenRef.current = token;
      return;
    }

    if (!token) {
      const previousAuthToken = previousAuthTokenRef.current;
      const registeredPushToken = registeredPushTokenRef.current;
      previousAuthTokenRef.current = null;
      registeredPushTokenRef.current = null;

      if (previousAuthToken && registeredPushToken) {
        void unregisterPushTokenApi(previousAuthToken, registeredPushToken).catch(() => undefined);
      }
      return;
    }

    previousAuthTokenRef.current = token;
    let cancelled = false;
    let removeListeners: (() => Promise<void>) | null = null;

    const initializeNativePushNotifications = async () => {
      try {
        const permissionStatus = await PushNotifications.checkPermissions();
        const resolvedPermission =
          permissionStatus.receive === "prompt"
            ? await PushNotifications.requestPermissions()
            : permissionStatus;

        if (resolvedPermission.receive !== "granted") {
          return;
        }

        removeListeners = await startNativePushListeners({
          onRegistered: async (nativePushToken) => {
            if (cancelled) {
              return;
            }
            registeredPushTokenRef.current = nativePushToken;
            await registerPushTokenApi(token, {
              token: nativePushToken,
              platform: getPushPlatform(),
              device_id: getOrCreatePushDeviceId(),
            });
          },
          onForegroundNotification: (notification) => {
            const notificationId = Number(notification.data?.notificationId);
            if (Number.isFinite(notificationId) && notificationId > 0) {
              knownNotificationIdsRef.current.add(notificationId);
            }
            if (!notification.title && !notification.body) {
              return;
            }
            toast(notification.title ?? "Nouvelle notification", {
              description: notification.body,
              duration: 6000,
            });
          },
          onRegistrationError: (error) => {
            console.warn("Push notification registration error.", error);
          },
        });

        await PushNotifications.register();
      } catch (error) {
        console.warn("Unable to initialize native push notifications.", error);
      }
    };

    void initializeNativePushNotifications();

    return () => {
      cancelled = true;
      if (removeListeners) {
        void removeListeners();
      }
    };
  }, [token]);

  const value = useMemo<NotificationCenterContextValue>(
    () => ({
      notifications,
      loadingNotifications,
      unreadNotificationsCount: notifications.filter((notification) => !notification.is_read).length,
      refreshNotifications,
    }),
    [loadingNotifications, notifications, refreshNotifications]
  );

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error("useNotificationCenter must be used inside NotificationCenterProvider");
  }
  return context;
}
