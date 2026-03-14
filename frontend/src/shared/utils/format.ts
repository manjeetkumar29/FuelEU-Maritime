export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCB(cb: number): string {
  const sign = cb >= 0 ? "+" : "";
  return `${sign}${formatNumber(cb, 0)} gCO₂eq`;
}

export function cbColorClass(cb: number): string {
  if (cb > 0) return "text-green-600";
  if (cb < 0) return "text-red-600";
  return "text-gray-500";
}

export function cbBadge(cb: number): string {
  if (cb > 0) return "bg-green-100 text-green-800";
  if (cb < 0) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}
