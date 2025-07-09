export function convertKelvinToCelsius(kelvin?: number): string {
  if (kelvin == null || isNaN(kelvin)) return 'N/A';
  return Math.round(kelvin - 273.15).toString();
}
