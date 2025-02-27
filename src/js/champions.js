// Champion Configuration
export const CHAMPION_CONFIG = {
    BASE_COST: 100,
    COST_MULTIPLIER: 1.15,  // Each level costs 15% more
    DPS_MULTIPLIER: 1.1,    // Each level increases DPS by 10%
    UNLOCK_COST_MULTIPLIER: 5, // Each new champion costs 5x more than the previous

    UNLOCK_CONDITIONS: {
        warrior: { 
            cost: 50,
            requires: {
                gold: 50,
                championLevels: { clickWarrior: 1}
            }
        },
        archer: { 
            cost: 250,
            requires: {
                gold: 250,
                championLevels: { warrior: 1}
            }
        },
        mage: { 
            cost: 1000,
            requires: {
                gold: 1000,
                championLevels: { archer: 1 }
            }
        },
        thamaron: { 
            cost: 4000,
            requires: {
                gold: 4000,
                championLevels: { mage: 1 }
            }
        },
        guthansnightmare: { 
            cost: 20000,
            requires: {
                gold: 20000,
                championLevels: { thamaron: 1 }
            }
        },
    }
};

// Champion Data
export const championsData = {
    champions: [
        { //1st champion
            id: "clickWarrior",
            name: "Cid the Clicker",
            baseCost: 5,
            baseDamage: 1,
            description: "A warrior who enhances your clicking power",
            image: "cid.png",
            unlocked: false,
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
            id: "warrior",
            name: "Warrior",
            baseCost: 50,
            baseDPS: 5,
            description: "A basic melee fighter",
            image: "warrior.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Sharp Blade", effect: "DPS x2", cost: 500 },
                { level: 25, name: "Combat Training", effect: "DPS x2", cost: 1250 },
                { level: 50, name: "Warrior's Spirit", effect: "DPS x2", cost: 5000 }
            ]
        },
        { //3rd champion
            id: "archer",
            name: "Ranger",
            baseCost: 250,
            baseDPS: 22,
            description: "Attacks from range with a bow",
            image: "ranger.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Precise Shot", effect: "DPS x2", cost: 10000 },
                { level: 25, name: "Rapid Fire", effect: "DPS x3", cost: 40000 },
                { level: 50, name: "Eagle Eye", effect: "DPS x5", cost: 200000 }
            ]
        },
        { //4th champion
            id: "mage",
            name: "Mage",
            baseCost: 1000,
            baseDPS: 74,
            description: "Casts powerful spells",
            image: "mage.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Arcane Focus", effect: "DPS x2", cost: 50000 },
                { level: 25, name: "Elemental Mastery", effect: "DPS x3", cost: 200000 },
                { level: 50, name: "Ancient Magic", effect: "DPS x5", cost: 1000000 }
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
            baseDPS: 967,
            description: "Your life… is mine!",
            image: "new_champion.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Upgrade 1", effect: "DPS x2", cost: 50000 },
                { level: 25, name: "Upgrade 2", effect: "DPS x3", cost: 200000 },
                { level: 50, name: "Upgrade 3", effect: "DPS x5", cost: 1000000 }
            ]
        },
    ]
};