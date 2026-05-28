import { NativeModules, Platform } from 'react-native';

const DEFAULT_BACKEND_PORT = 5000;

const getHostFromBundleUrl = (): string | null => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) return null;

  // Example: http://192.168.1.42:8081/index.bundle?platform=android
  const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1] ?? null;
};

const addIfMissing = (list: string[], url: string): void => {
  if (!list.includes(url)) list.push(url);
};

export const getApiBaseUrls = (): string[] => {
  const host = getHostFromBundleUrl();
  const urls: string[] = [];

  // If Metro is served from a LAN IP, reuse that host for backend first.
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    addIfMissing(urls, `http://${host}:${DEFAULT_BACKEND_PORT}`);
  }

  const isMetroUsingEmulatorHost = host === '10.0.2.2' || host === '10.0.3.2';
  const isMetroUsingLoopback = host === 'localhost' || host === '127.0.0.1';

  if (Platform.OS === 'android') {
    if (isMetroUsingLoopback) {
      // Physical device with adb reverse usually reaches the backend via loopback first.
      addIfMissing(urls, `http://localhost:${DEFAULT_BACKEND_PORT}`);
      addIfMissing(urls, `http://127.0.0.1:${DEFAULT_BACKEND_PORT}`);
    }

    if (isMetroUsingEmulatorHost) {
      addIfMissing(urls, `http://10.0.2.2:${DEFAULT_BACKEND_PORT}`);
      addIfMissing(urls, `http://10.0.3.2:${DEFAULT_BACKEND_PORT}`);
    }

    // Always keep the other common Android mappings as fallbacks.
    addIfMissing(urls, `http://192.168.1.96:${DEFAULT_BACKEND_PORT}`);
    addIfMissing(urls, `http://localhost:${DEFAULT_BACKEND_PORT}`);
    addIfMissing(urls, `http://127.0.0.1:${DEFAULT_BACKEND_PORT}`);
    addIfMissing(urls, `http://10.0.2.2:${DEFAULT_BACKEND_PORT}`);
    addIfMissing(urls, `http://10.0.3.2:${DEFAULT_BACKEND_PORT}`);
  } else {
    addIfMissing(urls, `http://localhost:${DEFAULT_BACKEND_PORT}`);
    addIfMissing(urls, `http://127.0.0.1:${DEFAULT_BACKEND_PORT}`);
  }

  return urls;
};

// Backward-compatible single URL getter.
export const getApiBaseUrl = (): string => getApiBaseUrls()[0];
