// filepath: i:\Github\IdleGilenor\src\js\zoneVariants.js

export const ZONE_VARIANTS = {
    cowpen: {
        "Pasture": {  // First zone name (levels 1-20)
            minLevel: 1,
            maxLevel: 20,
            variants: [
                {
                    name: "Cow",
                    baseHP: 30,
                    baseDamage: 2,
                    images: [
                        "cow.png",
                        "cow2.png",
                        "cow3.png",
                        "cow_brown.png",
                        "cow_spotted.png"
                    ],
                    weight: 100,    // Higher weight = more common
                    tier: "C",      // C, B, A, or S tier
                    dropTable: [
                        { item: "Cowhide", chance: 1/1, tier: "C" },    
                        { item: "Raw Beef", chance: 1/1, tier: "C" },         
                        { item: "Bones", chance: 1/1, tier: "C" },     
                    ]
                }
            ]
        },
        "Graveyard": {  // Levels 21-40
            minLevel: 21,
            maxLevel: 40,
            variants: [
                {
                    name: "Zombie Cow",
                    baseHP: 60,
                    baseDamage: 4,
                    image: "zombie_cow.png",
                    weight: 100,
                    tier: "B",
                    dropTable: [
                        { item: "Rotting Hide", chance: 0.8, tier: "C" },
                        { item: "Cursed Bones", chance: 0.3, tier: "A" }
                    ]
                },
                {
                    name: "Skeletal Cow",
                    baseHP: 45,
                    baseDamage: 6,
                    image: "skeletal_cow.png",
                    weight: 70,    // Less common than Zombie Cow
                    tier: "A",     // Higher tier
                    dropTable: [
                        { item: "Bone Fragments", chance: 0.7, tier: "B" },
                        { item: "Ancient Bones", chance: 0.2, tier: "A" }
                    ]
                }
            ]
        },
        "Celestial Plains": {
            minLevel: 41,
            maxLevel: 80,
            variants: [
                {
                    name: "Zanaris Cow",
                    baseHP: 100,
                    baseDamage: 8,
                    image: "zanaris_cow.png",
                    weight: 100,
                    tier: "A",
                    dropTable: [
                        { item: "Shiny Hide", chance: 0.5, tier: "B" },
                        { item: "Moon Beef", chance: 0.2, tier: "A" }
                    ]
                }
            ]
        },
        "Convergence": {
            minLevel: 81,
            maxLevel: Infinity,
            variants: [] // This will be populated with all previous variants
        }
    }
};