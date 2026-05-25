/**
 * @path @/utils
 * @file generatePassword.ts
 *
 * Generates a cryptographically random password.
 */

import crypto from "crypto";

export function generatePassword(length = 16): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*";
    const all = uppercase + lowercase + digits + symbols;

    const guaranteed = [
        uppercase[crypto.randomInt(uppercase.length)],
        lowercase[crypto.randomInt(lowercase.length)],
        digits[crypto.randomInt(digits.length)],
        symbols[crypto.randomInt(symbols.length)],
    ];

    const remaining = Array.from({ length: length - guaranteed.length }, () =>
        all[crypto.randomInt(all.length)]
    );

    const chars = [...guaranteed, ...remaining];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
}
