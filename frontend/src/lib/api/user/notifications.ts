// lib/api/notifications.ts
import axios from 'axios';

export const fetchNotifications = async () => {
  const response = await axios.get('/api/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await axios.post(`/api/notifications/${notificationId}/read`);
  return response.data;
};