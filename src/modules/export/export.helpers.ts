export const boldHeader = (sheet: { getRow: (n: number) => { font: unknown } }) => {
  sheet.getRow(1).font = { bold: true, size: 12 };
};

export const toDateStr = (d: Date | string | null | undefined) => {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return isNaN(dateObj.getTime()) ? "" : dateObj.toISOString().replace("T", " ").slice(0, 19);
};
