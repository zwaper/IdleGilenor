// filepath: i:\Github\IdleGilenor\src\js\dropTables.js

export const DROP_TABLES = {
    // Lumbridge - Cow Pen
    cow: {
        normal: [
            { item: "Cowhide", chance: 1/1, tier: "C" },
            { item: "Raw Beef", chance: 1/1, tier: "C" },
            { item: "Bones", chance: 1/1, tier: "C" }
        ],
        zombie: [
            { item: "Rotting Hide", chance: 1/2, tier: "C" },
            { item: "Cursed Bones", chance: 1/4, tier: "A" }
        ],
        skeletal: [
            { item: "Bone Fragments", chance: 1/2, tier: "B" },
            { item: "Ancient Bones", chance: 1/5, tier: "A" }
        ],
        zanaris: [
            { item: "Shiny Hide", chance: 1/2, tier: "B" },
            { item: "Moon Beef", chance: 1/5, tier: "A" }
        ],
        miniBoss: [
            { item: "Golden Hide", chance: 1/1, tier: "B" },
            { item: "Cow Crown", chance: 1/50, tier: "S" }
        ],
        eliteBoss: [
            { item: "Elite Hide", chance: 1/1, tier: "S" },
            { item: "Elite Horn", chance: 1/2, tier: "S" },
            { item: "Elite Crown", chance: 1/4, tier: "S" }
        ]
    },

    // Lumbridge - Goblin Village
    goblin: {
        normal: [
            { item: "Bones", chance: 1/1, tier: "C" },
            { item: "Rusty Sword", chance: 1/3, tier: "B" }
        ],
        chief: [
            { item: "Ornate Bracelet", chance: 1/3, tier: "A" },
            { item: "Chief's Helm", chance: 1/10, tier: "S" }
        ],
        brute: [
            { item: "Broken Chainmail", chance: 1/2, tier: "B" },
            { item: "Brute Force Potion", chance: 1/5, tier: "A" }
        ]
    }
};