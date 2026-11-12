export function formatNaira(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₦0';
  }
  const val = Number(amount);
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val).replace('NGN', '₦');
  } catch {
    return `₦${val.toLocaleString()}`;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateWaybillNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WB-${random}`;
}
