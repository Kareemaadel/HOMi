import { useCallback, useEffect, useState } from 'react';
import { messageService } from '../services/message.service';
import { socketService } from '../services/socket.service';

/** Sidebar badge: true when any peer message is still unread (server + socket + focus). */
export function useMessagingUnreadDot(): boolean {
  const [hasUnread, setHasUnread] = useState(false);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setHasUnread(false);
      return;
    }
    try {
      const res = await messageService.getUnreadBadge();
      setHasUnread(res.data.hasUnread);
    } catch {
      setHasUnread(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return undefined;
    }

    const socket = socketService.connect();
    if (!socket) {
      return undefined;
    }

    const bump = () => {
      void refresh();
    };

    socket.on('conversation:updated', bump);
    socket.on('conversation:read', bump);

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      socket.off('conversation:updated', bump);
      socket.off('conversation:read', bump);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return hasUnread;
}
