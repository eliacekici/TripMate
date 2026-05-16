import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference dimensions (based on a standard ~393dp wide phone)
const BASE_WIDTH = 393;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

/**
 * Linear scale — proportional to screen width.
 * Use for layout dimensions (widths, heights, margins, padding).
 */
export const scale = (size: number): number =>
  Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);

/**
 * Moderate scale — less aggressive scaling (good for font sizes and small UI).
 * factor=0 means no scaling; factor=1 means full linear scaling.
 */
export const moderateScale = (size: number, factor = 0.45): number =>
  Math.round(size + (scale(size) - size) * factor);

/**
 * Round to nearest device pixel for crisp rendering.
 */
export const pixel = (size: number): number =>
  PixelRatio.roundToNearestPixel(size);
