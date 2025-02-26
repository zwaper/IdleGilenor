Here's a comprehensive README.md explaining the game's formulas:

# IdleGielinor Game Formulas

## Combat Formulas

### Monster HP Scaling

II is the product symbol, ⌈⌉ are ceiling brackets and ,⌊⌋  are flooring brackets.
level 1 to level 140 the formula goes: ⌈10 x ( Level - 1 + 1.55level-1) x [isBoss x 10]⌉
level 141 to level 500 the formula goes: ⌈10 x (139 + 1.55139 x 1.145level-140) x [isBoss x 10]⌉
Level 501 to Level 200000: ⌈ 10 x (139 + 1.55139 x 1.145360 x Level II i=501 (1.145 + 0.001 x ⌊i - 1 / 500)) x [isBoss x 10]⌉
Level 200001 onwards: ⌈1.545Level-200001 x 1.240 x 1025409 + (Level - 1) x 10⌉

```javascript
function calculateHP(level, isBoss = false) {
    // Level 1-140: Linear scaling with 10% increase per level
    if (level <= 140) {
        baseHP = 10 * (1 + (level - 1) * 0.1)
    }
    // Level 141-500: Exponential scaling
    else if (level <= 500) {
        baseHP = base140HP * Math.pow(1.145, level - 140)
    }
    // Level 501-200000: Dynamic scaling
    else if (level <= 200000) {
        dynamicRate = 1.145 + (0.001 * ((level - 500) / 500))
        baseHP = base500HP * Math.pow(dynamicRate, level - 500)
    }
    // Level 200001+: Super scaling
    else {
        baseHP = base200kHP * Math.pow(1.15, (level - 200000) / 1000)
    }

    // Boss multipliers
    bossMultiplier = isBoss ? (isBoss === 'elite' ? 10 : 5) : 1
    return Math.min(baseHP * bossMultiplier, 1000000000)
}

## GOLD Rewards

function calculateBaseGold(level) {
    // Level 1-140: Exponential growth
    if (level <= 140) {
        return Math.pow(1.6, level - 1)
    }
    // Level 141+: Slower scaling
    else {
        baseGold = 4.717e28  // Gold at level 140
        return baseGold * Math.pow(1.15, level - 140)
    }
}

# Champion System
## Champion Cost

// Cost formula for Click Warrior (Cid)
if (level <= 15) {
    cost = floor((5 + level) × 1.07^(level - 1))
} else {
    cost = floor(20 × 1.07^(level - 1))
}

// Cost formula for other champions
cost = floor(baseCost × 1.22^(level - 1))

## Champion Damage

// Click Warrior damage
clickDamage = baseClickDamage + level + upgradeMultipliers

// DPS Champions damage
dps = baseDPS × 1.1^(level - 1) × upgradeMultipliers

# Item System
## Item Values

// Item value based on tier and level
value = baseGold × tierMultiplier
where tierMultiplier = {
    'C': 0.5,  // Common
    'B': 2.0,  // Uncommon
    'A': 5.0,  // Rare
    'S': 15.0  // Super Rare
}

# Region Multipliers
REGION_DIFFICULTY_MULTIPLIERS = {
    lumbridge: 1.0,  // Base difficulty
    varrock: 2.5     // 2.5x harder than Lumbridge
}

# Zone Unlocking
Zones unlock based on level requirements in previous zones
Example: Goblin Village unlocks at level 50 in Cow Pen
# Achievement System
Tracks various milestones (kills, gold, etc.)
Rewards based on achievement difficulty
Progress tracked incrementally
# Collection Log
Tracks unique items found
Organized by region and rarity tier
Shows completion percentage
# Additional Notes
HP capped at 1 billion
Level caps vary by region (Lumbridge: 100, Varrock: 250)
Auto-clicker DPS calculated as: damage × (1000/interval)