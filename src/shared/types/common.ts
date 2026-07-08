/** Unique identifier used across all domain entities. */
export type Id = string;

/** ISO-8601 timestamp string (e.g. `2026-01-31T12:00:00.000Z`). */
export type IsoDateTime = string;

/** ISO-8601 date string without time (e.g. `2026-01-31`). */
export type IsoDate = string;

/** Fields shared by every persisted entity. */
export interface Timestamped {
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
