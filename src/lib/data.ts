/**
 * Every read the pages make, as the signed-in user. Nothing is cached across
 * requests: a back-office should always show what GoHead holds now. Within
 * one request, React's cache() shares a read between components.
 *
 * GoHead cannot filter on relations, so "the cables of a device" or "the
 * maintenance of a device" are read whole and filtered here: a studio has
 * hundreds of entries, not millions.
 */
import "server-only";

import { isGoHeadError, type Entry } from "@gohead-cms/client";
import { cache } from "react";

import type { Booking, Cable, Client, Device, Location, Maintenance, Room } from "@/gohead";
import { withSession } from "@/lib/session";

export type DeviceEntry = Entry<Device>;
export type CableEntry = Entry<Cable>;
export type LocationEntry = Entry<Location>;
export type RoomEntry = Entry<Room>;
export type ClientEntry = Entry<Client>;
export type BookingEntry = Entry<Booking>;
export type MaintenanceEntry = Entry<Maintenance>;

const PAGE = 100;

export const getDevices = cache(() =>
  withSession((g) => g.collection("devices").findAll({ sort: ["code"], pageSize: PAGE, level: 1 })),
);

export const getDevice = cache((id: number) =>
  withSession(async (g) => {
    try {
      return await g.collection("devices").findOne(id, { level: 2 });
    } catch (err) {
      if (isGoHeadError(err) && err.status === 404) return null;
      throw err;
    }
  }),
);

/** Cables with their devices as IDs: pages join them with getDevices(). */
export const getCables = cache(() =>
  withSession((g) => g.collection("cables").findAll({ sort: ["code"], pageSize: PAGE, level: 0 })),
);

export const getCable = cache((id: number) =>
  withSession(async (g) => {
    try {
      return await g.collection("cables").findOne(id, { level: 0 });
    } catch (err) {
      if (isGoHeadError(err) && err.status === 404) return null;
      throw err;
    }
  }),
);

export const getLocations = cache(() =>
  withSession((g) => g.collection("locations").findAll({ sort: ["name"], pageSize: PAGE, level: 1 })),
);

export const getRooms = cache(() =>
  withSession((g) => g.collection("rooms").findAll({ sort: ["name"], pageSize: PAGE, level: 1 })),
);

export const getClients = cache(() =>
  withSession((g) => g.collection("clients").findAll({ sort: ["name"], pageSize: PAGE, level: 0 })),
);

export const getMaintenance = cache(() =>
  withSession((g) => g.collection("maintenance").findAll({ sort: ["date:desc"], pageSize: PAGE, level: 0 })),
);

/** Bookings overlapping [from, to). */
export const getBookings = cache((from: string, to: string) =>
  withSession((g) =>
    g.collection("bookings").findAll({
      filters: { starts_at: { $lt: to }, ends_at: { $gt: from } },
      sort: ["starts_at"],
      pageSize: PAGE,
      level: 1,
    }),
  ),
);

export const getBooking = cache((id: number) =>
  withSession(async (g) => {
    try {
      return await g.collection("bookings").findOne(id, { level: 1 });
    } catch (err) {
      if (isGoHeadError(err) && err.status === 404) return null;
      throw err;
    }
  }),
);

/** The ID of a relation, populated or not. */
export function refId(value: { id: number } | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === "number" ? value : value.id;
}
