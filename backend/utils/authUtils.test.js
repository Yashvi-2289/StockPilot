const test = require("node:test");
const assert = require("node:assert/strict");
const {
    createSessionToken,
    hashPassword,
    hashSessionToken,
    verifyPassword
} = require("./authUtils");

test("password hashes verify only the original password", async () => {
    const passwordHash = await hashPassword("private-store-password");

    assert.equal(await verifyPassword("private-store-password", passwordHash), true);
    assert.equal(await verifyPassword("another-password", passwordHash), false);
});

test("session tokens are random and stored as one-way hashes", () => {
    const firstToken = createSessionToken();
    const secondToken = createSessionToken();

    assert.notEqual(firstToken, secondToken);
    assert.equal(hashSessionToken(firstToken), hashSessionToken(firstToken));
    assert.notEqual(hashSessionToken(firstToken), firstToken);
});
