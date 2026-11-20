const { promisify } = require("node:util");
const {
    randomBytes,
    scrypt,
    timingSafeEqual,
    createHash
} = require("node:crypto");

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16);
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, passwordHash) {
    const [saltHex, keyHex] = passwordHash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const expectedKey = Buffer.from(keyHex, "hex");

    if (salt.length !== 16 || expectedKey.length !== 64) {
        return false;
    }

    const actualKey = await scryptAsync(password, salt, expectedKey.length);
    return timingSafeEqual(expectedKey, actualKey);
}

function createSessionToken() {
    return randomBytes(32).toString("hex");
}

function hashSessionToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function createPasswordResetToken() {
    return randomBytes(32).toString("hex");
}

function hashPasswordResetToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

module.exports = {
    hashPassword,
    verifyPassword,
    createSessionToken,
    hashSessionToken,
    createPasswordResetToken,
    hashPasswordResetToken
};
