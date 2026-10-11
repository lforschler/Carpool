"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import mock from "./mock-schedule.json";
import type { ScheduleData, Trip, TripStatus } from "./types";

const STORAGE_KEY = "carpool-explore-trips-v1";

type ScheduleContextValue = {
  data: ScheduleData;
  trips: Trip[];
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  resetTrips: () => void;
  hydrated: boolean;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

const baseData = mock as ScheduleData;

function normalizeTrip(trip: Trip): Trip {
  if (trip.noSchool) {
    return { ...trip, status: "cancelled", driverId: null, riderIds: [] };
  }
  if (!trip.driverId && trip.status !== "cancelled") {
    return { ...trip, status: "unassigned" };
  }
  if (trip.driverId && trip.status === "unassigned") {
    return { ...trip, status: "planned" };
  }
  return trip;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(baseData.trips);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trip[];
        if (Array.isArray(parsed) && parsed.length) {
          setTrips(parsed.map(normalizeTrip));
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips, hydrated]);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      data: { ...baseData, trips },
      trips,
      hydrated,
      updateTrip: (id, patch) => {
        setTrips((prev) =>
          prev.map((t) => {
            if (t.id !== id) return t;
            const next = normalizeTrip({ ...t, ...patch });
            if (patch.status) next.status = patch.status as TripStatus;
            if (next.noSchool) next.status = "cancelled";
            else if (!next.driverId && next.status !== "cancelled")
              next.status = "unassigned";
            return next;
          }),
        );
      },
      resetTrips: () => {
        setTrips(baseData.trips);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [trips, hydrated],
  );

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
