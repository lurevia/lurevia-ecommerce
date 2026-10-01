export interface PingWithCourier {
  id: string;
  orderId: string;
  courierId: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  recordedAt: Date;
  courier?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone?: string | null;
  } | null;
}
