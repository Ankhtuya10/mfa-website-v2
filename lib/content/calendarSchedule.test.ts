import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildScheduleArticleHref,
  dateTimeLocalToIso,
  getCalendarScheduleDate,
  normalizeDateTimeLocalValue,
  toDateTimeLocalValue,
} from "./calendarSchedule";

describe("calendar scheduling helpers", () => {
  it("uses today at 09:00 when scheduling from the current month", () => {
    const date = getCalendarScheduleDate(
      new Date(2026, 4, 1, 12),
      new Date(2026, 4, 26, 16, 30),
    );

    assert.equal(toDateTimeLocalValue(date), "2026-05-26T09:00");
  });

  it("uses the first day at 09:00 when scheduling from another month", () => {
    const date = getCalendarScheduleDate(
      new Date(2026, 6, 1, 12),
      new Date(2026, 4, 26, 16, 30),
    );

    assert.equal(toDateTimeLocalValue(date), "2026-07-01T09:00");
  });

  it("builds a new article URL with review status and a schedule date", () => {
    assert.equal(
      buildScheduleArticleHref(new Date(2026, 4, 26, 9, 0)),
      "/admin/articles/new?status=review&published_at=2026-05-26T09%3A00",
    );
  });

  it("normalizes datetime-local values and serializes them to ISO", () => {
    assert.equal(
      normalizeDateTimeLocalValue("2026-05-26T09:00"),
      "2026-05-26T09:00",
    );
    assert.equal(
      dateTimeLocalToIso("2026-05-26T09:00"),
      new Date(2026, 4, 26, 9, 0).toISOString(),
    );
    assert.equal(normalizeDateTimeLocalValue("nope"), "");
    assert.equal(dateTimeLocalToIso(""), null);
  });
});
