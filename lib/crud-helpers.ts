export function csvToList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function listToCsv(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }
  return value.join(", ");
}
