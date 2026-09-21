export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(price: number, salePrice: number): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TZ${stamp}${rand}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getShippingFee(subtotal: number): number {
  if (subtotal >= 500000) return 0;
  return 30000;
}

export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Giao hàng tiêu chuẩn (2-4 ngày)', fee: 30000 },
  { id: 'express', name: 'Giao hàng nhanh (1-2 ngày)', fee: 60000 },
  { id: 'sameday', name: 'Giao hàng trong ngày', fee: 90000 },
];

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: 'Truck' },
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: 'CreditCard' },
  { id: 'momo', name: 'Ví điện tử MoMo', icon: 'Wallet' },
  { id: 'vnpay', name: 'VNPay QR Code', icon: 'QrCode' },
];

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export const VIETNAM_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Long An', 'An Giang', 'Bà Rịa - Vũng Tàu',
  'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre',
  'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Tháp', 'Gia Lai',
  'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang',
  'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum',
  'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
  'Vĩnh Phúc', 'Yên Bái', 'Phú Yên',
];
