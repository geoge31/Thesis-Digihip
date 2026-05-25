import React, { createContext, useContext, useEffect, useState } from 'react';

export interface INotificationItem {
  _id?: string;
  doctor_id?: string;
  title: string;
  message: string;
  notifyPeriod:
    | 'once'
    | '12h'
    | '1day'
    | '2days'
    | '5days'
    | '1week'
    | '2weeks'
    | '1month'
    | '2months'
    | '4months'
    | '6months'
    | '1year';
  isActive?: boolean;
  refID?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  _id?: string;
  patient_id?: string;
  notifications: INotificationItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationContextType {
  Notifications: INotification[] | null;
  setNotificationsForPatient: (patient_id: string, notifications: INotificationItem[]) => void;
  getNotificationsForPatient: (patient_id: string) => INotificationItem[];
  deleteNotificationItem: (patient_id: string, notification_id: string) => void;
  toggleNotificationActive: (patient_id: string, notification_id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ Notifications, setNotifications ] = useState<INotification[] | null>(null);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/all');
        const data = await res.json();
        // console.log('Fetched all notifications:', data);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch all notifications:', err);
      }
    };

    fetchAllNotifications(); 
  }, []);
  

  const setNotificationsForPatient = (patient_id: string, newNotifications: INotificationItem[]) => {
    setNotifications(prev =>
      prev
        ? prev.map(notif =>
            notif.patient_id === patient_id
              ? {
                  ...notif,
                  notifications: [...notif.notifications, ...newNotifications],
                }
              : notif
          )
        : []
    );
  };

  const getNotificationsForPatient = (patient_id: string): INotificationItem[] => {
    if (!Notifications) return [];
    const patientData = Notifications.find(n => n.patient_id === patient_id);
    return patientData?.notifications || [];
  };

  const deleteNotificationItem = (patient_id: string, notification_id: string) => {
    console.log(patient_id);
    setNotifications(prev =>
      prev
        ? prev.map(notif =>
            notif.patient_id === patient_id
              ? {
                  ...notif,
                  notifications: notif.notifications.filter(n => n._id !== notification_id),
                }
              : notif
          )
        : []
    );
  };

  const toggleNotificationActive = (patient_id: string, notification_id: string) => {
    setNotifications(prev =>
      prev
        ? prev.map(notif =>
            notif.patient_id === patient_id
              ? {
                  ...notif,
                  notifications: notif.notifications.map(n =>
                    n._id === notification_id ? { ...n, isActive: !n.isActive } : n
                  ),
                }
              : notif
          )
        : []
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        Notifications,
        setNotificationsForPatient,
        getNotificationsForPatient,
        deleteNotificationItem,
        toggleNotificationActive,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
