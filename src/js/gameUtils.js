// Game state objects
export let player = {
    gold: 0,
    damage: 1,
    inventory: [],
    prestigeLevel: 0,
    luck: 1.0,
    champions: {
        owned: {},
        totalDPS: 0
    },
    stats: {
        monstersKilled: 0,
        bossesKilled: 0,
        totalGoldEarned: 0
    },
    settings: {
        autoSave: true,
        notifications: true
    },
    upgrades: [],
    activeBuffs: {},
    collectionLog: []
};

export let currentRegion = "lumbridge";
export let currentZone = "cowpen";
export let isAutoProgressEnabled = false;

// Utility functions
export function formatNumber(num) {
    try {
        // For very small numbers, return 0
        if (num < 1) return '0';

        // For numbers less than 1 million, use regular formatting
        if (num < 1e6) {
            return num.toLocaleString();
        }

        // For numbers between 1 million and 1 trillion, use abbreviated format
        if (num < 1e12) {
            const suffixes = ['', 'K', 'M', 'B'];
            const magnitude = Math.floor(Math.log10(num) / 3);
            const scaled = num / Math.pow(1000, magnitude);
            return scaled.toFixed(2) + suffixes[magnitude];
        }

        // For very large numbers, use scientific notation
        const exponent = Math.floor(Math.log10(num));
        const mantissa = num / Math.pow(10, exponent);
        return `${mantissa.toFixed(2)}e${exponent}`;
    } catch (error) {
        console.error("Error formatting number:", error);
        return '0';
    }
}

export function formatLargeNumber(num) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    
    // If number is less than 1000, return it as is
    if (num < 1000) return num.toLocaleString();
    
    // Find the appropriate suffix
    const magnitude = Math.floor(Math.log10(num) / 3);
    
    if (magnitude >= suffixes.length) {
        // Use scientific notation for very large numbers
        return num.toExponential(2);
    } else {
        // Use suffix notation
        const scaled = num / Math.pow(1000, magnitude);
        return scaled.toFixed(2) + suffixes[magnitude];
    }
}

// Error handling
export const GameError = {
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        console.trace(error); // Always show trace in console
        showLoot(`Error: ${context}`, "error");
    },

    handleCriticalError(error, context) {
        console.error(`Critical error in ${context}:`, error);
        showLoot(`Critical Error: ${context}. Please refresh the game.`, "error");
        saveGame();
    }
};

// Placeholder functions that will be initialized later
export let showLoot = (message, type) => console.log(message);
export let saveGame = () => console.log("Save function not initialized");

// Function to initialize cross-file dependencies
export function initializeUtils(dependencies) {
    if (dependencies.showLoot) showLoot = dependencies.showLoot;
    if (dependencies.saveGame) saveGame = dependencies.saveGame;
}