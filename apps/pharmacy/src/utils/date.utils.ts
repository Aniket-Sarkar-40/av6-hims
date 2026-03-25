export function excelDateToJSDate(serial: number | string): Date {
  // Excel counts from 1900-01-01, JS counts from 1970-01-01
  if (typeof serial === "string") {
    return new Date(serial);
  } else {
    const utc_days = Math.floor(serial - 25569); // days between 1900 and 1970
    const utc_value = utc_days * 86400; // seconds
    return new Date(utc_value * 1000); // JS expects milliseconds
  }
}
