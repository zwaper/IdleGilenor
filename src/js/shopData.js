import { calculateWeaponPrice } from './utils.js';

export const shopItems = {
    lumbridge: [
      {
        name: "Bronze Sword",
        price: calculateWeaponPrice(1),
        effect: { damage: 2 },
        type: "weapon",
        nextTier: {
            name: "Iron Sword",
            price: calculateWeaponPrice(2),
            effect: { damage: 5 },
            type: "weapon",
            nextTier: {
                name: "Steel Sword",
                price: calculateWeaponPrice(3),
                effect: { damage: 8 },
                type: "weapon",
                nextTier: {
                    name: "Black Sword",
                    price: calculateWeaponPrice(4),
                    effect: { damage: 12 },
                    type: "weapon",
                    nextTier: {
                        name: "Mithril Sword",
                        price: calculateWeaponPrice(5),
                        effect: { damage: 16 },
                        type: "weapon",
                        nextTier: {
                            name: "Adamant Sword",
                            price: calculateWeaponPrice(6),
                            effect: { damage: 21 },
                            type: "weapon",
                            nextTier: {
                                name: "Rune Sword",
                                price: calculateWeaponPrice(7),
                                effect: { damage: 27 },
                                type: "weapon",
                                nextTier: {
                                    name: "Dragon Sword",
                                    price: calculateWeaponPrice(8),
                                    effect: { damage: 34 },
                                    type: "weapon",
                                    nextTier: {
                                        name: "Barrows Sword",
                                        price: calculateWeaponPrice(9),
                                        effect: { damage: 42 },
                                        type: "weapon",
                                        nextTier: {
                                            name: "Godsword",
                                            price: calculateWeaponPrice(10),
                                            effect: { damage: 51 },
                                            type: "weapon",
                                            nextTier: {
                                                name: "Crystal Sword",
                                                price: calculateWeaponPrice(11),
                                                effect: { damage: 61 },
                                                type: "weapon",
                                                nextTier: {
                                                    name: "Elder Sword",
                                                    price: calculateWeaponPrice(12),
                                                    effect: { damage: 72 },
                                                    type: "weapon",
                                                    nextTier: {
                                                        name: "Infernal Sword",
                                                        price: calculateWeaponPrice(13),
                                                        effect: { damage: 85 },
                                                        type: "weapon",
                                                        nextTier: {
                                                            name: "Divine Sword",
                                                            price: calculateWeaponPrice(14),
                                                            effect: { damage: 99 },
                                                            type: "weapon",
                                                            nextTier: {
                                                                name: "Celestial Sword",
                                                                price: calculateWeaponPrice(15),
                                                                effect: { damage: 115 },
                                                                type: "weapon",
                                                                nextTier: {
                                                                    name: "Ethereal Sword",
                                                                    price: calculateWeaponPrice(16),
                                                                    effect: { damage: 133 },
                                                                    type: "weapon",
                                                                    // Add more tiers here with the new pricing formula
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
      },
      {
        name: "Lucky Charm",
        price: 300,
        effect: { luck: 0.2 },
        type: "luck",
        nextTier: {
          name: "Fortune Ring",
          price: 800,
          effect: { luck: 0.5 },
          type: "luck",
          nextTier: {
            name: "Blessed Amulet",
            price: 2000,
            effect: { luck: 1.0 },
            type: "luck",
          },
        },
      },
    ],
  };
  
  export const itemPrices = {
    // Common (C) tier items
    "Cowhide": 20,
    "Beef": 15,
    "Bones": 10,
    "Rotting Hide": 15,
    "Shiny Hide": 75,
    "Moon Beef": 200,
    "Cursed Hoof": 1500,
    "Rusty Sword": 50,
    "Ornate Bracelet": 300,
    "Chief's Helm": 1200,
    "Broken Chainmail": 85,
    "Brute Force Potion": 250,
  
    // Uncommon (B) tier items
    "Golden Hide": 100,
  
    // Rare (A) tier items
    "Cow Mask": 250,
    "Goblin Mail": 200,
    "Warlord's Helm": 500,
  
    // Super Rare (S) tier items
    "Cow Crown": 1000,
    "Giant's Ring": 2000,
  };