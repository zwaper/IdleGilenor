import { gameData } from './gameData.js';

export function updateZoneBackground(zoneId, currentRegion) {
    try {
        const sceneBackground = document.getElementById('scene-background');
        if (!sceneBackground) {
            console.error('Scene background element not found');
            return;
        }

        // Check if parameters are valid
        if (!zoneId || !currentRegion) {
            console.warn('Invalid parameters for updateZoneBackground:', { zoneId, currentRegion });
            // Use default values if parameters are missing
            zoneId = zoneId || 'cowpen';
            currentRegion = currentRegion || 'lumbridge';
        }

        // Check if gameData is properly initialized
        if (!gameData || !gameData.regions) {
            console.warn('Game data not initialized yet, deferring background update');
            // Retry after a short delay
            setTimeout(() => updateZoneBackground(zoneId, currentRegion), 500);
            return;
        }

        // Check if the region exists
        if (!gameData.regions[currentRegion]) {
            console.error(`Region "${currentRegion}" not found in game data`);
            // Fall back to lumbridge if the region doesn't exist
            currentRegion = 'lumbridge';
            // If lumbridge doesn't exist either, we can't continue
            if (!gameData.regions[currentRegion]) {
                return;
            }
        }

        // Check if zones exist for this region
        if (!gameData.regions[currentRegion].zones) {
            console.error(`No zones found for region "${currentRegion}"`);
            return;
        }

        // Check if the specific zone exists
        if (!gameData.regions[currentRegion].zones[zoneId]) {
            console.error(`Zone "${zoneId}" not found in region "${currentRegion}"`);
            // Fall back to cowpen if the zone doesn't exist
            zoneId = 'cowpen';
            // If cowpen doesn't exist either, we can't continue
            if (!gameData.regions[currentRegion].zones[zoneId]) {
                return;
            }
        }

        const zone = gameData.regions[currentRegion].zones[zoneId];
        const level = zone.currentLevel || 1;
        let newBackground;

        // Determine background based on zone and level range
        switch(zoneId) {
            case 'cowpen':
                if (level <= 20) {
                    newBackground = 'url("assets/backgrounds/cowpen_pasture.png")';
                } else if (level <= 40) {
                    newBackground = 'url("assets/backgrounds/cowpen_graveyard.png")';
                } else if (level <= 80) {
                    newBackground = 'url("assets/backgrounds/cowpen_celestial.png")';
                } else {
                    newBackground = 'url("assets/backgrounds/cowpen_convergence.png")';
                }
                break;

            case 'lumbridgeswamp':
                if (level <= 20) {
                    newBackground = 'url("assets/backgrounds/goblin_camp.png")';
                } else if (level <= 40) {
                    newBackground = 'url("assets/backgrounds/goblin_stronghold.png")';
                } else if (level <= 80) {
                    newBackground = 'url("assets/backgrounds/goblin_warchief.png")';
                } else {
                    newBackground = 'url("assets/backgrounds/goblin_city.png")';
                }
                break;

            case 'marketplace':
                if (level <= 20) {
                    newBackground = 'url("assets/backgrounds/market_district.png")';
                } else if (level <= 40) {
                    newBackground = 'url("assets/backgrounds/trade_quarter.png")';
                } else if (level <= 80) {
                    newBackground = 'url("assets/backgrounds/merchant_row.png")';
                } else {
                    newBackground = 'url("assets/backgrounds/grand_exchange.png")';
                }
                break;

            default:
                console.warn('Unknown zone ID:', zoneId);
                newBackground = 'url("assets/backgrounds/cowpen_pasture.png")';
        }
    
        // Set the background immediately
        sceneBackground.style.backgroundImage = newBackground;
        
        // Log to check if the background is being set
        console.log('Setting background:', newBackground);
    
    } catch (error) {
        console.error('Error updating zone background:', error);
    }
}

export function getMonsterVariantsForLevel(zone, level) {
    try {
        if (!zone || !zone.variants) {
            console.error('Invalid zone object or missing variants');
            return [];
        }

        const variants = zone.variants;
        let availableVariants = [];

        // Add proper variant logic for each zone
        switch (zone.name) {
            case "Cow Pen":
                if (level < 10) {
                    availableVariants = variants.filter(v => v.name === "Cow");
                } else if (level < 20) {
                    availableVariants = variants.filter(v => ["Cow", "Zanaris Cow"].includes(v.name));
                } else {
                    availableVariants = variants.filter(v => !v.level); // All non-boss variants
                }
                break;

            case "Goblin Village":
                if (level < 10) {
                    availableVariants = variants.filter(v => v.name === "Goblin");
                } else if (level < 20) {
                    availableVariants = variants.filter(v => ["Goblin", "Goblin Chief"].includes(v.name));
                } else {
                    availableVariants = variants.filter(v => !v.level);
                }
                break;

            case "Marketplace":
                if (level < 10) {
                    availableVariants = variants.filter(v => v.name === "Thief");
                } else if (level < 20) {
                    availableVariants = variants.filter(v => ["Thief", "Guard"].includes(v.name));
                } else if (level < 50) {
                    availableVariants = variants.filter(v => !v.name.includes("Master"));
                } else {
                    availableVariants = variants.filter(v => !v.level);
                }
                break;

            case "Slums":
                if (level < 10) {
                    availableVariants = variants.filter(v => v.name === "Street Rat");
                } else if (level < 20) {
                    availableVariants = variants.filter(v => ["Street Rat", "Gang Member"].includes(v.name));
                } else {
                    availableVariants = variants.filter(v => !v.level);
                }
                break;

            default:
                // Default case when zone name is unknown
                availableVariants = variants;
        }

        return availableVariants.length > 0 ? availableVariants : variants;
    } catch (error) {
        console.error('Error in getMonsterVariantsForLevel:', error);
        return [];
    }
}

export function getZoneTitleForLevel(zoneName, level) {
    const tier = Math.floor((level - 1) / 20);
    const zoneNames = {
        cowpen: [
            "Pasture",           // Levels 1-20
            "Graveyard",         // Levels 21-40
            "Celestial Plains",  // Levels 41-80
            "Convergence"        // Levels 81+
        ],
        lumbridgeswamp: [
            "Goblin Camp",       // Levels 1-20
            "Goblin Stronghold", // Levels 21-40
            "War-Chief's Domain",// Levels 41-80
            "Goblin City"        // Levels 81+
        ],
        marketplace: [
            "Market District",   // Levels 1-20
            "Trade Quarter",     // Levels 21-40
            "Merchant's Row",    // Levels 41-80
            "Grand Exchange"     // Levels 81+
        ],
        slums: [
            "Lower Slums",       // Levels 1-20
            "Dark Alley",        // Levels 21-40
            "Shadow District",   // Levels 41-80
            "Thieves' Den"       // Levels 81+
        ]
    };

    const names = zoneNames[zoneName] || [zoneName];
    return names[Math.min(tier, names.length - 1)];
}