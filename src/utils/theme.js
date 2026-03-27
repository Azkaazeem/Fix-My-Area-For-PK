export const hexToRgb = (hex) => {
    const sanitized = hex.replace("#", "");
    const normalized = sanitized.length === 3
        ? sanitized.split("").map((char) => `${char}${char}`).join("")
        : sanitized;
    const value = Number.parseInt(normalized, 16);
    return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};
