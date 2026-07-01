export type ReservationStatus = "pending" | "approved" | "rejected" | "postponed" | "renewed";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  source: "online";
  adminNotes?: string;
};

const STORAGE_KEY = "love-restaurant-reservations";

export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReservations(reservations: Reservation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

export function createReservation(input: Omit<Reservation, "id" | "createdAt" | "updatedAt" | "source" | "status"> & { status?: ReservationStatus }): Reservation {
  const now = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    source: "online",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

export function updateReservationStatus(reservations: Reservation[], id: string, status: ReservationStatus, adminNotes?: string) {
  const updatedAt = new Date().toISOString();
  return reservations.map((reservation) =>
    reservation.id === id
      ? {
          ...reservation,
          status,
          adminNotes: adminNotes ?? reservation.adminNotes,
          updatedAt,
        }
      : reservation,
  );
}
