import { DROP_TABLES } from './dropTables.js';

export const gameData = {
    regions: {
        lumbridge: {
            name: "Lumbridge",
            unlocked: true,
            miniBossesDefeated: 0,
            bossDefeated: false,
            zones: {
                cowpen: {
                    name: "Cow Pen",
                    currentLevel: 1,
                    highestLevel: 1,
                    completedLevels: [],
                    monstersPerLevel: 10,
                    currentKills: 0,
                    monster: null,
                    requiredForUnlock: null, // No requirements for starting zone
                    variants: [
                        {
                            name: "Cow", // Levels 1-9
                            baseHP: 30,
                            baseDamage: 2,
                            images: [
                                "/monsters/cow/pasture/cow.png",
                                "/monsters/cow/pasture/cow-1.png",
                                "/monsters/cow/pasture/cow-2.png",
                                "/monsters/cow/pasture/cow-3.png"
                            ],
                            weight: 100,
                            tier: "C",
                            dropTable: DROP_TABLES.cow.normal
                        },
                        {
                            name: "Zanaris Cow", // Unlocks at level 10-19
                            baseHP: 45,
                            baseDamage: 3,
                            image: "/monsters/cow/pasture/cow-1.png",
                            weight: 70,
                            tier: "B",
                            dropTable: DROP_TABLES.cow.zanaris
                        },
                        {
                            name: "Zombie Cow", // Unlocks at level 20+
                            baseHP: 60,
                            baseDamage: 4,
                            image: "/monsters/cow/pasture/cow-1.png",
                            weight: 50,
                            tier: "A",
                            dropTable: DROP_TABLES.cow.zombie
                        },
                        {
                            name: "Elite Cow", // Level 100 Boss
                            baseHP: 5000,
                            baseDamage: 50,
                            images: [
                                "elite_cow1.png",
                                "elite_cow2.png",
                                "elite_cow_gold.png"
                            ],
                            weight: 0, // Weight 0 means it won't spawn randomly
                            tier: "S",
                            level: 100, // Required level
                            timeLimit: 120,
                            dropTable: DROP_TABLES.cow.eliteBoss
                        },
                    ],
                    miniBoss: {
                        name: "Cow King",
                        hp: 500,
                        maxHP: 500,
                        image: "cow_king.png",
                        timeLimit: 30,
                        dropTable: DROP_TABLES.cow.miniBoss,
                        unlocked: false,
                    },
                },
                lumbridgeswamp: {
                    name: "Lumbridge Swamp",
                    currentLevel: 1,
                    highestLevel: 1,
                    completedLevels: [],
                    monstersPerLevel: 10,
                    currentKills: 0,
                    monster: null,
                    unlocked: false,  // Start locked
                    requiredForUnlock: {
                        zone: 'cowpen',
                        level: 50    // Requires level 50 in cowpen to unlock
                    },
                    variants: [
                        {
                            name: "Goblin", // Levels 1-9
                            baseHP: 25,
                            baseDamage: 3,
                            image: "goblin.png",
                            weight: 100,
                            tier: "C",
                            dropTable: DROP_TABLES.goblin.normal
                        },
                        {
                            name: "Goblin Chief", // Unlocks at level 10-19
                            baseHP: 40,
                            baseDamage: 5,
                            image: "goblin_chief.png",
                            weight: 70,
                            tier: "B",
                            dropTable: DROP_TABLES.goblin.chief
                        },
                        {
                            name: "Goblin Brute", // Unlocks at level 20+
                            baseHP: 55,
                            baseDamage: 7,
                            image: "goblin_brute.png",
                            weight: 50,
                            tier: "A",
                            dropTable: DROP_TABLES.goblin.brute
                        },
                    ],
                    miniBoss: {
                        name: "Goblin Warlord",
                        hp: 800,
                        maxHP: 800,
                        image: "goblin_warlord.png",
                        timeLimit: 30,
                        dropTable: DROP_TABLES.goblin.miniBoss,
                        unlocked: false,
                    },
                },
            },
            regionBoss: {
                name: "Lumbridge Giant",
                hp: 2000,
                maxHP: 2000,
                image: "giant.png",
                timeLimit: 120,
                dropTable: DROP_TABLES.lumbridgeBoss,
            },
        },
        varrock: {
            name: "Varrock",
            unlocked: false,
            miniBossesDefeated: 0,
            bossDefeated: false,
            zones: {
                marketplace: {
                    name: "Marketplace",
                    currentLevel: 1,
                    highestLevel: 1,
                    completedLevels: [],
                    monstersPerLevel: 10,
                    currentKills: 0,
                    monster: null,
                    variants: [
                        {
                            name: "Thief", // Levels 1-10
                            baseHP: 75,     // Higher base stats than Lumbridge
                            baseDamage: 5,
                            images: ["thief1.png", "thief2.png", "thief3.png"],
                            weight: 100,
                            tier: "C",
                            dropTable: [
                                { item: "Stolen Valuables", chance: 0.7, tier: "C" },
                                { item: "Lockpick", chance: 0.3, tier: "C" }
                            ]
                        },
                        {
                            name: "Guard", // Levels 11-20
                            baseHP: 120,
                            baseDamage: 8,
                            image: "guard.png",
                            weight: 70,
                            tier: "B",
                            dropTable: [
                                { item: "Guard Badge", chance: 0.5, tier: "B" },
                                { item: "Steel Sword", chance: 0.2, tier: "A" }
                            ]
                        },
                        {
                            name: "Elite Guard", // Levels 21+
                            baseHP: 200,
                            baseDamage: 12,
                            image: "elite_guard.png",
                            weight: 50,
                            tier: "A",
                            dropTable: [
                                { item: "Elite Badge", chance: 0.4, tier: "A" },
                                { item: "Guard Captain's Sword", chance: 0.1, tier: "S" }
                            ]
                        },
                        {
                            name: "Master Assassin", // Special variant for levels 50+
                            baseHP: 500,
                            baseDamage: 25,
                            image: "master_assassin.png",
                            weight: 30,
                            tier: "S",
                            dropTable: [
                                { item: "Assassin's Blade", chance: 0.3, tier: "S" },
                                { item: "Shadow Cape", chance: 0.1, tier: "S" }
                            ]
                        }
                    ],
                    miniBoss: {
                        name: "Master Thief",
                        hp: 2500,  // Increased from 1000
                        maxHP: 2500,
                        damage: 25,  // Increased from 10
                        image: "master_thief.png",
                        timeLimit: 60,
                        dropTable: [
                            { item: "Thief's Cape", chance: 1, tier: "A" },
                            { item: "Master's Lockpick", chance: 0.2, tier: "S" }
                        ],
                        unlocked: false
                    }
                },
                slums: {  // New zone
                    name: "Slums",
                    currentLevel: 1,
                    highestLevel: 1,
                    completedLevels: [],
                    monstersPerLevel: 10,
                    currentKills: 0,
                    monster: null,
                    variants: [
                        {
                            name: "Street Rat", // Levels 1-10
                            baseHP: 85,
                            baseDamage: 6,
                            image: "street_rat.png",
                            weight: 100,
                            tier: "C",
                            dropTable: [
                                { item: "Rusty Dagger", chance: 0.6, tier: "C" },
                                { item: "Tattered Clothes", chance: 0.4, tier: "C" }
                            ]
                        },
                        {
                            name: "Gang Member", // Levels 11-20
                            baseHP: 140,
                            baseDamage: 9,
                            image: "gang_member.png",
                            weight: 70,
                            tier: "B",
                            dropTable: [
                                { item: "Gang Insignia", chance: 0.5, tier: "B" },
                                { item: "Black Market Map", chance: 0.2, tier: "A" }
                            ]
                        },
                        {
                            name: "Gang Leader", // Levels 21+
                            baseHP: 250,
                            baseDamage: 15,
                            image: "gang_leader.png",
                            weight: 50,
                            tier: "A",
                            dropTable: [
                                { item: "Leader's Ring", chance: 0.3, tier: "A" },
                                { item: "Black Market Key", chance: 0.1, tier: "S" }
                            ]
                        }
                    ],
                    miniBoss: {
                        name: "Crime Lord",
                        hp: 3000,
                        maxHP: 3000,
                        damage: 30,
                        image: "crime_lord.png",
                        timeLimit: 60,
                        dropTable: [
                            { item: "Lord's Signet", chance: 1, tier: "S" },
                            { item: "Black Market Access", chance: 0.15, tier: "S" }
                        ],
                        unlocked: false
                    }
                }
            },
            regionBoss: {
                name: "Varrock Guard Captain",
                hp: 5000,    // Increased from 2500
                maxHP: 5000,
                damage: 50,  // Added damage stat
                image: "guard_captain.png",
                timeLimit: 120,
                dropTable: [
                    { item: "Captain's Badge", chance: 1, tier: "S" },
                    { item: "Captain's Sword", chance: 0.5, tier: "S" },
                    { item: "Guard Captain's Armor", chance: 0.25, tier: "S" }
                ]
            }
        },
    },
};