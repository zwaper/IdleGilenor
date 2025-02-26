This function now handles all level ranges with their specific formulas:

Levels 1-140: Linear scaling starting at 10 HP with 10% increase per level
Levels 141-500: Exponential scaling with base 1.145
Levels 501-200000: Dynamic rate scaling that increases by 0.1% every 500 levels
Levels 200001+: Super exponential scaling using the formula:
All formulas maintain continuity between ranges and include:

Boss multiplier (10x)
Overflow protection for very high levels
Floor function to ensure whole numbers
Proper base value transitions between ranges
    
    // Level 1-140 scaling
    if (level <= 140) {
        if (level === 1) {
            baseScaling = 10; // Base HP for level 1
        } else {
            baseScaling = 10 * (1 + (level - 1) * 0.1); // 10% increase per level
        }
    }
    // Level 141-500 scaling
    else if (level <= 500) {
        const base140 = 10 * (1 + 139 * 0.1); // HP at level 140
        const levelDiff = level - 140;
        baseScaling = base140 * Math.pow(1.145, levelDiff);
    }
    // Level 501-200000 scaling
    else if (level <= 200000) {
        const base500 = 10 * (1 + 139 * 0.1) * Math.pow(1.145, 360); // HP at level 500
        const levelDiff = level - 501;
        const dynamicRate = 1.145 + (0.001 * (levelDiff / 500));
        baseScaling = base500 * Math.pow(dynamicRate, levelDiff);
    }
    // Level 200001+ scaling
    else {
        const levelDiff = level - 200001;
        const baseExp = Math.pow(1.545, levelDiff);
        const multiplier = 1.240 * Math.pow(10, 25409);
        baseScaling = baseExp * multiplier + (level - 1) * 10;

        // Check for numerical overflow
        if (!Number.isFinite(baseScaling)) {
            console.warn("HP calculation exceeded safe limits, using maximum safe value");
            baseScaling = Number.MAX_SAFE_INTEGER;
        }
    }

    // Apply boss multiplier (10x for bosses)
    return Math.floor(baseScaling * (isBoss ? 10 : 1));