import { useEffect, useState } from 'react';

type ApiStatus = 'checking' | 'online' | 'offline';

interface AppView {
  statusLabel: string;
}

const statusLabels: Record<ApiStatus, string> = {
  checking: 'Checking core-api…',
  online: 'core-api is online',
  offline: 'core-api is offline',
};

const fetchApiStatus = async (): Promise<ApiStatus> => {
  try {
    const response = await fetch('/api/health');

    return response.ok ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
};

export const useApp = (): AppView => {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    void fetchApiStatus().then(setStatus);
  }, []);

  return { statusLabel: statusLabels[status] };
};
