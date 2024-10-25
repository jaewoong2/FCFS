export const getAfterMonthDate = (
  month: number,
  date: Date | string | null = null,
) => {
  const now = date ? new Date(date) : new Date();
  return new Date(now.setMonth(now.getMonth() + month));
};

export function getYYYYMMDDhhmm(): string {
  const current = new Date();

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
  const day = String(current.getDate()).padStart(2, '0');
  const hours = String(current.getHours()).padStart(2, '0');
  const minutes = String(current.getMinutes()).padStart(2, '0');
  const seconds = String(current.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}:${minutes}:${seconds}`;
}

export function getKorDate() {
  const today = new Date();
  const dateString = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dayName = today.toLocaleDateString('ko-KR', {
    weekday: 'long',
  });

  return `${dateString} ${dayName}`;
}
