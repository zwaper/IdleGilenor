// Champion Configuration
export const CHAMPION_CONFIG = {
    BASE_COST: 100,
    COST_MULTIPLIER: 1.15,  // Each level costs 15% more
    DPS_MULTIPLIER: 1.1,    // Each level increases DPS by 10%
    UNLOCK_COST_MULTIPLIER: 5, // Each new champion costs 5x more than the previous

    UNLOCK_CONDITIONS: {
        millysoftgrain: { 
            cost: 50,
            requires: {
                gold: 50,
                championLevels: { worldguardian: 1}
            }
        },
        ealdred: { 
            cost: 250,
            requires: {
                gold: 250,
                championLevels: { millysoftgrain: 1}
            }
        },
        brotherclement: { 
            cost: 1000,
            requires: {
                gold: 1000,
                championLevels: { ealdred: 1 }
            }
        },
        thamaron: { 
            cost: 4000,
            requires: {
                gold: 4000,
                championLevels: { brotherclement: 1 }
            }
        },
        guthansnightmare: { 
            cost: 20000,
            requires: {
                gold: 20000,
                championLevels: { thamaron: 1 }
            }
        },
        gravelock: { 
            cost: 100000,
            requires: {
                gold: 100000,
                championLevels: { guthansnightmare: 1 }
            }
        },
        ebonshade: { 
            cost: 400000,
            requires: {
                gold: 400000,
                championLevels: { gravelock: 1 }
            }
        },
    }
};

// Champion Data
export const championsData = {
    champions: [
        { //1st champion
            id: "worldguardian",
            name: "World Guardian",
            baseCost: 5,
            baseDamage: 1,
            description: "A warrior who enhances your clicking power",
            image: "cid.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { 
                    level: 10, 
                    name: "Swift Strikes", 
                    effect: "Click Damage x2",
                    cost: 100
                },
                { 
                    level: 25, 
                    name: "Power Clicks", 
                    effect: "Click Damage x2",
                    cost: 250
                },
                { 
                    level: 50, 
                    name: "Legendary Clicks", 
                    effect: "Click Damage x2",
                    cost: 1000
                }
            ]
        },
        { //2nd champion
            id: "millysoftgrain",
            name: "Milly Softgrain",
            baseCost: 50,
            baseDPS: 5,
            description: "The farmer's Daughter",
            image: "millysoftgrain.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Golden Harvest", effect: "DPS x2", cost: 500 },
                { level: 25, name: "Threshing Blow", effect: "DPS x3", cost: 1250 },
            ]
        },
        { //3rd champion
            id: "ealdred",
            name: "Ealdred, The Retired Wizard",
            baseCost: 250,
            baseDPS: 22,
            description: "A former apprentice of the Wizards’ Tower, now living quietly in Lumbridge.",
            image: "ealdred.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Temporal Glitch", effect: "DPS x2", cost: 10000 },
                { level: 25, name: "Runic Discharge", effect: "DPS x3", cost: 40000 },
                { level: 50, name: "Divine Reckoning", effect: "DPS x5", cost: 200000 }
            ]
        },
        { //4th champion
            id: "brotherclement",
            name: "Brother Clement",
            baseCost: 1000,
            baseDPS: 74,
            description: "A wandering monk who preaches balance and the power of faith.",
            image: "brotherclement.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Blessing of the Light", effect: "DPS x2", cost: 50000 },
                { level: 25, name: "Divine Reckoning", effect: "DPS x3", cost: 200000 },
                { level: 50, name: "Equilibrium Shift", effect: "DPS x5", cost: 1000000 },
                { 
                    level: 75, 
                    name: "Alms of Prosperity", 
                    effect: "Gold drops +25%", 
                    cost: 5000000,
                    specialEffect: {
                        type: "goldMultiplier",
                        value: 0.25
                    }
                }
            ]
        },
        { //5th champion
            id: "thamaron",
            name: "Thamaron The Infernal",
            baseCost: 4000,
            baseDPS: 245,
            description: "The Wilderness claims another!",
            image: "mage.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Chaos Tempets", effect: "DPS x2", cost: 40000 },
                { level: 25, name: "Wildfire Aura", effect: "DPS x3", cost: 200000 },
                { level: 50, name: "Soul Harvest", effect: "DPS x5", cost: 1000000 }
            ]
        },
        { //6th champion
            id: "guthansnightmare",
            name: "Guthan’s Nightmare",
            baseCost: 20000,
            baseDPS: 976,
            description: "Your life… is mine!",
            image: "new_champion.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Warspear Thrust", effect: "DPS x2", cost: 50000 },
                { level: 25, name: "Spectral Bulwark", effect: "DPS x3", cost: 200000 },
                { level: 50, name: "Phantom Charge", effect: "DPS x5", cost: 1000000 }
            ]
        },
        { //7th champion
            id: "gravelock",
            name: "Gravelock, the Rune Warrior",
            baseCost: 100000,
            baseDPS: 3725,
            description: "His ancient runes resonate in the stone corridors of Varrock’s old mines.",
            image: "gravelock.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Rune Strike", effect: "DPS x2", cost: 1000000 },
                { level: 25, name: "Stone Sigil", effect: "DPS x3", cost: 2500000 },
                { level: 50, name: "Runic Echo", effect: "DPS x5", cost: 10000000 }
            ]
        },
        { //8th champion
            id: "ebonshade",
            name: "Ebonshade, the Abyssal Shade",
            baseCost: 400000,
            baseDPS: 10859,
            description: "His dark silhouette is often seen amid the shadowy alleys of Draynor at midnight.",
            image: "gravelock.png",
            unlocked: false,
            minimizable: false,
            upgrades: [
                { level: 10, name: "Radiant Strike", effect: "DPS x2", cost: 4000000 },
                { level: 25, name: "Lightforged Armor", effect: "DPS x3", cost: 10000000 },
                { level: 50, name: "Flare Anvil", effect: "DPS x5", cost: 40000000 }
            ]
        },
    ]
};