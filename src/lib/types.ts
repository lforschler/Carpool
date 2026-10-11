export type TripStatus = "planned" | "confirmed" | "unassigned" | "cancelled";

export type Family = {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  address: string;
  driverId: string;
  kidIds: string[];
};

export type Kid = {
  id: string;
  name: string;
  familyId: string | null;
  short: string;
  note?: string;
};

export type Driver = {
  id: string;
  name: string;
  fullName: string;
  familyId: string | null;
  seatCapacity: number;
};

export type Trip = {
  id: string;
  date: string;
  direction: "AM" | "PM";
  time: string;
  driverId: string | null;
  riderIds: string[];
  excludedIds: string[];
  status: TripStatus;
  noSchool: boolean;
  sheetNote: string;
};

export type ScheduleData = {
  source: string;
  schoolYearLabel: string;
  families: Family[];
  kids: Kid[];
  drivers: Driver[];
  trips: Trip[];
};
