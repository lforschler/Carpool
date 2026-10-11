"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import mock from "./mock-schedule.json";
import type { ScheduleData, Trip, TripStatus } from "./types";

type ScheduleContextValue = {
  data: ScheduleData;
  trips: Trip[];
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  resetTrips: () => void;
  reload: () => Promise<void>;
  hydrated: boolean;
  persistMode: "db" | "local" | "loading";
  error: string | null;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);
const baseData = mock as ScheduleData;
const LOCAL_KEY = "carpool-explore-trips-v1";

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
  const { status } = useSession();
  const [data, setData] = useState<ScheduleData>(baseData);
  const [trips, setTrips] = useState<Trip[]>(baseData.trips);
  const [hydrated, setHydrated] = useState(false);
  const [persistMode, setPersistMode] = useState<"db" | "local" | "loading">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const loadFromDb = useCallback(async () => {
    const res = await fetch("/api/schedule");
    if (!res.ok) {
      let hint = "Failed to load schedule";
      try {
        const body = (await res.json()) as { hint?: string; error?: string };
        if (body.hint) hint = body.hint;
        else if (body.error) hint = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(hint);
    }
    const json = (await res.json()) as ScheduleData;
    setData(json);
    setTrips(json.trips.map(normalizeTrip));
    setPersistMode("db");
    if (!json.trips.length) {
      setError(
        "Schedule is empty for this account. Sign out and sign back in, or ask for a re-seed.",
      );
    } else {
      setError(null);
    }
  }, []);

  const loadLocal = useCallback(() => {
    let nextTrips = baseData.trips;
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trip[];
        if (Array.isArray(parsed) && parsed.length) {
          nextTrips = parsed.map(normalizeTrip);
        }
      }
    } catch {
      /* ignore */
    }
    setData({ ...baseData, trips: nextTrips });
    setTrips(nextTrips);
    setPersistMode("local");
  }, []);

  const reload = useCallback(async () => {
    if (status === "authenticated") {
      await loadFromDb();
    } else {
      loadLocal();
    }
  }, [status, loadFromDb, loadLocal]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status === "loading") return;
      try {
        if (status === "authenticated") {
          await loadFromDb();
        } else {
          loadLocal();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
          loadLocal();
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, loadFromDb, loadLocal]);

  useEffect(() => {
    if (!hydrated || persistMode !== "local") return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trips));
  }, [trips, hydrated, persistMode]);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      data: { ...data, trips },
      trips,
      hydrated,
      persistMode,
      error,
      reload,
      updateTrip: (id, patch) => {
        setTrips((prev) => {
          const next = prev.map((t) => {
            if (t.id !== id) return t;
            const merged = normalizeTrip({ ...t, ...patch });
            if (patch.status) merged.status = patch.status as TripStatus;
            if (merged.noSchool) merged.status = "cancelled";
            else if (!merged.driverId && merged.status !== "cancelled")
              merged.status = "unassigned";
            return merged;
          });

          const updated = next.find((t) => t.id === id);
          if (persistMode === "db" && updated) {
            void fetch(`/api/trips/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                driverId: updated.driverId,
                riderIds: updated.riderIds,
                status: updated.status,
                noSchool: updated.noSchool,
              }),
            }).then(async (res) => {
              if (!res.ok) {
                setError("Could not save trip — reloading");
                await loadFromDb().catch(() => undefined);
              }
            });
          }

          return next;
        });
      },
      resetTrips: () => {
        if (persistMode === "db") {
          void loadFromDb();
          return;
        }
        setTrips(baseData.trips);
        localStorage.removeItem(LOCAL_KEY);
      },
    }),
    [data, trips, hydrated, persistMode, error, reload, loadFromDb],
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
