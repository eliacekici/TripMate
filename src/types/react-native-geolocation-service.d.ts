declare module 'react-native-geolocation-service' {
  export function getCurrentPosition(success: (pos: any) => void, error?: (err: any) => void, options?: any): void;
  export function watchPosition(success: (pos: any) => void, error?: (err: any) => void, options?: any): number;
  export function clearWatch(watchId: number): void;
  export default {
    getCurrentPosition: getCurrentPosition,
    watchPosition: watchPosition,
    clearWatch: clearWatch,
  };
}
