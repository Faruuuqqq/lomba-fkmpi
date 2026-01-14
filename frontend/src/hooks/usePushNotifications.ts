import { useState, useEffect } from 'react';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const isPushSupported = 'PushManager' in window && 'serviceWorker' in navigator;
    setIsSupported(isPushSupported);

    if (!isPushSupported) {
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setPermission(permission);
      });
    }

    // Get existing subscription
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.pushManager) {
          registration.pushManager.getSubscription().then((sub) => {
            setSubscription(sub);
          }).catch(() => {
            setSubscription(null);
          });
        }
      });
    }
  }, []);

  const subscribeToPush = async () => {
    if (!isSupported) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.pushManager) {
        console.warn('Push Manager not available');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(subscription);
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Remove subscription from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

    } catch (error) {
      console.error('Push unsubscription failed:', error);
    }
  };

  const sendLocalNotification = (title: string, body: string, options?: Partial<PushNotification>) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: options?.icon || '/icons/icon-96x96.png',
        tag: options?.tag,
        data: options?.data,
        requireInteraction: options?.requireInteraction || false
      });
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    sendLocalNotification
  };
}