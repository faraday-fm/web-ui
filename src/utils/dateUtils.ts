function padZero(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDate(inputDate: Date) {
  const date = inputDate.getDate();
  const month = inputDate.getMonth() + 1;
  let year = inputDate.getFullYear();
  if (year > 2000) year -= 2000;
  if (year > 1900) year -= 1900;

  return `${padZero(date)}/${padZero(month)}/${padZero(year)}`;
}

export function formatTime(inputDate: Date) {
  const hours = inputDate.getHours();
  const minutes = inputDate.getMinutes();

  return `${padZero(hours)}:${padZero(minutes)}`;
}

export function formatDateTime(inputDate: Date) {
  return `${formatDate(inputDate)} ${formatTime(inputDate)}`;
}
