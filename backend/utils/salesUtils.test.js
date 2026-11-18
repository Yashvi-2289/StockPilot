const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateAverageDailySales } = require("./salesUtils");

test("calculates the average using inclusive calendar days since the first sale", () => {
    const average = calculateAverageDailySales(
        12,
        new Date("2026-11-16T23:30:00.000Z"),
        new Date("2026-11-18T01:00:00.000Z")
    );

    assert.equal(average, 4);
});

test("counts a sale day as one day when the sale is today", () => {
    const average = calculateAverageDailySales(
        7,
        new Date("2026-11-18T08:00:00.000Z"),
        new Date("2026-11-18T21:00:00.000Z")
    );

    assert.equal(average, 7);
});
