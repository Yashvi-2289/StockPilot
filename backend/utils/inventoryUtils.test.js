const test = require("node:test");
const assert = require("node:assert/strict");
const {
    calculateSuggestedOrder
} = require("./inventoryUtils");

test("suggests enough stock to reach lead-time demand plus safety stock", () => {
    assert.equal(calculateSuggestedOrder(5, 2, 3, 4), 5);
});

test("suggests no order when stock already covers the target", () => {
    assert.equal(calculateSuggestedOrder(10, 2, 3, 4), 0);
});

test("rounds a fractional suggested quantity up to a whole unit", () => {
    assert.equal(calculateSuggestedOrder(2, 1.25, 2, 1), 2);
});
