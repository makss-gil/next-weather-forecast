export function getDayOrNightIcon(
    iconName: string,
    dateTimeString: string
  ): string {
    const hours = new Date(dateTimeString).getHours(); // Отримуємо годину з дати
  
    const isDayTime = hours >= 6 && hours < 18; // День вважається з 6:00 до 18:00
  
    return isDayTime
      ? iconName.replace(/.$/, "d") // Якщо день — замінити останній символ на 'd'
      : iconName.replace(/.$/, "n"); // Якщо ніч — замінити останній символ на 'n'
  }
  