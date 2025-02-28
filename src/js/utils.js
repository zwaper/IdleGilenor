export function calculateWeaponPrice(level) {
    if (level <= 15) {
        return Math.floor((5 + level) * Math.pow(1.07, level - 1));
    } else {
        return Math.floor(20 * Math.pow(1.07, level - 1));
    }
}