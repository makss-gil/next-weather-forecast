export function metersToKilometers(visibilityInMeters?: number): string {
    // Перевіряємо на undefined/null/NaN/нечислове значення
    if (visibilityInMeters == null || isNaN(visibilityInMeters)) {
      return "N/A";
    }
    
    const visibilityInKilometers = visibilityInMeters / 1000;
    return `${visibilityInKilometers.toFixed(0)} km`; // Додав пробіл перед "km" для кращого форматування
  }