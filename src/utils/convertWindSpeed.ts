export function convertWindSpeed(speedInMetersPerSecond: number): string {
    const kmh = speedInMetersPerSecond * 3.6;
    return `${kmh.toFixed(0)} km/h`; // округлення до цілого
  }
  