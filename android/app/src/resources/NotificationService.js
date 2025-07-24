import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('Notification received:', notification);
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

export const scheduleNotification = (id, title, message, date) => {
  PushNotification.localNotificationSchedule({
    id: `${id}`,
    channelId: 'reservation-channel',
    title,
    message,
    date,
    allowWhileIdle: true,
  });
    console.log(`Notificación programada con id=${id} para ${date}`);

};
PushNotification.localNotification({
  channelId: 'reservation-channel',
  title: "Test Notificación",
  message: "Esta es una notificación inmediata para test",
});

export const cancelNotification = (id) => {
  PushNotification.cancelLocalNotifications({id: `${id}`});
};

PushNotification.createChannel(
  {
    channelId: 'reservation-channel',
    channelName: 'Reservas',
    channelDescription: 'Recordatorios de reservas',
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`) 
);
