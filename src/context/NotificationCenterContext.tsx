import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import {
  ApiNotification,
  getNotificationsApi,
} from "../lib/api";

type NotificationCenterContextValue = {
  notifications: ApiNotification[];
  loadingNotifications: boolean;
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
};

const NotificationCenterContext = createContext<NotificationCenterContextValue | undefined>(undefined);

const NOTIFICATION_POLL_INTERVAL_MS = 15000;

function sortByCreatedAtDesc<T extends { created_at: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const knownNotificationIdsRef = useRef<Set<number>>(new Set());

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
        });
      }

      setNotifications(sortByCreatedAtDesc(freshNotifications));
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
