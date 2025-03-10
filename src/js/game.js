// filepath: i:\Github\IdleGilenor\src\js\game.js
import { CHAMPION_CONFIG, championsData } from './champions.js';
import { DROP_TABLES } from './dropTables.js';
import { gameData } from './gameData.js';
import { ZONE_VARIANTS } from './zoneVariants.js';
import { getItemData } from './itemData.js';
import { shopItems, itemPrices } from './shopData.js';
import { updateZoneBackground, getMonsterVariantsForLevel, getZoneTitleForLevel } from './zoneUtils.js';
import { calculateWeaponPrice } from './utils.js';
import { saveSystem } from './saveSystem.js';

const DOMCache = {
    elements: new Map(),

    get(selector) {
        if (!this.elements.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.elements.set(selector, element);
            }
        }
        return this.elements.get(selector);
    },

    invalidate(selector) {
        this.elements.delete(selector);
    },

    clear() {
        this.elements.clear();
    }
};

function initDOMCache() {
    const selectors = [
        '#loot-feed',
        '#zone-name',
        '#zone-level',
        '#monster-name',
        '#monster-sprite',
        '#health-bar',
        '#health-text',
        '.progress-container',
        '.progress-fill',
        '.progress-label span:last-child',
        '#stat-gold',
        '#stat-damage',
        '#stat-luck',
        '#stat-prestige',
        '#stat-monsters',
        '#stat-bosses',
        '#region-boss-btn',
        '#boss-timer',
        '#prestige-btn',
        '.inventory-grid',
        '.sell-buttons',
        '.left-panel',
        '.right-panel',
        '.zone-tabs',
        '#scene-background',
        '#modal-container',
        '#auto-progress',
        '#version-btn',
        '#hard-reset-btn',
        '.level-select',
        '#prev-levels',
        '#next-levels',
        '.shop-items-container',
        '.collection-log',
        '.collection-category-selector',
        '.collection-subcategory-container',
        '.zone-selector',
        '.zone-content',
        '.tooltip',
        '.monster-container',
        '.nav-btn',
        '#attack-button'
    ];

    selectors.forEach(selector => DOMCache.get(selector));
}

// Game Constants
const GAME_CONFIG = {
    VERSION: {
        NUMBER: "0.6.6",
        NAME: "UI Enhancement Update",
        CHANGELOG: [
            "Fixed champion tooltip visibility issues:",
            "Made tooltips use fixed positioning with z-index: 9999",
            "Ensured tooltips appear above all other elements",
            "Fixed tooltip arrows and positioning",
            "Added Champions pause functionality:",
            "Added a new settings toggle to pause/resume champion DPS",
            "Added visual feedback when pausing/resuming",
            "Fixed scrolling in Champions panel:",
            "Restored proper scrollbar functionality while maintaining tooltip visibility",
            "Save system improvements:",
            "Enhanced save data structure and validation",
            "Improved error handling for save/load operations"
        ]
    },
    AUTO_PROGRESS: {
        DELAY: 1000,
        ENABLED: false
    },
  COMBAT: {
      MINIBOSS_BASE_MULTIPLIER: 5,
      MINIBOSS_LEVEL_MULTIPLIER: 1.5,
      MINIBOSS_LEVEL_INTERVAL: 10,
      ELITE_BOSS_INTERVAL: 100,
      MINI_BOSS_TIME_LIMIT: 30000
  },
  INVENTORY: {
      CAPACITY: 28,
      LEVELS_PER_PAGE: 5
  },
  SAVE: {
    AUTOSAVE_INTERVAL: 30000, // 30 seconds in milliseconds
    BACKUP_COUNT: 3 // Number of backup saves to keep
},
  UI: {
      TOOLTIP_DELAY: 100,
      FADE_DURATION: 150
  },
   // Add this new section
   REGIONS: {
    lumbridge: {
        name: "Lumbridge",
        levelCap: 100,
        description: "A beginner-friendly region capped at level 100"
    },
    varrock: {
        name: "Varrock",
        levelCap: 250,
        description: "A more challenging region capped at level 250"
    },
    falador: {
        name: "Falador",
        levelCap: 500,
        description: "An advanced region with powerful monsters"
    },
    wilderness: {
        name: "Wilderness",
        levelCap: Infinity,
        description: "The ultimate challenge with unlimited progression"
    }
    },
};

const ACHIEVEMENTS = [
    // Combat Achievements
    {
        id: "firstKill",
        name: "First Blood",
        description: "Kill your first monster",
        criteria: () => player.stats.monstersKilled >= 1,
        unlocked: false,
        category: "Combat",
        reward: { gold: 100 }
    },
    {
        id: "hundredKills",
        name: "Monster Hunter",
        description: "Kill 100 monsters",
        criteria: () => player.stats.monstersKilled >= 100,
        unlocked: false,
        category: "Combat",
        reward: { gold: 1000 }
    },
    {
        id: "thousandKills",
        name: "Monster Slayer",
        description: "Kill 1,000 monsters",
        criteria: () => player.stats.monstersKilled >= 1000,
        unlocked: false,
        category: "Combat",
        reward: { gold: 10000 }
    },
    // Boss Achievements
    {
        id: "firstBossKill",
        name: "Boss Slayer",
        description: "Defeat your first boss",
        criteria: () => player.stats.bossesKilled >= 1,
        unlocked: false,
        category: "Bosses",
        reward: { gold: 500 }
    },
    {
        id: "tenBossKills",
        name: "Boss Hunter",
        description: "Defeat 10 bosses",
        criteria: () => player.stats.bossesKilled >= 10,
        unlocked: false,
        category: "Bosses",
        reward: { gold: 5000 }
    },
    // Wealth Achievements
    {
        id: "thousandGold",
        name: "Gold Hoarder",
        description: "Earn 1,000 gold",
        criteria: () => player.stats.totalGoldEarned >= 1000,
        unlocked: false,
        category: "Wealth",
        reward: { gold: 100 }
    },
    {
        id: "millionGold",
        name: "Millionaire",
        description: "Earn 1,000,000 gold",
        criteria: () => player.stats.totalGoldEarned >= 1000000,
        unlocked: false,
        category: "Wealth",
        reward: { gold: 100000 }
    },
    {
        id: "unlockLumbridgeSwamp",
        name: "Goblin Slayer",
        description: "Unlock the Goblin Village by reaching level 50 in Cow Pen",
        criteria: () => {
            const cowpen = gameData.regions.lumbridge.zones.cowpen;
            const lumbridgeswamp = gameData.regions.lumbridge.zones.lumbridgeswamp;
            return lumbridgeswamp.unlocked && cowpen.currentLevel >= 50;
        },
        unlocked: false,
        category: "Zones",
        reward: { gold: 5000 }
    },
];

function checkAchievements() {
    let achievementUnlocked = false;
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievement.unlocked && achievement.criteria()) {
            achievement.unlocked = true;
            // Give rewards
            if (achievement.reward) {
                if (achievement.reward.gold) {
                    player.gold += achievement.reward.gold;
                    showLoot(`🎉 Achievement Unlocked: ${achievement.name}! (+${achievement.reward.gold} gold)`, "S");
                }
            } else {
                showLoot(`🎉 Achievement Unlocked: ${achievement.name}!`, "S");
            }
            achievementUnlocked = true;
        }
    });

    if (achievementUnlocked) {
        renderAchievements();
        saveGame();
    }
}

function handleGoldEarned(amount) {
    awardGold(goldEarned);
    checkAchievements(); // Add this line
    updateUI();
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.osrs-panel');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(`${tabId}-panel`).style.display = 'block';

    const tabButtons = document.querySelectorAll('.osrs-interface-tab');
    tabButtons.forEach(button => button.classList.remove('active'));
    document.querySelector(`.osrs-interface-tab[data-panel="${tabId}"]`).classList.add('active');

    if (tabId === 'achievements') {
        renderAchievements();
    }
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    // Group achievements by category
    const categories = {};
    ACHIEVEMENTS.forEach(achievement => {
        if (!categories[achievement.category]) {
            categories[achievement.category] = [];
        }
        categories[achievement.category].push(achievement);
    });

    container.innerHTML = `
        ${Object.entries(categories).map(([category, achievements]) => `
            <div class="collection-category">
                <div class="category-header">
                    <h3>${category}</h3>
                    <div class="completion-badge">
                        ${achievements.filter(a => a.unlocked).length}/${achievements.length}
                    </div>
                </div>
                <div class="collection-grid">
                    ${achievements.map(achievement => `
                        <div class="achievement-slot ${achievement.unlocked ? 'unlocked' : 'locked'}"
                             onmouseenter="showAchievementTooltip(event, '${achievement.id}')"
                             onmouseleave="hideItemTooltip()">
                            <div class="achievement-icon">
                                <img src="assets/achievements/${achievement.category.toLowerCase()}.png" 
                                     alt="${achievement.name}"
                                     class="achievement-img">
                                ${achievement.unlocked ? '<div class="complete-overlay">✓</div>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

// Add this function to show version info
function showVersionInfo() {
    try {
        const modalContainer = document.getElementById("modal-container");
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal version-modal">
                <div class="modal-content">
                    <h2>IdleGielinor v${GAME_CONFIG.VERSION.NUMBER}</h2>
                    <h3>${GAME_CONFIG.VERSION.NAME}</h3>
                    <div class="changelog">
                        <h4>Latest Changes:</h4>
                        <ul>
                            ${GAME_CONFIG.VERSION.CHANGELOG.map(change => 
                                `<li>${change}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <button class="osrs-button" onclick="closeModal()">Close</button>
                </div>
            </div>
        `;

        modalContainer.style.display = "flex";
    } catch (error) {
        console.error("Error showing version info:", error);
    }
}

function positionTooltip(event, tooltip) {
    try {
        if (!tooltip) return;

        // Get initial position
        const rect = event.target.getBoundingClientRect();
        let left = rect.right + 10;
        let top = rect.top;

        // Get tooltip dimensions
        const tooltipRect = tooltip.getBoundingClientRect();

        // Adjust position if tooltip would go off screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = rect.left - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > window.innerHeight) {
            top = window.innerHeight - tooltipRect.height - 10;
        }

        // Ensure tooltip doesn't go off the left or top of the screen
        left = Math.max(10, left);
        top = Math.max(10, top);

        // Apply position
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
        tooltip.style.opacity = '1';
    } catch (error) {
        console.error('Error positioning tooltip:', error);
    }
}

// Update showAchievementTooltip to use the progress tracking
function showAchievementTooltip(event, achievementId) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;

    // Get progress for the achievement
    let progress = '';
    switch(achievement.id) {
        case 'firstKill':
            progress = `${Math.min(player.stats.monstersKilled, 1)}/1`;
            break;
        case 'hundredKills':
            progress = `${Math.min(player.stats.monstersKilled, 100)}/100`;
            break;
        case 'thousandKills':
            progress = `${Math.min(player.stats.monstersKilled, 1000)}/1,000`;
            break;
        case 'firstBossKill':
            progress = `${Math.min(player.stats.bossesKilled, 1)}/1`;
            break;
        case 'tenBossKills':
            progress = `${Math.min(player.stats.bossesKilled, 10)}/10`;
            break;
        case 'thousandGold':
            progress = `${Math.min(player.stats.totalGoldEarned, 1000)}/1,000`;
            break;
        case 'millionGold':
            progress = `${Math.min(player.stats.totalGoldEarned, 1000000)}/1,000,000`;
            break;
        case "unlockLumbridgeSwamp":
            const cowpen = gameData.regions.lumbridge.zones.cowpen;
            progress = `Level ${cowpen.currentLevel}/50 in Cow Pen`;
                break;
        default:
            progress = achievement.unlocked ? 'Complete' : 'Incomplete';
    }

    tooltip.innerHTML = `
        <div class="tooltip-header ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <span class="tooltip-name">${achievement.name}</span>
            <span class="tooltip-status">${achievement.unlocked ? '🏆' : '🔒'}</span>
        </div>
        <div class="tooltip-body">
            <p>${achievement.description}</p>
            <div class="tooltip-progress">
                Progress: ${progress}
            </div>
            ${achievement.reward ? `
                <div class="tooltip-reward">
                    <span class="reward-label">Reward:</span>
                    <span class="reward-text">${formatReward(achievement.reward)}</span>
                </div>
            ` : ''}
            ${achievement.unlocked ? '<div class="completion-text">✓ Completed!</div>' : ''}
        </div>
    `;

    positionTooltip(event, tooltip);
}

function getAchievementRequirementText(achievement) {
    switch(achievement.id) {
        case 'firstKill':
            return 'Kill 1 monster';
        case 'hundredKills':
            return `Kill 100 monsters (${Math.min(player.stats.monstersKilled, 100)}/100)`;
        case 'thousandKills':
            return `Kill 1,000 monsters (${Math.min(player.stats.monstersKilled, 1000)}/1,000)`;
        // Add more cases for other achievements
        default:
            return achievement.description;
    }
}

function formatReward(reward) {
    if (reward.gold) {
        return `${reward.gold.toLocaleString()} gold`;
    }
    return 'No reward';
}

let currentRegion = "lumbridge";
let currentZone = "cowpen";

// Call renderAchievements when the game initializes
document.addEventListener('DOMContentLoaded', () => {
    // Initialize player object first
    if (!window.player) {
        window.player = {
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
            upgrades: [],  // Explicitly initialize upgrades as an array
            collectionLog: [], // Explicitly initialize collection log as an array
            selectedSellAmount: 1
        };
    }

    // Make sure championsData is available globally
    if (!window.championsData) {
        console.error("Champions data not available! Check import statements.");
        // Create fallback object to prevent errors
        window.championsData = { champions: [] };
    }

    initGame();
    initializeSaveSystem();
    initializeAutoSave();
    initializeSettings();
    validatePlayerObject();
    initializeMapControls();
    updateZoneBackground(currentZone, currentRegion);
    renderAchievements();
    initializeCombatListeners();
    validateZoneData();
    
    // Only initialize champions if the data is available
    if (window.championsData && window.championsData.champions) {
        renderChampionsPanel();
        initializeChampions();
    } else {
        console.error("Could not initialize champions - data missing");
    }
    
    updateUI();

        // Start the damage loop
        animationFrameId = requestAnimationFrame(applyDamageLoop);

    const autoProgressBtn = document.getElementById('auto-progress');
    if (autoProgressBtn) {
        autoProgressBtn.addEventListener('click', toggleAutoProgress);
    }
});

let tooltipTimeout = null;
let isAutoProgressEnabled = true;

// Game State
if (!window.player) {
    window.player = {
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
        combat: {
            totalDamageDealt: 0,
            highestDamage: 0,
            criticalHits: 0,
            longestCombo: 0
        },
        monsters: {
            killed: 0,
            bossesKilled: 0,
            elitesKilled: 0,
            highestLevel: 0
        },
        progression: {
            highestZoneLevel: 0,
            zonesUnlocked: 0,
            regionsUnlocked: 1
        },
        loot: {
            totalGoldEarned: 0,
            itemsCollected: 0,
            totalItemsAvailable: 0,
            rarityFound: {
                C: 0,
                B: 0,
                A: 0,
                S: 0
            }
        },
        achievements: {
            completed: 0,
            total: ACHIEVEMENTS.length
        }
    },
    settings: {
        autoSave: true,
        notifications: true
    }
};
}

function validatePlayerObject() {
    // Initialize critical arrays if they don't exist
    if (!Array.isArray(player.upgrades)) player.upgrades = [];
    if (!Array.isArray(player.inventory)) player.inventory = [];
    if (!Array.isArray(player.collectionLog)) player.collectionLog = [];
    
    // Ensure champions structure exists
    if (!player.champions) {
        player.champions = { owned: {}, totalDPS: 0 };
    } else if (!player.champions.owned) {
        player.champions.owned = {};
    }
    
    // Ensure stats object exists with correct properties
    if (!player.stats) {
        player.stats = { monstersKilled: 0, bossesKilled: 0, totalGoldEarned: 0 };
    }
    
    // Ensure settings exist
    if (!player.settings) {
        player.settings = { autoSave: true, notifications: true };
    }
    
    // Ensure selectedSellAmount has a value
    if (player.selectedSellAmount === undefined) {
        player.selectedSellAmount = 1;
    }
    
    // Ensure selectedBuyAmount has a value
    if (player.selectedBuyAmount === undefined) {
        player.selectedBuyAmount = '1';
    }
}

function toggleAutoProgress() {
    try {
        isAutoProgressEnabled = !isAutoProgressEnabled;
        
        // Update button appearance
        const button = document.getElementById('auto-progress');
        if (button) {
            button.classList.toggle('active', isAutoProgressEnabled);
            button.querySelector('.auto-icon').textContent = isAutoProgressEnabled ? '⏸️' : '▶️';
            button.querySelector('.status-text').textContent = 
                isAutoProgressEnabled ? 'Pause Progress' : 'Auto-Progress';
        }

        // Handle current zone state when toggling
        const zone = gameData.regions[currentRegion].zones[currentZone];
        if (zone && zone.currentKills >= zone.monstersPerLevel && isAutoProgressEnabled) {
            const nextLevel = zone.currentLevel + 1;
            const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
            
            if (nextLevel <= regionCap && (nextLevel <= zone.highestLevel || nextLevel <= regionCap)) {
                setTimeout(() => selectLevel(nextLevel), GAME_CONFIG.AUTO_PROGRESS.DELAY);
            }
        }
        
        showLoot(`Auto-Progress ${isAutoProgressEnabled ? 'Enabled' : 'Disabled'}`, 'info');
        saveGame();

    } catch (error) {
        console.error("Error toggling auto-progress:", error);
        showLoot("Error toggling auto-progress", "error");
    }
}

const REGION_DIFFICULTY_MULTIPLIERS = {
    lumbridge: 1.0,  // Base difficulty
    varrock: 2.5,    // 2.5x harder than Lumbridge
    // Future regions can scale up from here
    // falador: 4.0,
    // ardougne: 6.0,
};

const varrockItems = {
    "Guard Badge": {
        tier: "B",
        value: 0, // Will be calculated dynamically
        description: "A badge worn by Varrock guards",
        image: "guard_badge.png"
    },
    "Steel Sword": {
        tier: "A",
        value: 0,
        description: "A well-crafted steel sword",
        image: "steel_sword.png"
    },
    "Elite Badge": {
        tier: "A",
        value: 0,
        description: "A badge of the elite guard",
        image: "elite_badge.png"
    },
    "Guard Captain's Sword": {
        tier: "S",
        value: 0,
        description: "A powerful sword used by the Guard Captain",
        image: "captain_sword.png"
    }
};

function checkZoneUnlocks(currentZone) {
    try {
        // Ensure cowpen is always unlocked
        gameData.regions.lumbridge.zones.cowpen.unlocked = true;

        Object.entries(gameData.regions[currentRegion].zones).forEach(([zoneId, zoneData]) => {
            // Skip cowpen as it's always unlocked
            if (zoneId === 'cowpen') return;

            // Check unlock requirements
            if (zoneData.requiredForUnlock) {
                const reqZone = gameData.regions[currentRegion].zones[zoneData.requiredForUnlock.zone];
                if (reqZone) {
                    // If zone is unlocked once, keep it unlocked
                    if (!zoneData.unlocked && reqZone.currentLevel >= zoneData.requiredForUnlock.level) {
                        zoneData.unlocked = true;
                        showLoot(`🎉 Unlocked ${zoneData.name}!`, "S");
                    }
                }
            }
        });

        // Save unlocked state
        saveGame();
        renderZoneTabs();

    } catch (error) {
        console.error("Error checking zone unlocks:", error);
    }
}

function calculateChampionBonus(champion, level) {
    try {
        if (!champion || level < 0) return 0;

        if (champion.id === "worldguardian") {
            let clickBonus = 1; // Start with base damage of 1
            
            // Add 1 damage per level
            clickBonus += level;
            
            // Only apply upgrade multipliers if they've been purchased
            champion.upgrades.forEach(upgrade => {
                // Check if upgrade is both unlocked by level AND purchased
                if (level >= upgrade.level && upgrade.purchased) {
                    const multiplier = parseInt(upgrade.effect.split('x')[1]);
                    if (!isNaN(multiplier)) {
                        clickBonus *= multiplier;
                    }
                }
            });
            
            return Math.max(1, Math.floor(clickBonus));
        } else {
            // Regular DPS calculation for other champions
            let dps = champion.baseDPS * Math.pow(CHAMPION_CONFIG.DPS_MULTIPLIER, level - 1);
            
            // Only apply upgrade multipliers if they've been purchased
            champion.upgrades.forEach(upgrade => {
                if (level >= upgrade.level && upgrade.purchased) {
                    const multiplier = parseInt(upgrade.effect.split('x')[1]);
                    if (!isNaN(multiplier)) {
                        dps *= multiplier;
                    }
                }
            });
            
            return Math.max(1, Math.floor(dps));
        }
    } catch (error) {
        console.error("Error calculating champion bonus:", error);
        return 1;
    }
}

function calculateChampionBonusMultiplier(level) {
    try {
        let multiplier = 1;

        // Apply 4x multiplier every 25 levels from 200 onwards
        if (level >= 200) {
            const bonusTiers = Math.floor((level - 200) / 25);
            multiplier *= Math.pow(4, bonusTiers);
        }

        // Apply 10x multiplier every 1000 levels until 8000
        if (level >= 1000 && level <= 8000) {
            const majorBonusTiers = Math.floor((Math.min(level, 8000) - 1000) / 1000);
            multiplier *= Math.pow(10, majorBonusTiers);
        }

        return multiplier;
    } catch (error) {
        console.error("Error calculating champion bonus multiplier:", error);
        return 1;
    }
}

function calculateChampionCost(champion, level) {
    try {
        const baseCost = champion.baseCost;
        return Math.floor(baseCost * Math.pow(CHAMPION_CONFIG.COST_MULTIPLIER, level - 1));
    } catch (error) {
        console.error("Error calculating champion cost:", error);
        return champion.baseCost;
    }
}

function calculateChampionDPS(champion, level) {
    try {
        if (!champion || level <= 0) return 0;
        if (!player.champions.owned[champion.id]) return 0;

        // Determine if champion is among first 8
        const isFirstEightChampions = championsData.champions.indexOf(champion) < 8;

        // Start with base DPS
        let dps = champion.baseDPS;

        if (isFirstEightChampions) {
            // Linear scaling for first 8 champions
            // Formula: DPS(n) = DPS0 + (n-1) * DPS0
            // where DPS0 is base DPS and n is champion level
            dps = champion.baseDPS + (level - 1) * champion.baseDPS;
        } else {
            // Later champions use exponential scaling
            dps *= Math.pow(CHAMPION_CONFIG.DPS_MULTIPLIER * 1.5, level - 1);
        }

        // Apply special multipliers for high levels
        dps *= calculateChampionBonusMultiplier(level);

        // Apply upgrade multipliers
        let upgradeMultiplier = 1;
        const purchasedUpgrades = player.champions.owned[champion.id].upgrades || [];
        
        champion.upgrades.forEach(upgrade => {
            if (purchasedUpgrades.includes(upgrade.name)) {
                const multiplier = parseFloat(upgrade.effect.replace(/DPS x([0-9.]+)/, '$1'));
                if (!isNaN(multiplier)) {
                    upgradeMultiplier *= multiplier;
                }
            }
        });
        dps *= upgradeMultiplier;

        // Apply region difficulty bonus
        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion] || 1;
        dps *= regionMultiplier;

        return Math.floor(Math.max(0, dps));

    } catch (error) {
        console.error("Error calculating champion DPS:", error);
        return 0;
    }
}

function buyChampion(championId) {
    try {
        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion || !champion.unlocked) return;

        // Initialize champion data if not owned
        if (!player.champions.owned[championId]) {
            player.champions.owned[championId] = {
                level: 0,
                currentDPS: 0,
                clickDamageBonus: 0
            };
        }

        const nextLevel = player.champions.owned[championId].level + 1;
        const cost = calculateChampionCost(champion, nextLevel);

        if (player.gold >= cost) {
            // First deduct gold
            player.gold -= cost;
            
            // Then update level
            player.champions.owned[championId].level = nextLevel;

            // Calculate and apply bonuses AFTER level increase
            if (champion.id === "worldguardian") {
                const bonus = calculateChampionBonus(champion, nextLevel);
                player.champions.owned[championId].clickDamageBonus = bonus;
                player.damage = bonus; // Update player damage
            } else {
                const dps = calculateChampionDPS(champion, nextLevel);
                player.champions.owned[championId].currentDPS = dps;
            }
            
            updateTotalChampionDPS();
            
            // Check for upgrades
            const newUpgrade = champion.upgrades.find(u => u.level === nextLevel);
            if (newUpgrade) {
                showLoot(`${champion.name} unlocked upgrade: ${newUpgrade.name}!`, "S");
            }

            EventSystem.emit('championsPanelUpdate'); // Emit event
            updateUI();
            saveGame();
        } else {
            showLoot("Not enough gold!", "error");
        }
    } catch (error) {
        console.error("Error buying champion:", error);
        showLoot("Error purchasing champion", "error");
    }
}

function updateTotalChampionDPS() {
    try {
        let total = 0;
        Object.entries(player.champions.owned).forEach(([championId, data]) => {
            const champion = championsData.champions.find(c => c.id === championId);
            if (champion && champion.baseDPS) { // Only include champions with baseDPS
                const dps = calculateChampionDPS(champion, data.level);
                if (!isNaN(dps)) {
                    total += dps;
                }
            }
        });
        player.champions.totalDPS = Math.max(0, Math.floor(total));
        console.log(`Total DPS updated: ${player.champions.totalDPS}`);
    } catch (error) {
        console.error("Error updating total DPS:", error);
        player.champions.totalDPS = 0;
    }
}

function applyChampionDPS() {
    try {
        if (player.champions.totalDPS <= 0) return;

        const zone = gameData.regions[currentRegion].zones[currentZone];
        if (!zone || !zone.monster) return;

        // Calculate actual damage per tick (1 second)
        const damagePerTick = Math.floor(player.champions.totalDPS);

        if (damagePerTick <= 0) return;

        // Apply DPS damage
        if (player.currentBoss) {
            player.currentBoss.hp -= damagePerTick;
            if (player.currentBoss.hp <= 0) {
                handleBossDefeat(zone);
            }
        } else {
            zone.monster.hp -= damagePerTick;
            if (zone.monster.hp <= 0) {
                handleMonsterDeath(zone);
            }
        }

        updateUI();
    } catch (error) {
        console.error("Error applying champion DPS:", error);
    }
}

function checkChampionUnlock(championId) {
    const champion = championsData.champions.find(c => c.id === championId);
    if (!champion) return false;

    if (championId === "worldguardian") {
        return player.gold >= champion.baseCost;
    }

    const conditions = CHAMPION_CONFIG.UNLOCK_CONDITIONS[championId];
    if (!conditions) return false;

    // Check zone level requirement
    const zone = gameData.regions[currentRegion].zones[currentZone];
    if (zone.currentLevel < conditions.level) return false;

    // Check gold requirement
    if (player.gold < conditions.cost) return false;

    // Check additional requirements if they exist
    if (conditions.requires) {
        if (conditions.requires.monstersKilled && 
            player.stats.monstersKilled < conditions.requires.monstersKilled) return false;

        if (conditions.requires.bossesKilled && 
            player.stats.bossesKilled < conditions.requires.bossesKilled) return false;

        if (conditions.requires.championLevels) {
            for (const [reqChampion, reqLevel] of Object.entries(conditions.requires.championLevels)) {
                if (!player.champions.owned[reqChampion] || 
                    player.champions.owned[reqChampion].level < reqLevel) return false;
            }
        }
    }

    return true;
}

const EventSystem = {
    events: {},

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    },

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
    }
};

function purchaseChampionUpgrade(championId, upgradeName) {
    try {
        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion) {
            console.error("Champion not found:", championId);
            return;
        }

        const upgrade = champion.upgrades.find(u => u.name === upgradeName);
        if (!upgrade) {
            console.error("Upgrade not found:", upgradeName);
            return;
        }

        if (upgrade && upgrade.specialEffect) {
            // Process special effects
            if (upgrade.specialEffect.type === "goldMultiplier") {
                // Show a special message for gold multiplier
                showLoot(`Gold drops increased by ${upgrade.specialEffect.value * 100}%!`, "legendary");
            }
            
            // Other special effects can be handled here
        }

        const championData = player.champions.owned[championId];
        const championLevel = championData.level;

        // Check requirements
        if (championLevel < upgrade.level) {
            showLoot(`Champion level too low! Need level ${upgrade.level}`, "error");
            return;
        }
        
        // Initialize upgrades array if it doesn't exist
        if (!championData.upgrades) {
            championData.upgrades = [];
        }
        
        // Check if already purchased
        if (championData.upgrades.includes(upgradeName)) {
            showLoot(`${upgrade.name} already purchased!`, "error");
            return;
        }
        
        if (player.gold < upgrade.cost) {
            showLoot(`Not enough gold! Need ${formatNumber(upgrade.cost)}`, "error");
            return;
        }

        // Purchase upgrade
        player.gold -= upgrade.cost;
        championData.upgrades.push(upgradeName);
        
        // Update champion DPS/bonus
        if (champion.id === "worldguardian") {
            const clickDamage = calculateChampionBonus(champion, championLevel);
            player.champions.owned[championId].clickDamageBonus = clickDamage;
        } else {
            const dps = calculateChampionDPS(champion, championLevel);
            player.champions.owned[championId].currentDPS = dps;
        }

        updateTotalChampionDPS();
        showLoot(`Purchased ${upgrade.name} for ${champion.name}!`, "S");
        EventSystem.emit('championsPanelUpdate'); // Emit event
        updateUI();
        saveGame();

    } catch (error) {
        console.error("Error purchasing champion upgrade:", error);
        showLoot("Error purchasing upgrade", "error");
    }
}

function addDragScrollToChampions() {
    const scrollContainer = document.querySelector('.champions-scroll-container');
    if (!scrollContainer) return;
    
    let isDragging = false;
    let startY;
    let scrollTop;
    
    scrollContainer.addEventListener('mousedown', (e) => {
        // Only respond to primary mouse button (left click)
        if (e.button !== 0) return;
        
        // Don't enable drag if clicking on a button or interactive element
        if (e.target.closest('button') || e.target.closest('.upgrade-icon')) return;
        
        isDragging = true;
        startY = e.pageY;
        scrollTop = scrollContainer.scrollTop;
        scrollContainer.style.cursor = 'grabbing';
        
        // Prevent default behavior to avoid text selection during drag
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const y = e.pageY;
        const walkY = (y - startY);
        scrollContainer.scrollTop = scrollTop - walkY;
    });
    
    // Use document for mouseup to catch events outside the container
    document.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = '';
    });
    
    // Cancel drag on mouse leave
    scrollContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            scrollContainer.style.cursor = '';
        }
    });
}

function renderChampionsPanel() {
    try {
        const container = document.getElementById('champions-panel');
        if (!container) return;

        // Store the current scroll position
        const scrollContainer = container.querySelector('.champions-scroll-container');
        const scrollPosition = scrollContainer ? scrollContainer.scrollTop : 0;

        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Header section
        const header = createChampionsPanelHeader();
        fragment.appendChild(header);

        // Buy controls section
        const buyControls = createBuyControls();
        fragment.appendChild(buyControls);

        // Create scroll container for champions
        const newScrollContainer = document.createElement('div');
        newScrollContainer.className = 'champions-scroll-container';

        // Champions list container
        const championsContainer = document.createElement('div');
        championsContainer.className = 'champions-container';

        // Determine highest unlocked index for progressive display
        const highestUnlockedIndex = getHighestUnlockedChampionIndex();

        // Render champions
        championsData.champions.forEach((champion, index) => {
            if (index <= highestUnlockedIndex + 1) {
                const championCard = createChampionCard(champion, index);
                if (championCard) {
                    championsContainer.appendChild(championCard);
                }
            }
        });

        // Add champions container to scroll container
        newScrollContainer.appendChild(championsContainer);
        fragment.appendChild(newScrollContainer);

        // Update the container efficiently
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // Restore scroll position
        newScrollContainer.scrollTop = scrollPosition;
        
        // Add buy button handlers
        attachBuyButtonHandlers();

        setTimeout(() => {
            handleChampionTooltips();
        }, 50);
        
        // Initialize tooltips for buy buttons
        initializeBuyButtonTooltips();
        
        // Add drag scrolling functionality
        addDragScrollToChampions();
        
      } catch (error) {
        console.error("Error rendering champions panel:", error);
        showLoot("Error updating champions display", "error");
      }
}

    // Add this function after the renderChampionsPanel function

    function handleChampionTooltips() {
        // Apply a small delay to ensure DOM is fully rendered
        setTimeout(() => {
            // Get all buy buttons in champion panel
            const buyButtons = document.querySelectorAll('.buy-button');
            
            buyButtons.forEach(button => {
                // Remove any existing listeners
                button.removeEventListener('mouseenter', showChampionTooltip);
                button.removeEventListener('mouseleave', hideChampionTooltip);
                button.removeEventListener('mousemove', updateTooltipPosition);
                
                // Add fresh event listeners
                button.addEventListener('mouseenter', showChampionTooltip);
                button.addEventListener('mouseleave', hideChampionTooltip);
                
                // Add mousemove for continuous position updates
                button.addEventListener('mousemove', (e) => {
                    // Only update position if tooltip is visible
                    const tooltip = button.querySelector('.buy-tooltip');
                    if (tooltip && tooltip.style.visibility === 'visible') {
                        positionBuyTooltip(e);
                    }
                });
            });
            
            console.log(`Initialized tooltips for ${buyButtons.length} buy buttons`);
        }, 100); // Small delay to ensure DOM is ready
    }

    function showChampionTooltip(event) {
        try {
            const button = event.currentTarget;
            const tooltip = button.querySelector('.buy-tooltip');
            if (!tooltip) return;
            
            // Force visibility with !important flags to override any CSS
            tooltip.setAttribute('style', 'opacity: 1 !important; visibility: visible !important; z-index: 9999 !important; position: fixed !important;');
            
            // Call the position function
            positionBuyTooltip(event);
            
        } catch (error) {
            console.error("Error showing champion tooltip:", error);
        }
    }

    function hideChampionTooltip(event) {
        try {
            const tooltip = event.currentTarget.querySelector('.buy-tooltip');
            if (tooltip) {
                // Use style.cssText for multiple important declarations
                tooltip.setAttribute('style', 'opacity: 0 !important; visibility: hidden !important;');
            }
        } catch (error) {
            console.error("Error hiding champion tooltip:", error);
        }
    }

let lastTimestamp = 0;
let animationFrameId = null;

function applyDamageLoop(timestamp) {
    // Calculate elapsed time since last frame
    if (!lastTimestamp) lastTimestamp = timestamp;
    let elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Ensure elapsed time is greater than zero and set a minimum threshold
    if (elapsed <= 0) {
        elapsed = 1; // Set a minimum threshold of 1 millisecond
    }
    
    try {
        // Only apply champion damage if not paused
        if (player.champions.totalDPS > 0 && !isChampionsPaused) {
            const zone = gameData.regions[currentRegion].zones[currentZone];
            if (!zone) {
                console.log("Zone is not valid");
                return; // Exit if zone is not valid
            }
            
            // Calculate damage for this frame (damage per millisecond * elapsed ms)
            const damagePerMs = player.champions.totalDPS / 1000;
            const frameDamage = damagePerMs * elapsed;
            
            if (frameDamage <= 0) {
                console.log(`Frame damage is zero or negative: totalDPS=${player.champions.totalDPS}, elapsed=${elapsed}, damagePerMs=${damagePerMs}`);
                return; // Exit if no damage to apply
            }
            
            // Make sure we have a monster to attack
            if (!zone.monster) {
                console.log("No monster found, spawning new one");
                spawnMonster(zone);
                return;
            }
            
            // Apply the damage
            if (player.currentBoss) {
                // Apply damage to boss
                player.currentBoss.hp -= frameDamage;
                console.log(`Applied ${frameDamage} damage to boss, remaining HP: ${player.currentBoss.hp}`);
                
                // Check if boss is defeated
                if (player.currentBoss.hp <= 0) {
                    if (player.currentBoss.isRegionBoss) {
                        handleRegionBossDefeat(gameData.regions[currentRegion]);
                    } else {
                        handleBossDefeat(zone);
                    }
                }
                
                // Force immediate health display update
                updateHealthDisplay();
                
            } else if (zone.monster) {
                // Apply damage to regular monster
                zone.monster.hp -= frameDamage;
                console.log(`Applied ${frameDamage} damage to monster, remaining HP: ${zone.monster.hp}`);
                
                // Check if monster is defeated
                if (zone.monster.hp <= 0) {
                    handleMonsterDeath(zone);
                    spawnMonster(zone);
                } else {
                    // Force immediate health display update with direct DOM manipulation
                    const healthBar = document.getElementById('health-bar');
                    const healthText = document.getElementById('health-text');
                    
                    if (healthBar && healthText) {
                        const healthPercent = (zone.monster.hp / zone.monster.maxHp) * 100;
                        healthBar.style.width = `${healthPercent}%`;
                        healthBar.style.backgroundColor = getHealthColor(healthPercent);
                        
                        const currentHealth = formatNumber(Math.floor(zone.monster.hp));
                        const maxHealth = formatNumber(Math.floor(zone.monster.maxHp));
                        healthText.textContent = `${currentHealth}/${maxHealth} HP`;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in damage loop:", error);
    }
    
    // Continue the animation loop
    animationFrameId = requestAnimationFrame(applyDamageLoop);
}

function createChampionsPanelHeader() {
    const header = document.createElement('div');
    header.className = 'champions-header';
    header.innerHTML = `
        <h2>Champions</h2>
        <div class="total-dps">Total DPS: ${formatNumber(player.champions.totalDPS)}</div>
    `;
    return header;
}

function createBuyControls() {
    // Get current buy amount from player settings
    const activeBuyAmount = player.selectedBuyAmount || '1';
    
    const buyControls = document.createElement('div');
    buyControls.className = 'buy-controls';
    buyControls.innerHTML = `
        <button class="buy-amount-btn ${activeBuyAmount === '1' ? 'active' : ''}" 
                data-amount="1" 
                data-tooltip="Buy a single level">Buy 1x</button>
        <button class="buy-amount-btn ${activeBuyAmount === '10' ? 'active' : ''}" 
                data-amount="10"
                data-tooltip="Buy 10 levels at once">Buy 10x</button>
        <button class="buy-amount-btn ${activeBuyAmount === '100' ? 'active' : ''}" 
                data-amount="100"
                data-tooltip="Buy 100 levels at once">Buy 100x</button>
        <button class="buy-amount-btn ${activeBuyAmount === 'max' ? 'active' : ''}" 
                data-amount="max"
                data-tooltip="Buy maximum affordable levels">Buy Max</button>
    `;
    return buyControls;
}

function getHighestUnlockedChampionIndex() {
    return championsData.champions.reduce((highest, champion, index) => {
        return player.champions.owned[champion.id] ? index : highest;
    }, -1);
}

function createChampionCard(champion, index) {
    const owned = player.champions.owned[champion.id] || { level: 0, currentDPS: 0, clickDamageBonus: 0, minimized: false };
    const isUnlocked = champion.unlocked || owned.level > 0;
    const canUnlock = !isUnlocked && checkChampionUnlock(champion.id);
    const hasAvailableUpgrade = checkForAvailableUpgrades(champion, owned);

    const card = document.createElement('div');
    card.className = `champion-card ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'can-unlock' : ''} ${hasAvailableUpgrade ? 'has-upgrade' : ''}`;
    
    card.innerHTML = generateChampionCardHTML(champion, owned, isUnlocked, canUnlock, hasAvailableUpgrade);
    return card;
}

function checkForAvailableUpgrades(champion, owned) {
    return champion.upgrades.some(upgrade => 
        owned.level >= upgrade.level && 
        !owned.upgrades?.includes(upgrade.name) && 
        player.gold >= upgrade.cost
    );
}

function attachBuyButtonHandlers() {
    document.querySelectorAll('.buy-amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all buttons
            document.querySelectorAll('.buy-amount-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Store selected amount in player settings
            player.selectedBuyAmount = btn.dataset.amount;
            
            // Save game to persist this setting
            saveGame();
            
            // Re-render champions panel to update buy buttons
            renderChampionsPanel();
        });
    });
}

function showUpgradeTooltip(event) {
    try {
        const icon = event.currentTarget;
        const tooltip = icon.querySelector('.upgrade-tooltip');
        if (!tooltip) return;

        // Force visibility with !important flags to override any CSS
        tooltip.setAttribute('style', 'opacity: 1 !important; visibility: visible !important; z-index: 9999 !important; position: fixed !important;');

        // Call the position function
        positionUpgradeTooltip(event);
    } catch (error) {
        console.error("Error showing upgrade tooltip:", error);
    }
}

function hideUpgradeTooltip(event) {
    try {
        const tooltip = event.currentTarget.querySelector('.upgrade-tooltip');
        if (tooltip) {
            // Use style.cssText for multiple important declarations
            tooltip.setAttribute('style', 'opacity: 0 !important; visibility: hidden !important;');
        }
    } catch (error) {
        console.error("Error hiding upgrade tooltip:", error);
    }
}

function positionUpgradeTooltip(event) {
    try {
        const icon = event.currentTarget;
        const tooltip = icon.querySelector('.upgrade-tooltip');
        if (!tooltip) return;

        // Get position data
        const iconRect = icon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Default position (above the icon)
        let top = iconRect.top - tooltipRect.height - 10;
        let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

        // Adjust if tooltip would go off the top edge
        if (top < 0) {
            top = iconRect.bottom + 10;
        } else {
            tooltip.classList.remove('tooltip-bottom');
            tooltip.classList.add('tooltip-top');
        }

        // Adjust if tooltip would go off left or right edges
        if (left < 0) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        // Apply position
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    } catch (error) {
        console.error("Error positioning upgrade tooltip:", error);
    }
}

// Add event listeners for upgrade icons
document.querySelectorAll('.upgrade-icon').forEach(icon => {
    icon.addEventListener('mouseenter', showUpgradeTooltip);
    icon.addEventListener('mouseleave', hideUpgradeTooltip);
    icon.addEventListener('mousemove', positionUpgradeTooltip);
});

function generateUpgradeIcons(champion, owned) {
    return champion.upgrades.map(upgrade => {
        const isAvailable = owned.level >= upgrade.level;
        const isPurchased = owned.upgrades?.includes(upgrade.name);
        const canAfford = player.gold >= upgrade.cost;
        const classes = [
            'upgrade-icon',
            isAvailable ? 'available' : 'locked',
            isPurchased ? 'purchased' : '',
            isAvailable && canAfford && !isPurchased ? 'can-afford' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="${classes}" 
                 onclick="purchaseChampionUpgrade('${champion.id}', '${upgrade.name}')"
                 data-upgrade="${upgrade.name}">
                <img src="assets/upgrades/${upgrade.icon || 'default.png'}" alt="${upgrade.name}">
                <div class="upgrade-tooltip">
                    <div class="upgrade-tooltip-header">${upgrade.name}</div>
                    <div class="upgrade-tooltip-description">${upgrade.description}</div>
                    <div class="upgrade-tooltip-stats">
                        <div class="upgrade-stat">
                            <span class="upgrade-stat-icon">⚔️</span>
                            <span>${upgrade.effect}</span>
                        </div>
                    </div>
                    <div class="upgrade-tooltip-cost">
                        <span class="gold-icon">💰</span>
                        ${formatNumber(upgrade.cost)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add this function after generateChampionCardHTML
function initializeBuyButtonTooltips() {
    document.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('mouseenter', positionBuyTooltip);
      button.addEventListener('mouseleave', () => {
        const tooltip = button.querySelector('.buy-tooltip');
        if (tooltip) {
          tooltip.style.opacity = '0';
          tooltip.style.visibility = 'hidden';
        }
      });
    });
  }
  
  function positionBuyTooltip(event) {
    try {
        const button = event.currentTarget;
        const tooltip = button.querySelector('.buy-tooltip');
        if (!tooltip) return;

        // Get position data
        const buttonRect = button.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Default position (above the button)
        let top = buttonRect.top - tooltipRect.height - 10;
        let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);

        // Adjust if tooltip would go off the top edge
        if (top < 0) {
            top = buttonRect.bottom + 10;
            tooltip.classList.remove('tooltip-top');
            tooltip.classList.add('tooltip-bottom');
        } else {
            tooltip.classList.remove('tooltip-bottom');
            tooltip.classList.add('tooltip-top');
        }

        // Adjust if tooltip would go off left or right edges
        if (left < 0) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        // Apply position
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
    } catch (error) {
        console.error("Error positioning tooltip:", error);
    }
}

// Add event listeners for buy buttons
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('mouseenter', positionBuyTooltip);
    button.addEventListener('mouseleave', hideBuyTooltip);
});

function hideBuyTooltip(event) {
    const tooltip = event.currentTarget.querySelector('.buy-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }
}

function generateChampionCardHTML(champion, owned = false, isUnlocked = false, canUnlock = false, hasAvailableUpgrade = false) {
    const championData = owned ? player.champions.owned[champion.id] : null;
    const level = championData ? championData.level : 0;
    const dps = championData ? championData.currentDPS : calculateRawChampionDPS(champion, 1);
    
    // Get current buy amount
    const buyAmount = player.selectedBuyAmount || '1';
    
    // Calculate cost for selected amount
    const cost = calculateBulkChampionCost(champion, level, buyAmount === 'max' ? 1 : parseInt(buyAmount));
    const canAfford = player.gold >= cost;
    const buttonState = !canAfford ? "disabled" : "";
    const buttonClass = canAfford ? "can-afford" : "";
    
    // Calculate future DPS after purchase
    const levelsToAdd = buyAmount === 'max' ? 
                        calculateMaxAffordableLevels(champion, level, player.gold).levels : 
                        parseInt(buyAmount);
    const nextLevel = level + levelsToAdd;
    const futureDPS = isUnlocked ? calculateRawChampionDPS(champion, nextLevel) : dps;
    const dpsIncrease = futureDPS - dps;
    const dpsPercentIncrease = dps > 0 ? Math.round((dpsIncrease / dps) * 100) : 100;
    
    // Create champion card
    let cardHTML = `
      <div class="champion-card ${!isUnlocked ? 'locked' : ''} ${canUnlock ? 'can-unlock' : ''} ${hasAvailableUpgrade ? 'has-upgrade' : ''}" data-champion-id="${champion.id}">
    `;
    
    if (isUnlocked) {
      // Champion is unlocked, show full card
      const buyText = buyAmount === 'max' ? 
                     `Buy Max (${calculateMaxAffordableLevels(champion, level, player.gold).levels})` : 
                     `Buy ${buyAmount}x`;
      
      cardHTML += `
        <div class="champion-buy">
          <button class="buy-button ${buttonClass}" 
                  onclick="buyChampionLevels('${champion.id}', '${buyAmount}')" 
                  ${buttonState}
                  data-current-dps="${formatNumber(dps)}"
                  data-future-dps="${formatNumber(futureDPS)}"
                  data-dps-increase="${formatNumber(dpsIncrease)}"
                  data-dps-percent="${dpsPercentIncrease}">
            ${buyText}<br>
            <small>💰 ${formatNumber(cost)}</small>
            <div class="buy-tooltip">
              <div class="tooltip-header">DPS Preview</div>
              <div class="tooltip-content">
                <div class="tooltip-row">Current: ${formatNumber(dps)}</div>
                <div class="tooltip-row">After: ${formatNumber(futureDPS)}</div>
                <div class="tooltip-row increase">+${formatNumber(dpsIncrease)} (${dpsPercentIncrease}%)</div>
              </div>
            </div>
          </button>
          <div class="champion-dps">${formatNumber(dps)} DPS</div>
        </div>
        
        <div class="champion-content">
          <div class="champion-header">
            <div class="champion-name">${champion.name}</div>
            <div class="champion-level">Level ${level}</div>
          </div>
          
          <div class="champion-upgrades">
            ${generateUpgradeIcons(champion, owned)}
          </div>
        </div>
        
        <div class="champion-image">
          <img src="${champion.image}" alt="${champion.name}">
        </div>
      `;
    } else if (canUnlock) {
      // Champion can be unlocked
      cardHTML += `
        <div class="champion-buy">
          <button class="buy-button can-afford" onclick="unlockChampion('${champion.id}')">Unlock</button>
        </div>
        
        <div class="champion-content">
          <div class="champion-header">
            <div class="champion-name">${champion.name}</div>
          </div>
          <div class="unlock-requirements">
            ${renderChampionRequirements(champion.id)}
          </div>
        </div>
        
        <div class="champion-image">
          <img src="${champion.image}" alt="${champion.name}" class="locked-image">
        </div>
      `;
    } else {
      // Champion is locked
      cardHTML += `
        <div class="champion-buy">
          <button class="buy-button" disabled>Locked</button>
        </div>
        
        <div class="champion-content">
          <div class="champion-header">
            <div class="champion-name">${champion.name}</div>
          </div>
          <div class="unlock-requirements">
            ${renderChampionRequirements(champion.id)}
          </div>
        </div>
        
        <div class="champion-image">
          <img src="${champion.image}" alt="${champion.name}" class="locked-image">
        </div>
      `;
    }
    
    cardHTML += `</div>`;
    return cardHTML;
}

function initializeChampions() {
    if (!player.champions) {
        player.champions = {
            owned: {},
            totalDPS: 0
        };
    }
    
    // Debug the champions data
    console.log("Champion initialization started");
    console.log("Current champions owned:", Object.keys(player.champions.owned));
    console.log("Champion levels:", Object.entries(player.champions.owned).map(([id, data]) => `${id}: ${data.level}`));
    
    // Check for each owned champion
    Object.entries(player.champions.owned).forEach(([championId, data]) => {
        // Find champion data
        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion) {
            console.error(`Champion data not found for ${championId}`);
            return;
        }
        
        // Calculate DPS for each champion and force update their currentDPS
        if (champion.id !== "worldguardian") {
            const calculatedDPS = calculateRawChampionDPS(champion, data.level);
            console.log(`Champion ${championId} calculated DPS: ${calculatedDPS}`);
            data.currentDPS = calculatedDPS;
        }
    });
    
    // Recalculate total champion DPS
    updateTotalChampionDPS();
    console.log(`Total champion DPS after recalculation: ${player.champions.totalDPS}`);
    
    // Cancel any existing animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Start the smooth damage application loop
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(applyDamageLoop);
    console.log("Champion damage loop initialized with animation frame:", animationFrameId);
}

// Add a simpler function to directly calculate champion DPS without side effects
function calculateRawChampionDPS(champion, level) {
    try {
        if (!champion || !champion.baseDPS || level <= 0) return 0;
        
        // Start with base DPS
        let dps = champion.baseDPS;
        
        // Linear scaling for first 8 champions
        if (championsData.champions.indexOf(champion) < 8) {
            dps = champion.baseDPS + (level - 1) * champion.baseDPS;
        } else {
            // Exponential scaling for later champions
            dps *= Math.pow(CHAMPION_CONFIG.DPS_MULTIPLIER * 1.5, level - 1);
        }
        
        // Apply level multipliers
        dps *= calculateChampionBonusMultiplier(level);
        
        // Apply region multiplier
        dps *= REGION_DIFFICULTY_MULTIPLIERS[currentRegion] || 1;
        
        return Math.floor(Math.max(0, dps));
    } catch (error) {
        console.error("Error calculating raw champion DPS:", error);
        return 0;
    }
}

// Ensure this is globally accessible
window.initializeChampions = initializeChampions;
window.calculateRawChampionDPS = calculateRawChampionDPS;

window.initializeChampions = initializeChampions;

function toggleChampionMinimize(championId) {
    try {
        const champion = player.champions.owned[championId];
        if (!champion) return;

        // Store scroll position
        const scrollContainer = document.querySelector('.champions-scroll-container');
        const scrollPosition = scrollContainer ? scrollContainer.scrollTop : 0;

        // Toggle minimized state
        champion.minimized = !champion.minimized;

        // Re-render and restore scroll
        renderChampionsPanel();

        // Restore scroll position after a short delay to ensure DOM is updated
        setTimeout(() => {
            const newScrollContainer = document.querySelector('.champions-scroll-container');
            if (newScrollContainer) {
                newScrollContainer.scrollTop = scrollPosition;
            }
        }, 0);

    } catch (error) {
        console.error("Error toggling champion minimize:", error);
    }
}

function renderChampionRequirements(championId) {
    const conditions = CHAMPION_CONFIG.UNLOCK_CONDITIONS[championId];
    if (!conditions) return '';

    let requirements = [];

    // Add gold requirement
    requirements.push(`<p>💰 ${formatNumber(conditions.cost)} gold</p>`);

    // Add champion level requirements if they exist
    if (conditions.requires?.championLevels) {
        Object.entries(conditions.requires.championLevels).forEach(([reqChampion, reqLevel]) => {
            const championName = championsData.champions.find(c => c.id === reqChampion)?.name || reqChampion;
            const currentLevel = player.champions.owned[reqChampion]?.level || 0;
            requirements.push(`<p>⚔️ ${championName} Level ${currentLevel}/${reqLevel}</p>`);
        });
    }

    // Add monster kills requirement if it exists
    if (conditions.requires?.monstersKilled) {
        requirements.push(`<p>👹 Monsters Killed: ${player.stats.monstersKilled}/${conditions.requires.monstersKilled}</p>`);
    }

    // Add boss kills requirement if it exists
    if (conditions.requires?.bossesKilled) {
        requirements.push(`<p>👑 Bosses Killed: ${player.stats.bossesKilled}/${conditions.requires.bossesKilled}</p>`);
    }

    return requirements.join('');
}

function calculateBulkChampionCost(champion, currentLevel, amount) {
    try {
        let totalCost = 0;
        for (let i = 0; i < amount; i++) {
            totalCost += calculateChampionCost(champion, currentLevel + i + 1);
        }
        return totalCost;
    } catch (error) {
        console.error("Error calculating bulk champion cost:", error);
        return Infinity;
    }
}

function calculateMaxAffordableLevels(champion, currentLevel, gold) {
    try {
        let levels = 0;
        let totalCost = 0;
        let nextLevelCost = calculateChampionCost(champion, currentLevel + 1);

        while (totalCost + nextLevelCost <= gold) {
            levels++;
            totalCost += nextLevelCost;
            nextLevelCost = calculateChampionCost(champion, currentLevel + levels + 1);
        }

        return {
            levels: levels,
            cost: totalCost
        };
    } catch (error) {
        console.error("Error calculating max affordable levels:", error);
        return { levels: 0, cost: 0 };
    }
}

function buyChampionLevels(championId, amount) {
    try {
        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion) return;

        const currentLevel = player.champions.owned[championId]?.level || 0;
        let totalCost;
        let levelsToBuy;

        if (amount === 'max') {
            const maxLevels = calculateMaxAffordableLevels(champion, currentLevel, player.gold);
            totalCost = maxLevels.cost;
            levelsToBuy = maxLevels.levels;
        } else {
            levelsToBuy = parseInt(amount);
            totalCost = calculateBulkChampionCost(champion, currentLevel, levelsToBuy);
        }

        if (player.gold >= totalCost && levelsToBuy > 0) {
            player.gold -= totalCost;
            
            // Initialize champion if not owned
            if (!player.champions.owned[championId]) {
                player.champions.owned[championId] = {
                    level: 0,
                    currentDPS: 0,
                    clickDamageBonus: 0,
                    upgrades: []
                };
            }

            // Add levels
            player.champions.owned[championId].level += levelsToBuy;

            // Update champion stats
            if (champion.id === "worldguardian") {
                const bonus = calculateChampionBonus(champion, player.champions.owned[championId].level);
                player.champions.owned[championId].clickDamageBonus = bonus;
                player.damage = bonus;
            } else {
                const dps = calculateChampionDPS(champion, player.champions.owned[championId].level);
                player.champions.owned[championId].currentDPS = dps;
            }

            updateTotalChampionDPS();
            renderChampionsPanel();
            updateUI();
            saveGame();

            if (levelsToBuy > 1) {
                showLoot(`Purchased ${levelsToBuy} levels for ${champion.name}!`, "S");
            } else {
                showLoot(`Purchased 1 level for ${champion.name}!`, "S");
            }
        } else {
            showLoot("Not enough gold!", "error");
        }
    } catch (error) {
        console.error("Error buying champion levels:", error);
        showLoot("Error purchasing levels", "error");
    }
}

window.purchaseChampionUpgrade = purchaseChampionUpgrade;
window.unlockChampion = unlockChampion;
window.formatRequirement = formatRequirement;

// Ensure the Champions Panel is always rendered
document.addEventListener('DOMContentLoaded', () => {
    renderChampionsPanel();
    initializeChampions();
});

function formatRequirement(requirement, value) {
    switch(requirement) {
        case 'level':
            return `📊 Level ${value}`;
        case 'monstersKilled':
            return `👹 ${value} Monsters Killed`;
        case 'bossesKilled':
            return `👑 ${value} Bosses Killed`;
        case 'championLevel':
            return `⚔️ Champion Level ${value}`;
        default:
            return `${requirement}: ${value}`;
    }
}

function unlockChampion(championId) {
    try {
        if (!checkChampionUnlock(championId)) {
            showLoot("Cannot unlock champion yet!", "error");
            return;
        }

        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion) {
            console.error("Champion not found:", championId);
            return;
        }

        // Use baseCost instead of conditions.cost
        if (player.gold < champion.baseCost) {
            showLoot(`Not enough gold! Need ${champion.baseCost - player.gold} more gold`, "error");
            return;
        }

        // Deduct gold cost
        player.gold -= champion.baseCost;

        // Unlock champion
        champion.unlocked = true;

        // Initialize champion data
        if (!player.champions) {
            player.champions = {
                owned: {},
                totalDPS: 0
            };
        }

        // Special handling for (worldguardian)
        if (championId === "worldguardian") {
            player.damage += 1; // Add initial +1 click damage
            player.champions.owned[championId] = {
                level: 1,
                currentDPS: 0,
                clickDamageBonus: 1
            };
        } else {
            // Normal champion initialization
            player.champions.owned[championId] = {
                level: 1,
                currentDPS: champion.baseDPS,
                clickDamageBonus: 0
            };

            // Update champion's DPS
            const dps = calculateChampionDPS(champion, 1);
            player.champions.owned[championId].currentDPS = dps;
            updateTotalChampionDPS();
        }

        showLoot(`🎉 Unlocked ${champion.name}!`, "S");
        renderChampionsPanel();
        updateUI();
        saveGame();

    } catch (error) {
        console.error("Error unlocking champion:", error);
        showLoot("Error unlocking champion", "error");
    }
}

function formatNumber(num) {
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

// Alternative version with more detailed formatting
function formatLargeNumber(num) {
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

function getGoldMultiplier() {
    let multiplier = 1.0; // Base multiplier is 1x
    
    // Check for Brother Clement's gold boost upgrade
    if (player.champions && player.champions.owned && player.champions.owned.brotherclement) {
        // Check if Brother Clement is at least level 75
        if (player.champions.owned.brotherclement.level >= 75) {
            // Check if the "Alms of Prosperity" upgrade is purchased
            const championData = player.champions.owned.brotherclement;
            
            // Use 'upgrades' instead of 'purchasedUpgrades'
            if (championData.upgrades && 
                championData.upgrades.includes("Alms of Prosperity")) {
                multiplier += 0.25; // Add 25% gold boost
            }
        }
    }
    
    return multiplier;
}

function awardGold(amount) {
    // Apply the gold multiplier
    const multiplier = getGoldMultiplier();
    const boostedAmount = Math.floor(amount * multiplier);
    
    player.gold += boostedAmount;
    player.stats.totalGoldEarned += boostedAmount;
    
    // If the amount was boosted, show a special message
    if (multiplier > 1) {
        const bonusAmount = boostedAmount - amount;
        if (bonusAmount > 0) {
            // Optionally show a notification about the bonus gold
            // showLoot(`+${bonusAmount} bonus gold!`, "gold");
        }
    }
    
    updateUI(); // Update the UI to show the new gold amount
}

function calculateBaseGold(level, isBoss = false) {
    try {
        let baseGold;
        
        // Level 1-140: Gold = 1.6^(level-1)
        if (level <= 140) {
            baseGold = Math.ceil(Math.pow(1.6, level - 1));
        }
        // Level 141+: Gold = 4.717e28 * 1.15^(level-140)
        else {
            const baseValue = 4.717e28;
            baseGold = Math.ceil(baseValue * Math.pow(1.15, level - 140));
        }

        // Apply boss multiplier if applicable
        if (isBoss) {
            baseGold *= 10;
        }

        return Math.ceil(baseGold);
    } catch (error) {
        console.error("Error calculating gold value:", error);
        return 1; // Fallback value
    }
}

// Add this function to calculate item values based on level ranges
function calculateItemValue(tier, dropLevel) {
    const baseGold = calculateBaseGold(dropLevel);
    const tierMultipliers = {
        'C': 0.5,    // Common items worth 50% of monster gold
        'B': 2,      // Uncommon items worth 2x monster gold
        'A': 5,      // Rare items worth 5x monster gold
        'S': 15      // Super rare items worth 15x monster gold
    };

    return Math.floor(baseGold * tierMultipliers[tier]);
}

function initializeMapControls() {
    const mapContainer = document.querySelector('.map-container');
    const baseView = document.getElementById('base-view');
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    let currentScale = 1;

    mapContainer.addEventListener('wheel', handleWheel);
    mapContainer.addEventListener('mousedown', handleMouseDown);

    // Pan functionality
    mapContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mapContainer.classList.add('grabbing');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        requestAnimationFrame(() => updateMapTransform());
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        mapContainer.classList.remove('grabbing');
    });

    // Zoom functionality
    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = mapContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const contentX = (mouseX - translateX) / currentScale;
        const contentY = (mouseY - translateY) / currentScale;

        const zoomFactor = Math.pow(0.95, e.deltaY > 0 ? 1 : -1);
        const newScale = Math.min(Math.max(currentScale * zoomFactor, 1), 4);
        
        if (newScale !== currentScale) {
            translateX = mouseX - (contentX * newScale);
            translateY = mouseY - (contentY * newScale);
            
            currentScale = newScale;
            requestAnimationFrame(() => updateMapTransform());
        }
    });

    function updateMapTransform() {
        const containerRect = mapContainer.getBoundingClientRect();
        const contentWidth = containerRect.width * currentScale;
        const contentHeight = containerRect.height * currentScale;

        const minX = Math.min(0, containerRect.width - contentWidth);
        const minY = Math.min(0, containerRect.height - contentHeight);

        translateX = Math.max(minX, Math.min(0, translateX));
        translateY = Math.max(minY, Math.min(0, translateY));

        baseView.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;
    }

    window.resetMapTransform = () => {
        translateX = 0;
        translateY = 0;
        currentScale = 1;
        requestAnimationFrame(() => updateMapTransform());
    };
}

// Separate the event handlers for easier adding/removing
function handleWheel(e) {
    e.preventDefault();
    // Your existing wheel zoom code
}

function handleMouseDown(e) {
    if (e.button !== 0) return;
    // Your existing mousedown pan code
}

// Add to your existing openMapModal function
function openMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'block';
        resetZoom();
        updateMapZones();
        initializeSidebar();
        updateSidebarStates(); // Add this line
    }
}

function initializeSidebar() {
    // Handle region clicks
    document.querySelectorAll('.region-item').forEach(region => {
        const regionHeader = region.querySelector('.region-header');
        regionHeader.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const regionId = region.dataset.region;
            const regionData = gameData.regions[regionId];
            
            if (!regionData || !regionData.unlocked) {
                showLoot("Complete previous region to unlock!", "error");
                return;
            }
            
            // Handle expand/collapse
            toggleExpand(region);
        });
    });

    // Handle kingdom clicks
    document.querySelectorAll('.kingdom-item').forEach(kingdom => {
        const kingdomHeader = kingdom.querySelector('.kingdom-header');
        kingdomHeader.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const kingdomId = kingdom.dataset.kingdom;
            const parentRegionId = kingdom.dataset.parent;
            const regionData = gameData.regions[parentRegionId];

            if (kingdom.classList.contains('locked')) {
                showLoot("Complete previous kingdom to unlock!", "error");
                return;
            }

            // Handle expand/collapse
            toggleExpand(kingdom);
        });
    });

    // Handle subzone clicks
    document.querySelectorAll('.subzone-item').forEach(subzone => {
        subzone.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const subzoneId = subzone.dataset.subzone;
            const parentKingdom = subzone.closest('.kingdom-item');
            
            if (!parentKingdom) return;

            // Check if subzone is locked
            if (subzoneId === 'lumbridgeswamp') {
                const cowpenZone = gameData.regions[currentRegion].zones['cowpen'];
                if (!cowpenZone || cowpenZone.currentLevel < 50) {
                    showLoot("Requires Cow Pen Level 50", "error");
                    return;
                }
            }

            // Switch to the zone if unlocked
            if (!subzone.classList.contains('locked')) {
                switchZone(subzoneId);
                closeMapModal();
            }
        });
    });
}

function toggleExpand(element) {
    const list = element.querySelector('.kingdom-list, .subzone-list');
    if (!list) return;

    element.classList.toggle('collapsed');
    
    if (element.classList.contains('collapsed')) {
        list.style.maxHeight = '0';
    } else {
        list.style.maxHeight = list.scrollHeight + 'px';
    }
}

function updateSidebarStates() {
    // Update subzone states
    document.querySelectorAll('.subzone-item').forEach(subzone => {
        const subzoneId = subzone.dataset.subzone;
        
        if (subzoneId === 'lumbridgeswamp') {
            const cowpenZone = gameData.regions[currentRegion].zones['cowpen'];
            const isLocked = !cowpenZone || cowpenZone.currentLevel < 50;
            subzone.classList.toggle('locked', isLocked);
            subzone.title = isLocked ? "Requires Cow Pen Level 50" : "";
        }
    });

    // Update kingdom states
    document.querySelectorAll('.kingdom-item').forEach(kingdom => {
        const kingdomId = kingdom.dataset.kingdom;
        const kingdomData = gameData.regions[currentRegion].zones[kingdomId];
        if (kingdomData) {
            kingdom.classList.toggle('locked', !kingdomData.unlocked);
        }
    });
}

function zoomToButton(button, scale, offsetX = 0, offsetY = 0) {
    const baseView = document.getElementById('base-view');
    const rect = button.getBoundingClientRect();
    const container = baseView.parentElement.getBoundingClientRect();
    
    // Calculate zoom center with offsets
    const originX = (rect.left + rect.width/2 - container.left) / container.width * 100 + offsetX;
    const originY = (rect.top + rect.height/2 - container.top) / container.height * 100 + offsetY;
    
    baseView.style.transition = 'all 0.5s ease-out';
    baseView.style.transformOrigin = `${originX}% ${originY}%`;
    baseView.style.transform = `scale(${scale})`;
}

function resetZoom() {
    const baseView = document.getElementById('base-view');
    baseView.style.transition = 'all 0.5s ease-out';
    baseView.style.transform = 'scale(1)';
    baseView.style.transformOrigin = 'center';
}

function updateMapZones() {
    document.querySelectorAll('.zone-button').forEach(button => {
        const zoneId = button.dataset.zone;
        const subzoneId = button.dataset.subzone;
        
        if (subzoneId) {
            // Handle subzone buttons
            const zone = gameData.regions[currentRegion].zones[subzoneId];
            if (zone) {
                button.classList.toggle('locked', !zone.unlocked);
                if (!zone.unlocked && zone.requiredForUnlock) {
                    button.title = `Requires ${zone.requiredForUnlock.zone} Level ${zone.requiredForUnlock.level}`;
                }
            }
        } else if (zoneId) {
            // Handle region buttons
            const region = gameData.regions[zoneId];
            if (region) {
                const isLocked = !region.unlocked;
                button.classList.toggle('locked', isLocked);
                if (isLocked) {
                    button.title = `Complete previous region to unlock`;
                }
            }
        }
    });
}

function closeMapModal() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Reset all buttons to initial state
        setTimeout(() => {
            document.querySelectorAll('.kingdom-button, .subzone-button').forEach(btn => {
                btn.classList.add('hidden');
                btn.classList.remove('fade-in', 'fade-out');
            });
            
            document.querySelectorAll('.region-button').forEach(btn => {
                btn.classList.remove('hidden', 'fade-in', 'fade-out');
            });
            
            // Reset zoom and header
            resetZoom();
            const headerButton = document.querySelector('.map-header .back-button');
            const headerTitle = document.querySelector('.map-header .title');
            headerButton.textContent = 'Exit Map';
            headerTitle.textContent = 'World Map';
        }, 100);
    }
}

function handleMapNavigation() {
    const headerButton = document.querySelector('.map-header .back-button');
    const headerTitle = document.querySelector('.map-header .title');

    const hasVisibleSubzoneButtons = document.querySelector('.subzone-button:not(.hidden)');
    const hasVisibleKingdomButtons = document.querySelector('.kingdom-button:not(.hidden)');

    if (hasVisibleSubzoneButtons) {
        // Going back from subzones to kingdoms
        document.querySelectorAll('.subzone-button').forEach(btn => {
            btn.classList.add('fade-out');
            setTimeout(() => {
                btn.classList.add('hidden');
                btn.classList.remove('fade-out');
            }, 500);
        });

        document.querySelectorAll('.kingdom-button').forEach(btn => {
            if (!btn.classList.contains('locked')) {
                btn.classList.remove('hidden');
                setTimeout(() => btn.classList.add('fade-in'), 50);
            }
        });

        // Keep your original zoom values
        zoomToButton(document.querySelector('.kingdom-button:not(.hidden)'), 4.5, 7, -5);
        headerTitle.textContent = 'Misthalin';
        headerButton.textContent = 'Back';
    } else if (hasVisibleKingdomButtons) {
        // Going back from kingdoms to world map
        document.querySelectorAll('.kingdom-button').forEach(btn => {
            btn.classList.add('fade-out');
            setTimeout(() => {
                btn.classList.add('hidden');
                btn.classList.remove('fade-out');
            }, 500);
        });

        document.querySelectorAll('.region-button').forEach(btn => {
            btn.classList.remove('hidden');
            setTimeout(() => btn.classList.add('fade-in'), 50);
        });

        resetZoom();
        headerTitle.textContent = 'World Map';
        headerButton.textContent = 'Exit Map';
    } else {
        closeMapModal();
    }
}

document.addEventListener('click', function(event) {
    const button = event.target.closest('.zone-button');
    if (!button || button.classList.contains('locked')) return;

    const regionId = button.dataset.region;
    const kingdomId = button.dataset.kingdom;
    const subzoneId = button.dataset.subzone;
    const headerTitle = document.querySelector('.map-header .title');
    const headerButton = document.querySelector('.map-header .back-button');

    if (regionId === 'misthalin') {
        // Hide region buttons
        document.querySelectorAll('.region-button').forEach(btn => {
            btn.classList.add('fade-out');
            setTimeout(() => {
                btn.classList.add('hidden');
                btn.classList.remove('fade-out');
            }, 500);
        });

        // Show kingdom buttons
        setTimeout(() => {
            document.querySelectorAll('.kingdom-button').forEach(btn => {
                if (btn.dataset.parent === regionId && !btn.classList.contains('locked')) {
                    btn.classList.remove('hidden');
                    setTimeout(() => btn.classList.add('fade-in'), 50);
                }
            });
        }, 500);

        // Keep your original zoom values
        zoomToButton(button, 4.5, 7, -5);
        headerTitle.textContent = 'Misthalin';
        headerButton.textContent = 'Back';
    } else if (kingdomId === 'lumbridge') {
        // Hide kingdom buttons
        document.querySelectorAll('.kingdom-button').forEach(btn => {
            btn.classList.add('fade-out');
            setTimeout(() => {
                btn.classList.add('hidden');
                btn.classList.remove('fade-out');
            }, 500);
        });

        // Show subzone buttons - fixed selector
        setTimeout(() => {
            document.querySelectorAll('.subzone-button').forEach(btn => {
                // Check if the button belongs to this kingdom
                if (btn.dataset.parent === kingdomId && !btn.classList.contains('locked')) {
                    btn.classList.remove('hidden');
                    setTimeout(() => btn.classList.add('fade-in'), 50);
                }
            });
        }, 500);

        // Keep your original zoom values
        zoomToButton(button, 9, 9, -25);
        headerTitle.textContent = 'Lumbridge';
        headerButton.textContent = 'Back';
    } else if (subzoneId) {
        switchZone(subzoneId);
        closeMapModal();
    }
});

// Handle clicking outside the modal
document.addEventListener('click', function(event) {
    const modal = document.getElementById('mapModal');
    const modalContent = modal.querySelector('.modal-content');
    
    if (event.target === modal) {
        const hasVisibleSubzoneButtons = document.querySelector('.subzone-button:not(.hidden)');
        const hasVisibleKingdomButtons = document.querySelector('.kingdom-button:not(.hidden)');
        
        if (hasVisibleSubzoneButtons || hasVisibleKingdomButtons) {
            handleMapNavigation();
        } else {
            closeMapModal();
        }
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('mapModal');
    if (event.target === modal) {
        closeMapModal();
    }
};

let itemData = getItemData();

function updateItemValues(level) {
    Object.entries(itemData).forEach(([itemName, data]) => {
        itemData[itemName] = {
            ...data,
            value: calculateItemValue(data.tier, level)
        };
    });
}

// Add near the top of the file after constants
const GameError = {
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

// Add after error handling system
const UIManager = {
  updateQueue: new Set(),
  updateScheduled: false,
  elements: {},

  // Initialize UI references
  init() {
      this.elements = {
          // Zone and monster info
          zoneName: document.getElementById("zone-name"),
          zoneLevel: document.getElementById("zone-level"),
          monsterName: document.getElementById("monster-name"),
          monsterSprite: document.getElementById("monster-sprite"),
          variantIndicator: document.querySelector(".variant-indicator"),

          // Health and combat
          healthBar: document.getElementById("health-bar"),
          healthText: document.getElementById("health-text"),
          progressBar: document.querySelector(".progress-fill"),
          progressContainer: document.querySelector(".progress-container"),
          killsText: document.querySelector(".progress-label span:last-child"),

          // Stats
          goldDisplay: document.getElementById("stat-gold"),
          damageDisplay: document.getElementById("stat-damage"),
          luckDisplay: document.getElementById("stat-luck"),
          prestigeDisplay: document.getElementById("stat-prestige"),
          monstersKilledDisplay: document.getElementById("stat-monsters"),
          bossesKilledDisplay: document.getElementById("stat-bosses"),

          // Buttons and special elements
          regionBossBtn: document.getElementById("region-boss-btn"),
          bossTimer: document.getElementById("boss-timer"),
          prestigeBtn: document.getElementById("prestige-btn")
      };
  },

  queueUpdate(component) {
      this.updateQueue.add(component);
      this.scheduleUpdate();
  },

  scheduleUpdate() {
      if (this.updateScheduled) return;
      this.updateScheduled = true;
      
      requestAnimationFrame(() => {
          this.processUpdates();
          this.updateScheduled = false;
      });
  },

  processUpdates() {
      try {
          this.updateQueue.forEach(component => {
              switch(component) {
                  case 'all':
                      this.updateAllComponents();
                      break;
                  case 'monster':
                      this.updateMonsterInfo();
                      break;
                  case 'health':
                      this.updateHealthDisplay();
                      break;
                  case 'progress':
                      this.updateProgressBar();
                      break;
                  case 'stats':
                      this.updateStats();
                      break;
                  case 'buttons':
                      this.updateButtons();
                      break;
                  case 'inventory':
                      updateInventory();
                      break;
                  case 'collection':
                      renderCollectionLog();
                      break;
                  case 'levelSelect':
                      renderLevelSelect();
                      break;
                  case 'shop':
                      renderShop();
                      break;
              }
          });
          this.updateQueue.clear();
      } catch (error) {
          GameError.handleError(error, 'UIManager.processUpdates');
      }
  },

  updateAllComponents() {
      const zone = gameData.regions[currentRegion].zones[currentZone];
      const region = gameData.regions[currentRegion];
      const monster = player.currentBoss || zone.monster;

      this.updateZoneInfo(zone);
      this.updateMonsterInfo(monster);
      this.updateHealthDisplay(monster);
      this.updateProgressBar(zone);
      this.updateStats();
      this.updateButtons(region, zone);
  },

  updateZoneInfo(zone) {
      if (this.elements.zoneName) {
          this.elements.zoneName.textContent = getZoneTitleForLevel(currentZone, zone.currentLevel);
      }
      if (this.elements.zoneLevel) {
          this.elements.zoneLevel.textContent = zone.currentLevel;
      }
  },

  updateMonsterInfo(monster) {
      if (!monster) return;
      
      if (this.elements.monsterName && this.elements.monsterSprite) {
          this.elements.monsterName.textContent = monster.name;
          this.elements.monsterSprite.src = `assets/${monster.image}`;
          
          if (this.elements.variantIndicator) {
              const tier = player.currentBoss ? "S" : monster.tier;
              this.elements.variantIndicator.className = `variant-indicator ${tier}-tier`;
              this.elements.variantIndicator.textContent = tier;
          }
      }
  },

  updateHealthDisplay(monster) {
    if (!monster) return;

    if (this.elements.healthBar && this.elements.healthText) {
        const healthPercent = (monster.hp / monster.maxHp) * 100;
        this.elements.healthBar.style.width = `${healthPercent}%`;
        this.elements.healthBar.style.backgroundColor = getHealthColor(healthPercent);
        this.elements.healthText.textContent = `${formatNumber(monster.hp)}/${formatNumber(monster.maxHp)} HP`;
    }
},

  updateProgressBar(zone) {
      if (this.elements.progressContainer) {
          if (player.currentBoss) {
              this.elements.progressContainer.style.display = "none";
          } else {
              this.elements.progressContainer.style.display = "block";
              if (this.elements.progressBar && this.elements.killsText) {
                  const percentage = (zone.currentKills / zone.monstersPerLevel) * 100;
                  this.elements.progressBar.style.width = `${percentage}%`;
                  this.elements.killsText.textContent = `${zone.currentKills}/${zone.monstersPerLevel}`;
              }
          }
      }
  },

  updateStats() {
    const { elements } = this;
    if (elements.goldDisplay) elements.goldDisplay.textContent = formatNumber(player.gold || 0);
    if (elements.damageDisplay) elements.damageDisplay.textContent = player.damage || 1;
    if (elements.luckDisplay) elements.luckDisplay.textContent = `${(player.luck || 1).toFixed(1)}x`;
    if (elements.prestigeDisplay) elements.prestigeDisplay.textContent = player.prestigeLevel || 0;
    if (elements.monstersKilledDisplay) elements.monstersKilledDisplay.textContent = player.stats?.monstersKilled || 0;
    if (elements.bossesKilledDisplay) elements.bossesKilledDisplay.textContent = player.stats?.bossesKilled || 0;
    if (elements.goldDisplay) {
        elements.goldDisplay.textContent = formatNumber(player.gold || 0);
        updateGoldIcon(player.gold || 0);
    }
  },

  updateButtons(region, zone) {
      // Update Boss Timer
      if (this.elements.bossTimer && player.currentBoss) {
          this.elements.bossTimer.style.display = "block";
          this.elements.bossTimer.innerHTML = `Time Remaining: ${player.bossTimeLeft}s`;
      }

      // Update Region Boss Button
      if (this.elements.regionBossBtn) {
          const totalMiniBosses = Object.keys(region.zones).length * (50 / GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL);
          const defeatedMiniBosses = Object.values(region.zones).reduce(
              (total, z) => total + (z.defeatedMiniBosses?.length || 0), 0
          );
          const showButton = zone.currentLevel >= 50 && !region.bossDefeated && defeatedMiniBosses >= totalMiniBosses;
          this.elements.regionBossBtn.style.display = showButton ? "block" : "none";
      }

      // Update Prestige Button
      if (this.elements.prestigeBtn) {
          this.elements.prestigeBtn.style.display = region.bossDefeated ? "block" : "none";
      }
  }
};

function updateStatsDisplay() {
    try {
        // Update combat stats
        if (document.getElementById('damage-stat')) {
            document.getElementById('damage-stat').textContent = formatNumber(player.damage || 0);
        }
        if (document.getElementById('champion-dps-stat')) {
            document.getElementById('champion-dps-stat').textContent = formatNumber(player.champions?.totalDPS || 0);
        }
        if (document.getElementById('luck-stat')) {
            document.getElementById('luck-stat').textContent = (player.luck || 1).toFixed(2) + 'x';
        }

        // Update progress stats
        if (document.getElementById('monsters-killed-stat')) {
            document.getElementById('monsters-killed-stat').textContent = formatNumber(player.stats?.monstersKilled || 0);
        }
        if (document.getElementById('bosses-killed-stat')) {
            document.getElementById('bosses-killed-stat').textContent = formatNumber(player.stats?.bossesKilled || 0);
        }
        if (document.getElementById('total-gold-stat')) {
            document.getElementById('total-gold-stat').textContent = formatNumber(player.stats?.totalGoldEarned || 0);
        }

        // Update game stats
        if (document.getElementById('prestige-stat')) {
            document.getElementById('prestige-stat').textContent = formatNumber(player.prestigeLevel || 0);
        }
        
        // Calculate collection log completion with safety checks
        if (document.getElementById('collection-stat') && window.itemData) {
            const totalItems = Object.keys(window.itemData).length;
            const collectedItems = player.collectionLog?.length || 0;
            document.getElementById('collection-stat').textContent = 
                `${formatNumber(collectedItems)}/${formatNumber(totalItems)}`;
        }

    } catch (error) {
        console.error("Error updating stats display:", error);
    }
}

function initializeCollectionLog() {
  try {
      if (!Array.isArray(player.collectionLog)) {
          player.collectionLog = [];
      }
  } catch (error) {
      console.error('Error initializing collection log:', error);
      player.collectionLog = [];
  }
}

function updateZoneDisplay(zone) {
    try {
        // Update zone name
        const zoneNameElement = document.getElementById('zone-name');
        if (zoneNameElement) {
            const zoneName = getZoneTitleForLevel(currentZone, zone.currentLevel);
            zoneNameElement.textContent = zoneName;
        }

        // Update zone level
        const zoneLevelElement = document.getElementById('zone-level');
        if (zoneLevelElement) {
            zoneLevelElement.textContent = zone.currentLevel;
        }

        // Add animation class for zone name change if at a transition level
        if (zone.currentLevel % 20 === 1) { // Changed from 10 to 20 to match zone variants
            if (zoneNameElement) {
                zoneNameElement.classList.add('changing');
                setTimeout(() => zoneNameElement.classList.remove('changing'), 500);
            }
        }
    } catch (error) {
        console.error("Error updating zone display:", error);
    }
}

function initializeSaveSystem() {
    // Make current region/zone states part of gameData
    if (!gameData.currentState) {
        gameData.currentState = {
            currentRegion: "lumbridge",
            currentZone: "cowpen",
            isAutoProgressEnabled: false
        };
    }

    // Initialize save system with both player and gameData references
    saveSystem.init(player, gameData);

    // Add event listeners for save buttons
    document.getElementById('save-game-btn')?.addEventListener('click', () => saveGame(true));
    document.getElementById('load-backup-btn')?.addEventListener('click', () => saveSystem.loadBackupSave());
    document.getElementById('reset-game-btn')?.addEventListener('click', showResetConfirmation);
}


// Load initial monster
gameData.regions[currentRegion].zones[currentZone].monster =
  getCurrentMonsterStats(gameData.regions[currentRegion].zones[currentZone]);

// Add auto-save functionality
function initializeAutoSave() {
    setInterval(() => {
        if (player.settings?.autoSave) {
            saveGame();
        }
    }, GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
}

function updateVersionButton() {
    try {
        const versionBtn = document.getElementById('version-btn');
        if (versionBtn) {
            versionBtn.textContent = `v${GAME_CONFIG.VERSION.NUMBER}`;
        }
    } catch (error) {
        console.error("Error updating version button:", error);
    }
}

setInterval(() => {
  if (player.settings.autoSave) saveGame();
}, GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);  // Changed from 30000

function initializeCombatListeners() {
    const monsterContainer = document.querySelector('.monster-container');
    if (monsterContainer) {
        monsterContainer.addEventListener('click', (event) => {
            attackHandler(event);
        });
    }
}

function attackHandler(event) {
    try {
        // Prevent handling click events from hit effects
        if (!event || event.target.classList.contains('hit-effect')) return;
        
        player.lastClickEvent = event;

        const zone = gameData.regions[currentRegion].zones[currentZone];
        const monster = player.currentBoss || zone.monster;
        if (!monster) return;

        // Calculate damage with critical hits and combo system
        const damage = calculateAttackDamage();
        
        // Apply damage and visual effects
        applyDamageEffects(event, monster, damage);

        // Apply damage to monster
        if (player.currentBoss) {
            player.currentBoss.hp -= damage;
            if (player.currentBoss.hp <= 0) {
                if (player.currentBoss.isRegionBoss) {
                    handleRegionBossDefeat(gameData.regions[currentRegion]);
                } else {
                    handleBossDefeat(zone);
                }
            }
        } else {
            monster.hp -= damage;
            if (monster.hp <= 0) {
                handleMonsterDeath(zone);
            }
        }

        updateUI();
    } catch (error) {
        console.error('Error handling attack:', error);
        showLoot('Error processing attack', 'error');
    }
}

function calculateAttackDamage() {
    try {
        let damage = player.damage;
        
        // Critical hit system - only apply if at least one champion is unlocked
        const hasCriticalHitAbility = Object.keys(player.champions.owned).length > 0;
        const critChance = hasCriticalHitAbility ? (0.1 + (player.luck - 1) * 0.05) : 0; // Base 10% + bonus from luck
        const isCrit = Math.random() < critChance;
        if (isCrit) {
            damage *= 2;
            showCriticalHit(player.lastClickEvent);
        }

        // Initialize combo if it doesn't exist
        if (!player.combo) {
            player.combo = { count: 0, timer: null };
        }

        // Cap combo at 20
        if (player.combo.count < 20) {
            player.combo.count++;
        }
        
        // Apply combo damage bonus (only after 5 hits, capped at 100% bonus)
        if (player.combo.count > 5) {
            const comboBonus = Math.min(1.0, (player.combo.count - 5) * 0.1); // Cap at 100% bonus
            damage *= (1 + comboBonus);
        }

        // Reset combo immediately if timer exists
        if (player.combo.timer) {
            clearTimeout(player.combo.timer);
        }

        // Set new timer to reset combo
        player.combo.timer = setTimeout(() => {
            player.combo.count = 0;
            updateComboDisplay();
        }, 1000); // Reduced from 2000ms to 1000ms for quicker reset

        updateComboDisplay();
        return Math.floor(damage);
    } catch (error) {
        console.error('Error calculating attack damage:', error);
        return player.damage;
    }
}

function applyDamageEffects(event, monster, damage) {
    try {
        // Create damage number with formatting
        const damageNumber = document.createElement('div');
        damageNumber.className = 'damage-number';
        damageNumber.textContent = formatNumber(damage);

        // Position damage number relative to scene container
        const container = document.querySelector('.scene-container');
        if (container && event) {
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            damageNumber.style.left = `${x}px`;
            damageNumber.style.top = `${y}px`;
            container.appendChild(damageNumber);

            // Add random spread to damage numbers
            const spread = 30;
            const randomX = Math.random() * spread - spread/2;
            damageNumber.style.transform = `translate(${randomX}px, -30px)`;
            
            setTimeout(() => damageNumber.remove(), 1000);
        }

        // Add visual effects
        addHitEffects();
        
    } catch (error) {
        console.error('Error applying damage effects:', error);
    }
}

function addHitEffects() {
    try {
        const monsterSprite = document.getElementById('monster-sprite');
        if (!monsterSprite) return;

        // Hit shake effect
        monsterSprite.classList.add('hit');
        setTimeout(() => monsterSprite.classList.remove('hit'), 100);

        // Hit flash
        const hitFlash = document.createElement('div');
        hitFlash.className = 'hit-flash';
        monsterSprite.parentElement.appendChild(hitFlash);
        setTimeout(() => hitFlash.remove(), 200);

    } catch (error) {
        console.error('Error adding hit effects:', error);
    }
}

function showCriticalHit(event) {
    try {
        const container = document.querySelector('.scene-container');
        if (!container || !event) return;

        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const critText = document.createElement('div');
        critText.className = 'critical-hit';
        critText.textContent = 'CRITICAL!';
        critText.style.left = `${x}px`;
        critText.style.top = `${y}px`;

        container.appendChild(critText);
        setTimeout(() => critText.remove(), 1000);
    } catch (error) {
        console.error('Error showing critical hit:', error);
    }
}

function updateComboDisplay() {
    try {
        if (!player.combo?.count || player.combo.count <= 5) return;

        const container = document.querySelector('.scene-container');
        if (!container || !player.lastClickEvent) return;

        const rect = container.getBoundingClientRect();
        const x = player.lastClickEvent.clientX - rect.left;
        const y = player.lastClickEvent.clientY - rect.top;

        let comboDisplay = document.querySelector('.combo-display');
        if (!comboDisplay) {
            comboDisplay = document.createElement('div');
            comboDisplay.className = 'combo-display';
            container.appendChild(comboDisplay);
        }

        comboDisplay.textContent = `${player.combo.count}x Combo!`;
        comboDisplay.style.left = `${x}px`;
        comboDisplay.style.top = `${y - 30}px`; // Offset slightly above damage number
        comboDisplay.style.display = 'block';
        comboDisplay.style.transform = `scale(${1 + (player.combo.count - 5) * 0.05})`;

        // Remove previous timeout if it exists
        if (comboDisplay.timeout) {
            clearTimeout(comboDisplay.timeout);
        }
        
        // Set new timeout to remove the display
        comboDisplay.timeout = setTimeout(() => {
            comboDisplay.remove();
        }, 1000);

    } catch (error) {
        console.error('Error updating combo display:', error);
    }
}

function updateProgressBar() {
  try {
      const zone = gameData.regions[currentRegion].zones[currentZone];
      const progressContainer = document.querySelector('.progress-container');
      const progressFill = document.querySelector('.progress-fill');
      const killsText = document.querySelector('.progress-label span:last-child');
      
      if (!progressContainer || !progressFill || !killsText) return;

      // Ensure monstersPerLevel is set
      if (!zone.monstersPerLevel) {
          zone.monstersPerLevel = 10;
      }

      // Hide progress during boss fights
      if (player.currentBoss) {
          progressContainer.style.display = 'none';
          return;
      }

      // Show and update progress
      progressContainer.style.display = 'block';
      const percentage = (zone.currentKills / zone.monstersPerLevel) * 100;
      progressFill.style.width = `${percentage}%`;
      killsText.textContent = `${zone.currentKills}/${zone.monstersPerLevel}`;
  } catch (error) {
      console.error('Error updating progress bar:', error);
  }
}

function getRandomVariant(zone) {
  const totalWeight = zone.variants.reduce(
    (sum, variant) => sum + variant.weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const variant of zone.variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }
  return zone.variants[0]; // Fallback
}

const GOLD_ICONS = {
  GOLD1: 'assets/coins/coins_1.png',      // 1-999 gold
  GOLD2: 'assets/coins/coins_2.png', // 1,000-99,999 gold
  GOLD3: 'assets/coins/coins_3.png',     // 100,000-999,999 gold
  GOLD4: 'assets/coins/coins_4.png',     // 1,000,000+ gold
  GOLD5: 'assets/coins/coins_5.png',      // 1,000,000+ gold
  GOLD6: 'assets/coins/coins_6.png',      // 1,000,000+ gold
  GOLD7: 'assets/coins/coins_7.png',      // 1,000,000+ gold
  GOLD8: 'assets/coins/coins_8.png',      // 1,000,000+ gold
  GOLD9: 'assets/coins/coins_9.png',      // 1,000,000+ gold
  GOLD10: 'assets/coins/coins_10.png',      // 1,000,000+ gold
};

function updateGoldIcon(amount) {
  const goldIcon = document.querySelector('.gold-icon img');
  if (!goldIcon) return;

  if (amount >= 10000000000) {
      goldIcon.src = GOLD_ICONS.GOLD10;
  } else if (amount >= 10000000000) {
      goldIcon.src = GOLD_ICONS.GOLD9;
  } else if (amount >= 1000000000) {
      goldIcon.src = GOLD_ICONS.GOLD8;
  } else if (amount >= 100000000) {
      goldIcon.src = GOLD_ICONS.GOLD7;
  } else if (amount >= 10000000) {
      goldIcon.src = GOLD_ICONS.GOLD6;
  } else if (amount >= 1000000) {
      goldIcon.src = GOLD_ICONS.GOLD5;
  } else if (amount >= 100000) {
      goldIcon.src = GOLD_ICONS.GOLD4;
  } else if (amount >= 1000) {
      goldIcon.src = GOLD_ICONS.GOLD3;
  } else if (amount >= 100) {
      goldIcon.src = GOLD_ICONS.GOLD2;
  } else {
      goldIcon.src = GOLD_ICONS.GOLD1;
  }
}

function getCurrentMonsterStats(zone) {
    try {
        if (!zone) return null;

        const effectiveLevel = getEffectiveLevel(zone);
        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion] || 1;

        // Filter variants based on zone and level requirements
        const availableVariants = zone.variants.filter(variant => {
            // Check for specific level requirement (elite bosses)
            if (variant.level) {
                return effectiveLevel >= variant.level;
            }

            // Different monster progression for each zone
            if (currentRegion === "lumbridge") {
                if (currentZone === "cowpen") {
                    switch (variant.name) {
                        case "Cow":
                            return effectiveLevel <= 20; // Available only up to level 20
                        case "Dairy Cow":
                            return effectiveLevel >= 11 && effectiveLevel <= 40;
                        case "Zombie Cow":
                            return effectiveLevel >= 21 && effectiveLevel <= 60;
                        case "Zanaris Cow":
                            return effectiveLevel >= 41;
                        default:
                            return false;
                    }
                } 
                else if (currentZone === "lumbridgeswamp") {
                    switch (variant.name) {
                        case "Goblin":
                            return effectiveLevel <= 20;
                        case "Goblin Chief":
                            return effectiveLevel >= 11 && effectiveLevel <= 40;
                        case "Goblin Brute":
                            return effectiveLevel >= 21;
                        default:
                            return false;
                    }
                }
            } 
            else if (currentRegion === "varrock") {
                if (currentZone === "marketplace") {
                    switch (variant.name) {
                        case "Thief":
                            return effectiveLevel <= 20;
                        case "Guard":
                            return effectiveLevel >= 11 && effectiveLevel <= 40;
                        case "Elite Guard":
                            return effectiveLevel >= 21 && effectiveLevel <= 60;
                        case "Master Assassin":
                            return effectiveLevel >= 50;
                        default:
                            return false;
                    }
                } 
                else if (currentZone === "slums") {
                    switch (variant.name) {
                        case "Street Rat":
                            return effectiveLevel <= 20;
                        case "Gang Member":
                            return effectiveLevel >= 11 && effectiveLevel <= 40;
                        case "Gang Leader":
                            return effectiveLevel >= 21;
                        default:
                            return false;
                    }
                }
            }
            return true;
        });

        if (!availableVariants.length) return null;

        // Adjust weights based on level
        const adjustedVariants = availableVariants.map(variant => {
            let adjustedWeight = variant.weight;
            
            // Reduce weight of lower-tier monsters at higher levels
            if (effectiveLevel > 20) {
                if (variant.name === "Cow" || variant.name === "Goblin" || 
                    variant.name === "Thief" || variant.name === "Street Rat") {
                    adjustedWeight *= 0.5;
                }
            }
            if (effectiveLevel > 40) {
                if (variant.name === "Dairy Cow" || variant.name === "Goblin Chief" || 
                    variant.name === "Guard" || variant.name === "Gang Member") {
                    adjustedWeight *= 0.7;
                }
            }
            if (effectiveLevel > 60) {
                if (variant.name === "Zombie Cow" || variant.name === "Goblin Brute" || 
                    variant.name === "Elite Guard") {
                    adjustedWeight *= 0.8;
                }
            }

            return { ...variant, weight: adjustedWeight };
        });

        // Select random variant based on adjusted weights
        const totalWeight = adjustedVariants.reduce((sum, v) => sum + v.weight, 0);
        let random = Math.random() * totalWeight;
        const variant = adjustedVariants.find(v => {
            random -= v.weight;
            return random <= 0;
        }) || adjustedVariants[0];

        // Calculate stats using updated formulas
        const hp = calculateHP(effectiveLevel) * regionMultiplier;
        const goldValue = calculateBaseGold(effectiveLevel) * regionMultiplier;

        const monster = {
            name: `${variant.name} Lv${effectiveLevel}`,
            hp: hp,
            maxHp: hp,
            monsterDamage: Math.floor(variant.baseDamage * (1 + (effectiveLevel - 1) * 0.05) * regionMultiplier),
            image: Array.isArray(variant.images) ? 
                variant.images[Math.floor(Math.random() * variant.images.length)] : 
                variant.image,
            dropTable: variant.dropTable,
            goldValue: Math.ceil(goldValue),
            tier: variant.tier || 'C'
        };

        // Announce new monster types at certain level thresholds
        if (effectiveLevel % 10 === 1) {
            announceNewMonsterType(effectiveLevel, monster.name);
        }

        return monster;

    } catch (error) {
        console.error("Error getting monster stats:", error);
        return null;
    }
}

function announceNewMonsterType(level, monsterName) {
  if (level % 10 === 1) { // First level of each tier
      showLoot(`🆕 New monster type appeared: ${monsterName}!`, "S");
  }
}

function spawnEliteBoss(zone, eliteBoss) {
  try {
      if (!zone || !eliteBoss) return;

      clearInterval(player.bossTimer);
      player.bossTimer = null;

      player.currentBoss = {
          ...eliteBoss,
          hp: eliteBoss.baseHP,
          maxHp: eliteBoss.baseHP,
          isEliteBoss: true,
          level: zone.currentLevel
      };

      // Start boss timer
      player.bossTimeLeft = eliteBoss.timeLimit;
      updateBossTimer();

      player.bossTimer = setInterval(() => {
          player.bossTimeLeft--;
          updateBossTimer();

          if (player.bossTimeLeft <= 0) {
              handleBossTimeout(zone);
          }
      }, 1000);

      updateUI();
  } catch (error) {
      console.error("Error spawning elite boss:", error);
      showLoot("Error spawning elite boss", "error");
  }
}

function spawnMiniBoss(zone) {
    try {
        if (!zone || !zone.miniBoss) return;

        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion] || 1;
        const level = zone.currentLevel;

        // Calculate miniboss HP using the updated calculateHP function with 'true' flag for boss
        const baseHP = calculateHP(level, true);
        const scaledHP = Math.floor(baseHP * regionMultiplier);

        // Set current boss data
        player.currentBoss = {
            name: `${zone.miniBoss.name} Lv${level}`,
            hp: scaledHP,
            maxHp: scaledHP,
            damage: Math.floor(zone.miniBoss.damage * regionMultiplier),
            image: zone.miniBoss.image,
            dropTable: zone.miniBoss.dropTable,
            isMiniBoss: true,
            timeLimit: zone.miniBoss.timeLimit || GAME_CONFIG.COMBAT.MINI_BOSS_TIME_LIMIT / 1000
        };

        // Start boss timer
        player.bossTimeLeft = player.currentBoss.timeLimit;
        const bossTimer = document.getElementById("boss-timer");
        if (bossTimer) {
            bossTimer.style.display = "block";
            bossTimer.textContent = `Time Remaining: ${player.bossTimeLeft}s`;
        }

        // Start the timer interval
        clearInterval(player.bossTimer);
        player.bossTimer = setInterval(() => {
            player.bossTimeLeft--;
            if (bossTimer) {
                bossTimer.textContent = `Time Remaining: ${player.bossTimeLeft}s`;
            }
            if (player.bossTimeLeft <= 0) {
                handleBossTimeout(zone);
            }
        }, 1000);

        showLoot(`⚔️ Mini-boss ${zone.miniBoss.name} appeared!`, "S");
        updateUI();

    } catch (error) {
        console.error("Error spawning miniboss:", error);
        showLoot("Error spawning miniboss", "error");
    }
}

function calculateHP(level, isBoss = false) {
    try {
        let baseHP;
        
        // Level 1-140 scaling
        if (level <= 140) {
            baseHP = Math.ceil(10 * (level - 1 + Math.pow(1.55, level - 1)));
        }
        // Level 141-500 scaling
        else if (level <= 500) {
            const base140 = 10 * (139 + Math.pow(1.55, 139));
            const levelDiff = level - 140;
            baseHP = Math.ceil(base140 * Math.pow(1.145, levelDiff));
        }
        // Level 501-200000 scaling
        else if (level <= 200000) {
            const base500 = 10 * (139 + Math.pow(1.55, 139) * Math.pow(1.145, 360));
            let multiplier = 1;
            
            // Calculate dynamic scaling multiplier
            for (let i = 501; i <= level; i++) {
                multiplier *= (1.145 + 0.001 * Math.floor((i - 1) / 500));
            }
            
            baseHP = Math.ceil(base500 * multiplier);
        }
        // Level 200001+ scaling
        else {
            const levelDiff = level - 200001;
            baseHP = Math.ceil(Math.pow(1.545, levelDiff) * 1.240 * Math.pow(10, 25409) + (level - 1) * 10);
        }

        // Apply boss multiplier (10x for bosses)
        const bossMultiplier = isBoss ? 10 : 1;
        return Math.ceil(baseHP * bossMultiplier);

    } catch (error) {
        console.error("Error calculating HP:", error);
        return 100; // Fallback HP value
    }
}

function updateMiniBossUI() {
    try {
      if (!player.currentBoss) return;
  
      const monsterSprite = document.getElementById("monster-sprite");
      const monsterName = document.getElementById("monster-name");
      const healthText = document.getElementById("health-text");
      const healthBar = document.getElementById("health-bar");
      const variantIndicator = document.querySelector(".variant-indicator");
  
      if (monsterSprite) monsterSprite.src = `assets/${player.currentBoss.image}`;
      if (monsterName) monsterName.textContent = player.currentBoss.name;
      if (healthText)
        healthText.textContent = `${formatNumber(player.currentBoss.hp)}/${formatNumber(player.currentBoss.maxHp)} HP`;
      if (healthBar)
        healthBar.style.width = `${
          (player.currentBoss.hp / player.currentBoss.maxHp) * 100
        }%`;
      if (variantIndicator) {
        variantIndicator.className = "variant-indicator S-tier";
        variantIndicator.textContent = "S";
      }
    } catch (error) {
      console.error("Error updating miniboss UI:", error);
    }
  }

function updateBossTimer() {
  const bossTimer = document.getElementById("boss-timer");
  if (bossTimer && player.bossTimeLeft >= 0) {
    bossTimer.innerHTML = `Time Remaining: <span id="boss-time">${player.bossTimeLeft}</span>s`;
  }
}

function handleBossTimeout(zone) {
    try {
        // Clear timer
        clearInterval(player.bossTimer);
        player.bossTimer = null;
        
        // Reset boss state
        player.currentBoss = null;
        player.bossTimeLeft = 0;

        // Hide timer display
        const bossTimer = document.getElementById("boss-timer");
        if (bossTimer) {
            bossTimer.style.display = "none";
        }

        // Show failure message
        showLoot("Failed to defeat the boss in time!", "error");

        // Set player to the previous level and pause auto-progress
        if (zone.currentLevel > 1) {
            zone.currentLevel -= 1;
            isAutoProgressEnabled = false;
            updateAutoProgressButton();
        }

        // Spawn regular monster
        spawnMonster(zone);
        
        updateUI();
    } catch (error) {
        console.error("Error handling boss timeout:", error);
        showLoot("Error processing boss timeout", "error");
    }
}

function renderLevelSelect() {
    try {
        const levelSelect = document.querySelector('.level-select');
        if (!levelSelect) return;

        const zone = gameData.regions[currentRegion].zones[currentZone];
        
        // Always ensure completedLevels exists
        if (!Array.isArray(zone.completedLevels)) {
            zone.completedLevels = [];
        }

        const levelsPerPage = GAME_CONFIG.INVENTORY.LEVELS_PER_PAGE;
        const currentPageStart = Math.floor((zone.currentLevel - 1) / levelsPerPage) * levelsPerPage + 1;

        levelSelect.innerHTML = '';
        
        // Create level boxes
        for (let i = currentPageStart; i < currentPageStart + levelsPerPage; i++) {
            const levelBox = document.createElement('div');
            const isMiniBossLevel = i % GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL === 0;
            const isCompleted = zone.completedLevels.includes(i);
            const isActive = i === zone.currentLevel;
            // Only allow access to completed levels or the next available level
            const isAccessible = i <= Math.max(...zone.completedLevels, 0) + 1;
            
            levelBox.className = `level-box 
                ${isActive ? 'active' : ''} 
                ${isMiniBossLevel ? 'miniboss' : ''} 
                ${isCompleted ? 'completed' : ''}
                ${!isAccessible ? 'locked' : ''}`;
            
            levelBox.innerHTML = `
                <span class="level-number">${i}</span>
                ${isMiniBossLevel ? `<span class="boss-indicator">👑</span>` : ''}
            `;
            
            if (isAccessible) {
                levelBox.onclick = () => selectLevel(i);
            }
            
            levelSelect.appendChild(levelBox);
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-levels');
        const nextBtn = document.getElementById('next-levels');
        
        if (prevBtn) prevBtn.disabled = currentPageStart <= 1;
        if (nextBtn) {
            const maxLevel = Math.max(zone.highestLevel, zone.currentLevel) + 1;
            nextBtn.disabled = currentPageStart + levelsPerPage > maxLevel;
        }

    } catch (error) {
        console.error('Error rendering level select:', error);
        showLoot('Error updating level display', 'error');
    }
}

function updateHealthDisplay() {
    try {
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        const zone = gameData.regions[currentRegion].zones[currentZone];
        const monster = player.currentBoss || zone.monster;
        
        if (!monster) {
            console.error("No monster found for health display update");
            return;
        }
        
        // Update health bar width and color
        if (healthBar) {
            const healthPercent = (monster.hp / monster.maxHp) * 100;
            healthBar.style.width = `${healthPercent}%`;
            healthBar.style.backgroundColor = getHealthColor(healthPercent);
        }
  
        // Update health text with formatted numbers
        if (healthText) {
            const currentHealth = formatNumber(Math.floor(monster.hp));
            const maxHealth = formatNumber(Math.floor(monster.maxHp));
            healthText.textContent = `${currentHealth}/${maxHealth} HP`;
        }
    } catch (error) {
        console.error('Error updating health display:', error);
    }
}

function getHealthColor(percentage) {
  if (percentage > 50) return '#4CAF50';
  if (percentage > 25) return '#FFA500';
  return '#FF4444';
}

function setupLevelNavigation() {
  try {
      const prevBtn = document.getElementById('prev-levels');
      const nextBtn = document.getElementById('next-levels');

      if (!prevBtn || !nextBtn) return;

      // Remove existing listeners to prevent duplicates
      prevBtn.replaceWith(prevBtn.cloneNode(true));
      nextBtn.replaceWith(nextBtn.cloneNode(true));

      // Get fresh references
      const newPrevBtn = document.getElementById('prev-levels');
      const newNextBtn = document.getElementById('next-levels');

      // Navigate one level at a time
      newPrevBtn.addEventListener('click', () => {
          const zone = gameData.regions[currentRegion].zones[currentZone];
          if (zone.currentLevel > 1) {
              selectLevel(zone.currentLevel - 1);
          }
      });

      newNextBtn.addEventListener('click', () => {
          const zone = gameData.regions[currentRegion].zones[currentZone];
          if (zone.currentLevel < zone.highestLevel) {
              selectLevel(zone.currentLevel + 1);
          }
      });
  } catch (error) {
      console.error('Error setting up level navigation:', error);
      showLoot('Error setting up level navigation', 'error');
  }
}

function renderLevelSelectWithRange(startLevel) {
  try {
      const levelSelect = document.querySelector('.level-select');
      if (!levelSelect) return;

      const zone = gameData.regions[currentRegion].zones[currentZone];
      const maxLevel = Math.max(zone.highestLevel, zone.currentLevel);

      levelSelect.innerHTML = '';

      // Always create 9 slots in a horizontal layout
      for (let i = 0; i < 9; i++) {
          const levelNum = startLevel + i;
          const levelBox = document.createElement('div');
          
          if (levelNum <= maxLevel) {
              // Regular level box
              const isMiniBossLevel = levelNum % GAME_CONFIG_COMBAT.MINIBOSS_LEVEL_INTERVAL === 0;
              const isDefeated = zone.defeatedMiniBosses?.includes(levelNum);
              const isCompleted = zone.completedLevels.includes(levelNum);
              const isCurrentLevel = levelNum === zone.currentLevel;

              levelBox.className = `level-box 
                  ${isCurrentLevel ? 'active' : ''}
                  ${isMiniBossLevel ? 'miniboss' : ''}
                  ${isDefeated ? 'defeated' : ''}
                  ${isCompleted ? 'completed' : ''}`;

              levelBox.innerHTML = `
                  <span class="level-number">${levelNum}</span>
                  ${isMiniBossLevel ? `<span class="boss-indicator ${isDefeated ? 'defeated' : ''}">👑</span>` : ''}
              `;

              levelBox.onclick = () => selectLevel(levelNum);
          } else {
              // Placeholder box
              levelBox.className = 'level-box placeholder';
          }

          levelSelect.appendChild(levelBox);
      }

      // Update navigation buttons
      const prevBtn = document.getElementById('prev-levels');
      const nextBtn = document.getElementById('next-levels');
      
      if (prevBtn) prevBtn.disabled = startLevel <= 1;
      if (nextBtn) nextBtn.disabled = maxLevel - startLevel < 9;

  } catch (error) {
      console.error('Error rendering level select:', error);
      showLoot('Error updating level display', 'error');
  }
}

function validateSaveData(saveData) {
  try {
      if (!saveData || typeof saveData !== 'object') {
          return false;
      }

      const requiredProps = ['version', 'player', 'gameState', 'timestamp'];
      if (!requiredProps.every(prop => prop in saveData)) {
          return false;
      }

      const playerData = JSON.parse(saveData.player);
      const requiredPlayerProps = ['gold', 'damage', 'inventory', 'upgrades'];
      
      if (!requiredPlayerProps.every(prop => prop in playerData)) {
          return false;
      }

      return true;
  } catch (error) {
      console.error('Error validating save data:', error);
      return false;
  }
}

function updateRegionProgress() {
    try {
        const region = gameData.regions[currentRegion];
        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
        
        // Calculate zone completion
        const totalZones = Object.values(region.zones).filter(zone => zone.unlocked).length;
        const completedZones = Object.values(region.zones).filter(zone => 
            zone.unlocked && zone.currentLevel >= regionCap
        ).length;

        // Calculate miniboss completion
        const totalMiniBosses = Object.values(region.zones).filter(zone => 
            zone.unlocked
        ).length * (regionCap / GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL);
        
        const defeatedMiniBosses = Object.values(region.zones).reduce(
            (total, zone) => total + (zone.defeatedMiniBosses?.length || 0),
            0
        );

        // Update progress display
        const progressElement = document.getElementById("region-progress");
        if (progressElement) {
            progressElement.innerHTML = `
                <div>Zone Progress: ${completedZones}/${totalZones} at cap</div>
                <div>Mini-bosses: ${defeatedMiniBosses}/${Math.floor(totalMiniBosses)}</div>
            `;
        }

        return completedZones === totalZones && defeatedMiniBosses >= totalMiniBosses;
    } catch (error) {
        console.error("Error updating region progress:", error);
        return false;
    }
}

function selectLevel(level) {
    try {
        const zone = gameData.regions[currentRegion].zones[currentZone];
        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;

        // Validate level selection
        if (level > regionCap) {
            showLoot(`Cannot exceed level cap (${regionCap})!`, "error");
            return;
        }

        if (level > zone.highestLevel + 1) {
            showLoot("Must complete previous levels first!", "error");
            return;
        }

        // Clear any existing boss state
        if (player.currentBoss) {
            clearInterval(player.bossTimer);
            player.bossTimer = null;
            player.currentBoss = null;

            const bossTimer = document.getElementById("boss-timer");
            if (bossTimer) {
                bossTimer.style.display = "none";
            }
        }

        // Store previous level to check for level up
        const previousLevel = zone.currentLevel;
        
        // Set new level and reset kills
        zone.currentLevel = level;
        zone.currentKills = 0;

        // Update highest level if applicable
        if (level > zone.highestLevel) {
            zone.highestLevel = level;
            showLoot(`🎉 New highest level: ${level}!`, "S");
        }

        // Handle miniboss/elite boss levels
        const isMiniBossLevel = level % GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL === 0;
        if (isMiniBossLevel) {
            showLoot(`👑 Mini-boss encounter at level ${level}!`, "S");
            spawnMiniBoss(zone);
        } else {
            spawnMonster(zone);
        }

        // Mark current level as completed if level is increasing
        if (level > previousLevel && !zone.completedLevels.includes(previousLevel)) {
            zone.completedLevels.push(previousLevel);
            zone.completedLevels.sort((a, b) => a - b);
        }

        // Update UI and save
        updateItemValues(level);
        updateUI();
        renderLevelSelect();
        updateZoneDisplay(zone);
        saveGame();

    } catch (error) {
        console.error("Error selecting level:", error);
        showLoot("Error changing level", "error");
    }
}

function getEffectiveLevel(zone) {
    const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
    return Math.min(zone.currentLevel, regionCap);
}

function checkRegionCompletion(region) {
    try {
        if (!region) return false;

        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;

        // Check if all zones have reached the region's level cap
        const allZonesAtCap = Object.values(region.zones).every(zone => {
            // Skip locked zones
            if (!zone.unlocked) return false;
            return zone.currentLevel >= regionCap;
        });

        // Check if enough mini-bosses have been defeated
        const totalMiniBosses = Object.keys(region.zones).length * 
            (regionCap / GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL);
        const miniBossesDefeated = Object.values(region.zones).reduce(
            (total, zone) => total + (zone.defeatedMiniBosses?.length || 0),
            0
        );

        // If conditions are met and boss isn't defeated yet, show boss
        if (allZonesAtCap && miniBossesDefeated >= totalMiniBosses && !region.bossDefeated) {
            showBossConfirmation();
            return true;
        }

        return allZonesAtCap && region.bossDefeated;
    } catch (error) {
        console.error("Error checking region completion:", error);
        return false;
    }
}

function validateZoneData() {
    try {
        Object.values(gameData.regions).forEach(region => {
            Object.values(region.zones).forEach(zone => {
                // Ensure critical arrays exist
                if (!Array.isArray(zone.completedLevels)) {
                    zone.completedLevels = [];
                }
                if (!Array.isArray(zone.defeatedMiniBosses)) {
                    zone.defeatedMiniBosses = [];
                }
                
                // Ensure other essential properties
                if (!zone.monstersPerLevel) {
                    zone.monstersPerLevel = 10;
                }
                if (zone.currentLevel === undefined) {
                    zone.currentLevel = 1;
                }
                if (zone.highestLevel === undefined) {
                    zone.highestLevel = zone.currentLevel;
                }
                if (zone.currentKills === undefined) {
                    zone.currentKills = 0;
                }
            });
        });
    } catch (error) {
        console.error("Error validating zone data:", error);
    }
}

function handleLevelUp(zone) {
    try {
        // Always ensure completedLevels exists
        if (!Array.isArray(zone.completedLevels)) {
            zone.completedLevels = [];
        }
        
        // Reset kills for current level
        zone.currentKills = 0;

        // Mark current level as completed if not already done
        if (!zone.completedLevels.includes(zone.currentLevel)) {
            zone.completedLevels.push(zone.currentLevel);
            zone.completedLevels.sort((a, b) => a - b);
        }

        // Get region's level cap
        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;

        // Check if at level cap
        if (zone.currentLevel >= regionCap) {
            // Stay at cap level but show completion message
            showLoot(`🔄 Farming at level cap (${regionCap})!`, "S");
            spawnMonster(zone);
            
            // Check region completion
            checkRegionBossAvailability();
        } else {
            // Normal level up progression
            zone.currentLevel++;

            // Update highest level if needed
            if (zone.currentLevel > zone.highestLevel) {
                zone.highestLevel = zone.currentLevel;
                showLoot(`🎉 New highest level in ${formatZoneName(currentZone)}: ${zone.currentLevel}!`, "S");
            }

            // Handle zone name changes and interface updates
            updateZoneName(zone);

            // Spawn appropriate monster or boss
            if (zone.currentLevel % GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL === 0) {
                showLoot(`👑 Mini-boss encounter at level ${zone.currentLevel}!`, "S");
                spawnMiniBoss(zone);
            } else {
                spawnMonster(zone);
            }
        }

        // Update values and UI
        updateItemValues(zone.currentLevel);
        updateUI();
        renderLevelSelect();
        saveGame(); // Save after level changes
        checkZoneUnlocks(zone);

    } catch (error) {
        console.error("Error handling level up:", error);
        showLoot("Error processing level up", "error");
    }
}

// Helper function to update zone name display with animation
function updateZoneName(zone) {
    const zoneNameElement = document.getElementById("zone-name");
    if (!zoneNameElement) return;
    
    // Prepare for zone name change animations
    if (zone.currentLevel % 10 === 1) {
        zoneNameElement.classList.add("changing");
        setTimeout(() => zoneNameElement.classList.remove("changing"), 500);
        showLoot(`🌟 Entering new area: ${getZoneTitleForLevel(currentZone, zone.currentLevel)}!`, "S");
    }
    
    // Update background for major zone transitions (every 20 levels)
    if (zone.currentLevel % 20 === 1) {
        updateZoneBackground(currentZone, currentRegion);
    }
    
    // Update the zone name display
    zoneNameElement.textContent = getZoneTitleForLevel(currentZone, zone.currentLevel);
}

const AUTO_PROGRESS_DELAY = GAME_CONFIG.AUTO_PROGRESS.DELAY;

function handleMonsterDeath(zone) {
    try {
        if (!zone || !zone.monster) {
            console.error("Invalid zone or monster");
            return;
        }

        // Increment monster kill count and add gold
        player.stats.monstersKilled++;
        const goldEarned = zone.monster.goldValue;
        awardGold(goldEarned);

        // Handle regular monster drops
        if (!player.currentBoss) {
            lootItem(zone.monster.dropTable);
            zone.currentKills++;
            
            // Check for level completion
            if (zone.currentKills >= zone.monstersPerLevel) {
                // Call handleLevelUp instead of implementing level logic here
                handleLevelUp(zone);
            } else {
                // Not at level completion, spawn next monster
                spawnMonster(zone);
            }
        }

        // Update UI and save
        checkAchievements();
        updateUI();
        renderLevelSelect();
        updateInventory();
        saveGame();

        // Emit event to update champions panel
        EventSystem.emit('championsPanelUpdate');

    } catch (error) {
        console.error("Error handling monster death:", error);
        showLoot("Error processing monster death", "error");
    }
}

function spawnMonster(zone) {
    try {
        if (!zone) return;
        if (player.currentBoss) return;

        // Get new monster stats
        zone.monster = getCurrentMonsterStats(zone);

        // Update monster display
        const monsterSprite = document.getElementById('monster-sprite');
        if (monsterSprite && zone.monster) {
            // If monster has multiple images, pick one randomly
            if (Array.isArray(zone.monster.images)) {
                const randomIndex = Math.floor(Math.random() * zone.monster.images.length);
                monsterSprite.src = `assets/${zone.monster.images[randomIndex]}`;
            } else {
                // Fallback to single image
                monsterSprite.src = `assets/${zone.monster.image}`;
            }
        }

        // Immediately update displays
        updateHealthDisplay();
        updateProgressBar();
        updateUI();
    } catch (error) {
        console.error('Error spawning monster:', error);
        showLoot('Error spawning monster', 'error');
    }
}

function handleTabSwitching(panelSelector, tabSelector, activeClass) {
  const panel = document.querySelector(panelSelector);
  if (!panel) return;

  const tabs = panel.querySelectorAll(tabSelector);
  const panels = panel.querySelectorAll('.osrs-panel');

  tabs.forEach(tab => {
      tab.addEventListener('click', () => {
          // Only remove active class from tabs within the same panel
          tabs.forEach(t => t.classList.remove(activeClass));
          tab.classList.add(activeClass);

          // Only hide panels within the same panel container
          panels.forEach(p => p.classList.remove('active'));

          // Show the corresponding panel
          const panelId = tab.getAttribute('data-panel') + '-panel';
          const targetPanel = panel.querySelector(`#${panelId}`);
          if (targetPanel) {
              targetPanel.classList.add('active');
          }
      });
  });
}

// Add this function to handle tab switching
function handleTabSwitch(tabId) {
  try {
      if (tabId === 'achievements') {
        renderAchievements();
        }
  } catch (error) {
      console.error('Error handling tab switch:', error);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(`Failed to load: ${src}`);
      img.src = src;
  });
}

function handleBossDefeat(zone) {
    try {
        if (!zone) {
            console.error("Invalid zone in handleBossDefeat");
            return;
        }

        // Handle mini-boss defeat
        if (player.currentBoss?.isMiniBoss) {
            // Initialize defeatedMiniBosses array if it doesn't exist
            if (!zone.defeatedMiniBosses) {
                zone.defeatedMiniBosses = [];
            }

            // Track first-time defeat
            if (!zone.defeatedMiniBosses.includes(zone.currentLevel)) {
                zone.defeatedMiniBosses.push(zone.currentLevel);
                zone.defeatedMiniBosses.sort((a, b) => a - b);

                const region = gameData.regions[currentRegion];
                region.miniBossesDefeated++;

                showLoot(`🎯 First time ${player.currentBoss.name} defeat!`, "S");
            }

            // Progress to next level after miniboss defeat
            const nextLevel = zone.currentLevel + 1;
            const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;

            if (nextLevel <= regionCap) {
                if (isAutoProgressEnabled) {
                    setTimeout(() => {
                        zone.currentLevel = nextLevel;
                        zone.currentKills = 0;
                        if (nextLevel > zone.highestLevel) {
                            zone.highestLevel = nextLevel;
                            showLoot(`🎉 New highest level: ${nextLevel}!`, "S");
                        }
                        spawnMonster(zone);
                        updateUI();
                        renderLevelSelect();
                    }, GAME_CONFIG.AUTO_PROGRESS.DELAY);
                } else {
                    zone.currentLevel = nextLevel;
                    zone.currentKills = 0;
                    if (nextLevel > zone.highestLevel) {
                        zone.highestLevel = nextLevel;
                        showLoot(`🎉 New highest level: ${nextLevel}!`, "S");
                    }
                    spawnMonster(zone);
                }
            }
        }

        // Clear boss state
        clearInterval(player.bossTimer);
        player.bossTimer = null;

        // Add loot and update stats
        if (player.currentBoss.dropTable) {
            lootItem(player.currentBoss.dropTable);
        }
        player.stats.bossesKilled++;

        // Calculate and add gold reward
        const baseGold = calculateBaseGold(zone.currentLevel, true);
        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion] || 1;
        const goldReward = Math.floor(baseGold * regionMultiplier * 
            (player.currentBoss.isEliteBoss ? 3 : 2));
        
            awardGold(goldEarned);

        // Reset boss state
        player.currentBoss = null;
        
        // Hide boss timer display
        const bossTimer = document.getElementById("boss-timer");
        if (bossTimer) {
            bossTimer.style.display = "none";
        }

        // Resume auto-progress if it was paused due to a failed boss fight
        if (!isAutoProgressEnabled) {
            isAutoProgressEnabled = true;
            updateAutoProgressButton();
        }

        // Update UI and save
        updateItemValues(zone.currentLevel);
        checkAchievements();
        updateUI();
        renderLevelSelect();
        updateInventory();
        saveGame();

    } catch (error) {
        console.error("Error handling boss defeat:", error);
        showLoot("Error processing boss defeat", "error");
    }
}

function handleRegionBossDefeat(region) {
  try {
    // Handle region boss defeat
    region.bossDefeated = true;
    clearInterval(player.bossTimer);
    player.bossTimer = null;
    player.currentBoss = null;

    if (region.name === "Lumbridge" && player.prestigeLevel >= 1) {
        unlockVarrock();
    }

    // Show prestige button
    const prestigeBtn = document.getElementById("prestige-btn");
    if (prestigeBtn) {
      prestigeBtn.style.display = "block";
      prestigeBtn.onclick = handlePrestige; // Add click handler
    }

    showLoot("🎉 Region Boss defeated! You can now prestige!", "S");

    updateUI();
    saveGame();
  } catch (error) {
    console.error("Error handling region boss defeat:", error);
    showLoot("Error processing region boss defeat", "error");
  }
}

function unlockVarrock() {
    const lumbridgeRegion = gameData.regions.lumbridge;
    if (lumbridgeRegion.bossDefeated && player.prestigeLevel >= 1) {
        gameData.regions.varrock.unlocked = true;
        showLoot("🏰 Varrock Unlocked!", "S");
        renderRegionTabs();
    } else {
        showLoot("Defeat Lumbridge Giant and prestige once to unlock Varrock!", "error");
    }
}

function initializeRegionMechanics() {
    switch(currentRegion) {
        case "varrock":
            // Add region-specific mechanics
            startPatrolSystem();
            initializeGuardAlertLevel();
            break;
        // ... other regions
    }
}

function startPatrolSystem() {
    // Add guard patrols that increase difficulty
    setInterval(() => {
        if (currentRegion === "varrock") {
            increaseGuardPresence();
        }
    }, 60000); // Every minute
}

function handlePrestige() {
    try {
        const region = gameData.regions[currentRegion];
        
        // Check if all requirements are met
        if (!checkRegionCompletion(region)) {
            showLoot("Must reach level cap in all zones and defeat region boss to prestige!", "error");
            return;
        }

        // Reset current region progress
        Object.values(region.zones).forEach((zone) => {
            zone.currentLevel = 1;
            zone.highestLevel = 1;
            zone.currentKills = 0;
            zone.completedLevels = [];
        });

        region.bossDefeated = false;

        // Unlock Varrock after prestiging Lumbridge
        if (currentRegion === "lumbridge" && !gameData.regions.varrock.unlocked) {
            gameData.regions.varrock.unlocked = true;
            unlockNewRegion("varrock");
            showLoot("🏰 New Region Unlocked: Varrock!", "S");
        }

        renderRegionTabs();

        // Increment prestige level and update stats
        player.prestigeLevel++;
        player.damage *= 1.5; // Add damage bonus for prestiging

        // Hide prestige button
        const prestigeBtn = document.getElementById("prestige-btn");
        if (prestigeBtn) prestigeBtn.style.display = "none";

        showLoot(`🌟 Prestiged ${region.name} to level ${player.prestigeLevel}!`, "S");

        // Update UI and save
        updateUI();
        saveGame();
    } catch (error) {
        console.error("Error handling prestige:", error);
        showLoot("Error processing prestige", "error");
    }
}

// Add this new function to handle region unlocking
function unlockNewRegion(regionName) {
  try {
    const region = gameData.regions[regionName];
    if (!region) return;

    // Add region tab
    const regionTabs = document.querySelector(".region-tabs");
    if (regionTabs) {
        const tab = document.createElement("button");
        tab.className = "osrs-tab";
        tab.dataset.region = regionName;
        tab.innerHTML = `<span>${region.name}</span>`;
        tab.onclick = () => switchRegion(regionName);
        regionTabs.appendChild(tab);
    }

    // Initialize region data if needed
    if (!region.zones || Object.keys(region.zones).length === 0) {
      // Add Varrock zones here
      region.zones = {
        marketplace: {
          name: "Marketplace",
          currentLevel: 1,
          highestLevel: 1,
          completedLevels: [],
          monstersPerLevel: 10,
          currentKills: 0,
          levelScaling: {
            hp: 1.25,
            damage: 1.15,
            gold: 1.2,
          },
          monster: null,
          variants: [
            // Add Varrock monsters here
            {
              name: "Thief",
              baseHP: 40,
              baseDamage: 4,
              image: "thief.png",
              weight: 100,
              tier: "C",
              dropTable: [
                { item: "Stolen Valuables", chance: 0.7, tier: "C" },
                { item: "Lockpick", chance: 0.3, tier: "C" },
              ],
            },
            // Add more variants...
          ],
          miniBoss: {
            name: "Master Thief",
            hp: 1000,
            maxHP: 1000,
            damage: 10,
            image: "master_thief.png",
            timeLimit: 60,
            dropTable: [{ item: "Thief's Cape", chance: 1, tier: "A" }],
            unlocked: false,
          },
        },
        // Add more zones...
      };
    }

    showLoot(`🌟 ${region.name} is now available!`, "S");
  } catch (error) {
    console.error("Error unlocking new region:", error);
    showLoot("Error unlocking new region", "error");
  }
}

function showBossConfirmation() {
    try {
        const region = gameData.regions[currentRegion];
        
        // Double check completion requirements
        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
        const incompleteZones = Object.entries(region.zones)
            .filter(([_, zone]) => zone.unlocked && zone.currentLevel < regionCap)
            .map(([name, _]) => name);

        if (incompleteZones.length > 0) {
            showLoot(`Complete all zones to level ${regionCap} first!`, "error");
            return;
        }

        const modalContainer = document.getElementById("modal-container");
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h2>Region Boss Available!</h2>
                    <p>All zones in ${region.name} have reached level cap ${regionCap}!</p>
                    <p>You will face the ${region.regionBoss.name}.</p>
                    <div class="boss-stats">
                        <p>💗 HP: ${formatNumber(region.regionBoss.hp)}</p>
                        <p>⚔️ Damage: ${formatNumber(region.regionBoss.damage)}</p>
                        <p>⏱️ Time Limit: ${region.regionBoss.timeLimit}s</p>
                    </div>
                    <div class="modal-buttons">
                        <button class="osrs-button" id="fight-boss-btn">Fight Boss</button>
                        <button class="osrs-button" id="close-modal-btn">Not Now</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("fight-boss-btn").addEventListener("click", () => {
            startRegionBoss();
            closeModal();
        });

        document.getElementById("close-modal-btn").addEventListener("click", closeModal);
        modalContainer.style.display = "flex";

    } catch (error) {
        console.error("Error showing boss confirmation:", error);
        showLoot("Error showing boss confirmation", "error");
    }
}

function startRegionBoss() {
  try {
      const region = gameData.regions[currentRegion];
      if (!region.regionBoss) {
          showLoot("Error: Region boss not defined", "error");
          return;
      }

      player.currentBoss = {
          name: region.regionBoss.name,
          hp: region.regionBoss.hp,
          maxHp: region.regionBoss.maxHP,
          damage: region.regionBoss.damage,
          image: region.regionBoss.image,
          dropTable: region.regionBoss.dropTable,
          isRegionBoss: true,
          timeLimit: region.regionBoss.timeLimit || 120
      };

      // Start the boss timer
      startBossTimer(player.currentBoss.timeLimit);
      
      // Hide region boss button during fight
      const regionBossBtn = document.getElementById("region-boss-btn");
      if (regionBossBtn) {
          regionBossBtn.style.display = "none";
      }

      updateUI();
      showLoot(`⚔️ Started fight with ${region.regionBoss.name}!`, "S");

  } catch (error) {
      console.error("Error starting region boss:", error);
      showLoot("Error starting boss fight", "error");
  }
}

function renderRegionTabs() {
  try {
      const regionTabs = document.querySelector(".region-tabs");
      if (!regionTabs) return;

      regionTabs.innerHTML = ''; // Clear existing tabs

      // Add tabs for all unlocked regions
      Object.entries(gameData.regions).forEach(([regionId, region]) => {
          if (region.unlocked) {
              const tab = document.createElement("button");
              tab.className = `osrs-tab ${regionId === currentRegion ? "active" : ""}`;
              tab.dataset.region = regionId;
              tab.innerHTML = `<span>${region.name}</span>`;
              tab.onclick = () => switchRegion(regionId);
              regionTabs.appendChild(tab);
          }
      });
  } catch (error) {
      console.error("Error rendering region tabs:", error);
      showLoot("Error updating region tabs", "error");
  }
}

function prestige() {
  try {
    // Reset player progress but keep unlocked regions
    player.prestigeLevel++;
    player.gold = 0;
    player.damage = 1;
    player.luck = 1.0;
    player.inventory = [];
    player.upgrades = [];

    // Reset zone levels but keep collection log
    Object.values(gameData.regions).forEach((region) => {
      Object.values(region.zones).forEach((zone) => {
        zone.currentLevel = 1;
        zone.highestLevel = 1;
        zone.completedLevels = [];
        zone.currentKills = 0;
        zone.miniBoss.unlocked = false;
      });
      region.miniBossesDefeated = 0;
      region.bossDefeated = false;
    });

    // Reset current zone to cowpen
    currentZone = "cowpen";
    player.currentZone = "cowpen";

    // Update UI
    spawnMonster(gameData.regions[currentRegion].zones[currentZone]);
    updateUI();
    renderLevelSelect();
    renderShop();

    showLoot(`🌟 Prestiged to level ${player.prestigeLevel}!`, "S");

    // Hide prestige button
    document.getElementById("prestige-btn").style.display = "none";
  } catch (error) {
    console.error("Error during prestige:", error);
    showLoot("Error processing prestige", "error");
  }
}

function startBossTimer(timeLimit) {
  try {
      const bossTimer = document.getElementById("boss-timer");
      if (!bossTimer) return;

      // Clear any existing timer
      if (player.bossTimer) {
          clearInterval(player.bossTimer);
      }

      // Initialize timer state
      player.bossTimeLeft = timeLimit;
      bossTimer.style.display = "block";
      bossTimer.textContent = `Time Remaining: ${timeLimit}s`;

      // Start the timer
      player.bossTimer = setInterval(() => {
          player.bossTimeLeft--;
          bossTimer.textContent = `Time Remaining: ${player.bossTimeLeft}s`;

          if (player.bossTimeLeft <= 0) {
              handleBossTimeout();
          }
      }, 1000);
  } catch (error) {
      console.error("Error starting boss timer:", error);
      showLoot("Error starting boss timer", "error");
  }
}

// Helper function to calculate damage for higher tiers
function calculateWeaponDamage(tier) {
  return Math.floor(2 * Math.pow(1.2, tier - 1));
}

// You can use this to generate more tiers programmatically
function generateMoreWeaponTiers(startingTier = 17, numberOfTiers = 10) {
  let currentTier = shopItems.lumbridge[0];
  // Navigate to the last existing tier
  while (currentTier.nextTier) {
      currentTier = currentTier.nextTier;
  }

  // Add new tiers
  for (let i = startingTier; i < startingTier + numberOfTiers; i++) {
      currentTier.nextTier = {
          name: `Transcendent Sword ${i-15}`,
          price: calculateWeaponPrice(i),
          effect: { damage: calculateWeaponDamage(i) },
          type: "weapon"
      };
      currentTier = currentTier.nextTier;
  }
}

function findCurrentTier(itemType) {
  // Get base item of this type
  let currentItem = shopItems[currentRegion].find(
    (item) => item.type === itemType
  );

  // Get all owned upgrades of this type
  const ownedUpgrades = player.upgrades.filter((upgradeName) => {
    let item = currentItem;
    while (item) {
      if (item.name === upgradeName) return true;
      item = item.nextTier;
    }
    return false;
  });

  // Advance through tiers based on owned upgrades
  for (let i = 0; i < ownedUpgrades.length; i++) {
    if (currentItem.nextTier) {
      currentItem = currentItem.nextTier;
    }
  }

  return currentItem;
}

function renderEquipmentShop() {
  try {
      const types = ["weapon", "auto", "luck"];
      return types.map(type => {
          const nextUpgrade = getNextUpgrade(type);
          if (!nextUpgrade) return '';

          const canAfford = player.gold >= nextUpgrade.price;
          const buttonState = !canAfford ? "disabled" : "";
          const buttonText = player.upgrades.includes(nextUpgrade.name) ? "Owned" : "Purchase";

          return `
              <div class="shop-item">
                  <div class="item-header">
                      <span class="item-name">${nextUpgrade.name}</span>
                  </div>
                  <div class="item-body">
                      <div class="item-effects">
                          ${nextUpgrade.effect.damage ? `<div class="effect">⚔️ +${nextUpgrade.effect.damage} Damage</div>` : ""}
                          ${nextUpgrade.effect.luck ? `<div class="effect">🍀 +${nextUpgrade.effect.luck}</div>` : ""}
                          ${nextUpgrade.effect.interval ? `<div class="effect">⏱ ${nextUpgrade.effect.interval / 1000}s Interval</div>` : ""}
                      </div>
                      <div class="item-footer">
                          <span class="item-price ${canAfford ? "can-afford" : "cannot-afford"}">
                              💰 ${nextUpgrade.price}
                          </span>
                          <button class="osrs-button" 
                              onclick="buyItem('${nextUpgrade.name}')"
                              ${buttonState}>
                              ${buttonText}
                          </button>
                      </div>
                  </div>
                  ${nextUpgrade.nextTier ? `<div class="upgrade-path">⏫ Next: ${nextUpgrade.nextTier.name}</div>` : ""}
              </div>
          `;
      }).join('');
  } catch (error) {
      console.error('Error rendering equipment shop:', error);
      return '';
  }
}

function renderShop() {
  try {
      const container = DOMCache.get(".shop-items-container");
      if (!container) return;

      // Show different shop content based on region
      if (currentRegion === "varrock") {
          container.innerHTML = `
          <div class="shop-sections">
              <div class="shop-section equipment-section">
                  <h3 class="shop-title">🛒 General Store</h3>
                  ${renderEquipmentShop()}
              </div>
          </div>
      `;
      } else {
          // Regular Lumbridge Shop
          container.innerHTML = `
              <div class="shop-sections">
                  <div class="shop-section equipment-section">
                      <h3 class="shop-title">🛒 Lumbridge General Store</h3>
                      ${renderEquipmentShop()}
                  </div>
              </div>
          `;
      }

  } catch (error) {
      console.error('Error rendering shop:', error);
      showLoot('Error loading shop', 'error');
  }
}

function buyItem(itemName) {
  try {
      const item = findItemByName(itemName);
      if (!item) return false;

      if (player.gold < item.price) {
          showLoot(`Not enough gold! Need ${item.price - player.gold} more gold`, "error");
          return false;
      }

      if (player.upgrades.includes(itemName)) {
          showLoot("You already own this item!", "error");
          return false;
      }

      // Purchase the item
      player.gold -= item.price;
      player.upgrades.push(itemName);

      // Apply other effects
      if (item.effect.damage) player.damage += item.effect.damage;
      if (item.effect.luck) player.luck += item.effect.luck;

      updateUI();
      renderShop();
      saveGame();

      showLoot(`Purchased ${itemName}!`, "S");
      return true;
  } catch (error) {
      console.error("Error during purchase:", error);
      showLoot("Error during purchase", "error");
      return false;
  }
}

function applyItemEffect(effect) {
  if (effect.damage) player.damage += effect.damage;
  if (effect.luck) player.luck += effect.luck;
}

function findItemByName(name) {
  // First check base items
  for (const item of shopItems[currentRegion]) {
    if (item.name === name) return item;

    // Check upgrade path
    let currentTier = item.nextTier;
    while (currentTier) {
      if (currentTier.name === name) return currentTier;
      currentTier = currentTier.nextTier;
    }
  }
  return null;
}

// Add this helper function to get next upgrade for an item type
function getNextUpgrade(type) {
  const baseItem = shopItems[currentRegion].find((item) => item.type === type);
  if (!baseItem) return null;

  let currentTier = baseItem;
  while (currentTier) {
    if (!player.upgrades.includes(currentTier.name)) {
      return currentTier;
    }
    currentTier = currentTier.nextTier;
  }
  return null;
}

function toggleSellButton(amount) {
  try {
      // Update selected amount
      player.selectedSellAmount = amount;

      // Update button appearances
      document.querySelectorAll('.sell-batch-btn').forEach(btn => {
          const btnAmount = btn.dataset.amount === 'max' ? 'max' : parseInt(btn.dataset.amount);
          btn.classList.toggle('active', btnAmount === amount);
      });

      // Save the selected amount
      saveGame();
  } catch (error) {
      console.error('Error toggling sell button:', error);
  }
}

function sellItem(itemName) {
  try {
      const itemIndex = player.inventory.indexOf(itemName);
      if (itemIndex === -1) return;

      const itemInfo = itemData[itemName];
      if (!itemInfo) {
          console.error("Invalid item:", itemName);
          return;
      }

      // Hide tooltip before selling
      hideItemTooltip();

      const price = itemInfo.value;
      player.gold += price;
      player.inventory.splice(itemIndex, 1);
      player.stats.totalGoldEarned += price;

      updateInventory();
      updateUI();

      showLoot(`Sold ${itemName} for ${price} gold!`, itemInfo.tier);
      saveGame();
  } catch (error) {
      console.error("Error selling item:", error);
      showLoot("Error selling item", "error");
  }
}

function initializeSellButtons() {
  try {
      const sellButtonsContainer = document.querySelector('.sell-buttons');
      if (!sellButtonsContainer) return;

      sellButtonsContainer.innerHTML = `
          <button class="sell-batch-btn active" data-amount="1">Sell 1x</button>
          <button class="sell-batch-btn" data-amount="5">Sell 5x</button>
          <button class="sell-batch-btn" data-amount="10">Sell 10x</button>
          <button class="sell-batch-btn" data-amount="max">Sell All</button>
      `;

      // Add event listeners
      document.querySelectorAll('.sell-batch-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              const amount = btn.dataset.amount === 'max' ? 'max' : parseInt(btn.dataset.amount);
              toggleSellButton(amount);
          });
      });

      // Set initial state
      toggleSellButton(player.selectedSellAmount || 1);
  } catch (error) {
      console.error('Error initializing sell buttons:', error);
  }
}

function sellStackedItem(itemName) {
  try {
      const itemInfo = itemData[itemName];
      if (!itemInfo) return;

      // Count items
      const count = player.inventory.filter(item => item === itemName).length;
      if (count === 0) return;

      // Hide tooltip immediately before any selling operation
      hideItemTooltip();

      // Calculate how many to sell based on selected amount
      let sellAmount;
      if (player.selectedSellAmount === 'max') {
          sellAmount = count;
      } else {
          sellAmount = Math.min(count, player.selectedSellAmount || 1); // Default to 1 if not set
      }

      // Calculate total value
      const totalValue = itemInfo.value * sellAmount;

      // Remove items
      let remainingToRemove = sellAmount;
      player.inventory = player.inventory.filter(item => {
          if (item === itemName && remainingToRemove > 0) {
              remainingToRemove--;
              return false;
          }
          return true;
      });

      // Update player gold and stats
      player.gold += totalValue;
      player.stats.totalGoldEarned += totalValue;

      // Update UI
      updateInventory();
      updateUI();

      // Show message
      const message = sellAmount > 1 
          ? `Sold ${sellAmount}x ${itemName} for ${totalValue} gold!`
          : `Sold ${itemName} for ${totalValue} gold!`;
      showLoot(message, itemInfo.tier);
      
      saveGame();
  } catch (error) {
      console.error('Error selling stacked item:', error);
      showLoot('Error selling items', 'error');
  }
}

// Helper function to get item tier
function getTierForItem(itemName) {
  if (itemName in itemPrices) {
    const price = itemPrices[itemName];
    if (price >= 1000) return "S";
    if (price >= 200) return "A";
    if (price >= 100) return "B";
    return "C";
  }
  return "C";
}

function updateAutoProgressButton() {
    const button = document.getElementById('auto-progress');
    if (button) {
        button.classList.toggle('active', isAutoProgressEnabled);
        button.querySelector('.auto-icon').textContent = isAutoProgressEnabled ? '⏸️' : '▶️';
        button.querySelector('.status-text').textContent = 
            isAutoProgressEnabled ? 'Pause Progress' : 'Auto-Progress';
    }
}

function loadGame() {
    try {
        const savedGame = localStorage.getItem("gameSave");
        if (!savedGame) return false;
        
        // Extra validation for corrupt saves
        if (savedGame === "[object Object]") {
            console.error("Invalid save format detected");
            showLoot("Save data corrupted. Loading backup...", "error");
            return loadBackupSave();
        }

        // Parse the save data
        let saveData;
        try {
            saveData = JSON.parse(savedGame);
        } catch (parseError) {
            console.error("Error parsing save data:", parseError);
            return loadBackupSave();
        }

        // Version check
        if (saveData.version !== GAME_CONFIG.VERSION.NUMBER) {
            return handleVersionMigration(saveData);
        }

        // Access player data directly - it's no longer stringified in saveData
        const playerData = saveData.player || {};

        // Initialize the player object first
        validatePlayerObject();
        
        // Then load player data with defaults
        player.gold = playerData.gold || 0;
        player.damage = playerData.damage || 1;
        player.inventory = Array.isArray(playerData.inventory) ? [...playerData.inventory] : [];
        player.prestigeLevel = playerData.prestigeLevel || 0;
        player.luck = playerData.luck || 1.0;
        player.upgrades = Array.isArray(playerData.upgrades) ? [...playerData.upgrades] : [];
        player.collectionLog = Array.isArray(playerData.collectionLog) ? [...playerData.collectionLog] : [];
        player.selectedSellAmount = playerData.selectedSellAmount || 1;
        
        // Load stats with defaults
        player.stats = {
            monstersKilled: playerData.stats?.monstersKilled || 0,
            bossesKilled: playerData.stats?.bossesKilled || 0,
            totalGoldEarned: playerData.stats?.totalGoldEarned || 0
        };
        
        player.settings = {
            autoSave: playerData.settings?.autoSave ?? true,
            notifications: playerData.settings?.notifications ?? true,
            championsPaused: playerData.settings?.championsPaused ?? false
        };
        
        // Set the champion pause state
        isChampionsPaused = player.settings.championsPaused || false;
        
        // Update the champion pause toggle state
        const championsPauseToggle = document.getElementById('champions-pause-toggle');
        if (championsPauseToggle) {
            championsPauseToggle.checked = isChampionsPaused;
        }
        
        // Load champions data properly
        player.champions = {
            owned: {},
            totalDPS: playerData.champions?.totalDPS || 0
        };
        
        // Process each champion individually
        if (playerData.champions?.owned) {
            Object.entries(playerData.champions.owned).forEach(([championId, data]) => {
                if (data) {
                    player.champions.owned[championId] = {
                        level: data.level || 0,
                        currentDPS: data.currentDPS || 0,
                        clickDamageBonus: data.clickDamageBonus || 0,
                        minimized: data.minimized || false,
                        upgrades: Array.isArray(data.upgrades) ? [...data.upgrades] : []
                    };
                }
            });
        }

        // Load game state
        currentRegion = saveData.gameState.currentRegion || "lumbridge";
        currentZone = saveData.gameState.currentZone || "cowpen";
        isAutoProgressEnabled = saveData.gameState.isAutoProgressEnabled || false;

        // Load region data
        if (saveData.gameState.regions) {
            Object.entries(saveData.gameState.regions).forEach(([regionName, regionData]) => {
                if (gameData.regions[regionName]) {
                    gameData.regions[regionName].unlocked = regionData.unlocked;
                    gameData.regions[regionName].miniBossesDefeated = regionData.miniBossesDefeated || 0;
                    gameData.regions[regionName].bossDefeated = regionData.bossDefeated || false;

                    // Load zone data
                    Object.entries(regionData.zones || {}).forEach(([zoneName, zoneData]) => {
                        if (gameData.regions[regionName].zones[zoneName]) {
                            gameData.regions[regionName].zones[zoneName].unlocked = zoneData.unlocked || false;
                            gameData.regions[regionName].zones[zoneName].currentLevel = zoneData.currentLevel || 1;
                            gameData.regions[regionName].zones[zoneName].highestLevel = zoneData.highestLevel || 1;
                            gameData.regions[regionName].zones[zoneName].completedLevels = 
                                Array.isArray(zoneData.completedLevels) ? [...zoneData.completedLevels] : [];
                            gameData.regions[regionName].zones[zoneName].currentKills = zoneData.currentKills || 0;
                            gameData.regions[regionName].zones[zoneName].defeatedMiniBosses = 
                                Array.isArray(zoneData.defeatedMiniBosses) ? [...zoneData.defeatedMiniBosses] : [];
                            gameData.regions[regionName].zones[zoneName].monstersPerLevel = zoneData.monstersPerLevel || 10;
                        }
                    });
                }
            });
        }

        // Load achievements state
        if (saveData.achievements && Array.isArray(saveData.achievements)) {
            saveData.achievements.forEach(savedAchievement => {
                const achievement = ACHIEVEMENTS.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.unlocked = savedAchievement.unlocked || false;
                }
            });
        }

        // Validate zone data after loading
        validateZoneData();

        // Update UI states
        updateAutoProgressButton();
        updateUI();
        renderChampionsPanel();
        renderLevelSelect();
        updateZoneBackground(currentZone, currentRegion);
        renderCollectionLog();
        renderAchievements();
        
        // Initialize current monster
        const zone = gameData.regions[currentRegion].zones[currentZone];
        spawnMonster(zone);

        showLoot("Game loaded successfully!", "info");
        return true;

    } catch (error) {
        console.error("Error loading game:", error);
        showLoot("Error loading game. Attempting to load backup...", "error");
        return loadBackupSave();
    }
}

function validateGameData() {
    validatePlayerObject();
    validateZoneData();
    
    // Ensure all champions have necessary properties
    Object.entries(player.champions.owned || {}).forEach(([championId, data]) => {
        if (!Array.isArray(data.upgrades)) {
            data.upgrades = [];
        }
    });
    
    // Check that all achievements are tracked
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.unlocked === undefined) {
            achievement.unlocked = false;
        }
    });
}

// Call this periodically to maintain data integrity
setInterval(validateGameData, 60000); // Every minute

function loadBackupSave() {
    try {
        // Try each backup save in order
        for (let i = 0; i < GAME_CONFIG.SAVE.BACKUP_COUNT; i++) {
            const backupKey = `gameSaveBackup_${i}`;
            const backupSave = localStorage.getItem(backupKey);
            
            if (backupSave && backupSave !== "[object Object]") {
                try {
                    // Verify it's valid JSON
                    JSON.parse(backupSave);
                    
                    // Use this backup
                    console.log(`Trying backup save ${i}`);
                    localStorage.setItem("gameSave", backupSave);
                    const success = loadGame();
                    
                    if (success) {
                        showLoot(`Loaded from backup save #${i+1}`, "info");
                        return true;
                    }
                } catch (parseError) {
                    console.error(`Backup ${i} is corrupted:`, parseError);
                }
            }
        }

        // If we get here, no backup worked - clear saves and start fresh
        console.error("All saves are corrupted. Starting new game.");
        localStorage.removeItem("gameSave");
        for (let i = 0; i < GAME_CONFIG.SAVE.BACKUP_COUNT; i++) {
            localStorage.removeItem(`gameSaveBackup_${i}`);
        }
        
        showLoot("All saves were corrupted. Starting new game.", "error");
        return false;
    } catch (error) {
        console.error("Error loading backup save:", error);
        showLoot("Critical error loading backup saves. Starting new game.", "error");
        localStorage.clear(); // Last resort - clear everything
        return false;
    }
}

function handleVersionMigration(oldSaveData) {
    try {
        // Add version-specific migrations here
        const migrations = {
            "0.1.0": (data) => {
                // Example migration from 0.1.0 to 0.2.0
                data.player.champions = data.player.champions || { owned: {}, totalDPS: 0 };
                return data;
            },
            "0.2.0": (data) => {
                // Example migration from 0.2.0 to 0.2.1
                data.player.collectionLog = data.player.collectionLog || [];
                return data;
            }
            // Add more migrations as needed
        };

        let migratedData = oldSaveData;
        const versions = Object.keys(migrations).sort();
        
        for (const version of versions) {
            if (compareVersions(oldSaveData.version, version) < 0) {
                migratedData = migrations[version](migratedData);
            }
        }

        migratedData.version = GAME_CONFIG.VERSION.NUMBER;
        localStorage.setItem("gameSave", JSON.stringify(migratedData));
        
        showLoot(`Game data migrated to version ${GAME_CONFIG.VERSION.NUMBER}`, "info");
        return loadGame();

    } catch (error) {
        console.error("Error migrating save data:", error);
        showLoot("Error migrating save data. Starting new game.", "error");
        return false;
    }
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        if (parts1[i] < parts2[i]) return -1;
        if (parts1[i] > parts2[i]) return 1;
    }
    return 0;
}

function checkDataIntegrity() {
    // Verify and fix critical game data
    if (!player.champions) player.champions = { owned: {}, totalDPS: 0 };
    if (!player.stats) player.stats = { monstersKilled: 0, bossesKilled: 0, totalGoldEarned: 0 };
    if (!player.settings) player.settings = { autoSave: true, notifications: true };
    
    // Ensure all regions have required properties
    Object.values(gameData.regions).forEach(region => {
        if (!region.zones) region.zones = {};
        Object.values(region.zones).forEach(zone => {
            if (!zone.completedLevels) zone.completedLevels = [];
            if (!zone.defeatedMiniBosses) zone.defeatedMiniBosses = [];
            if (!zone.monstersPerLevel) zone.monstersPerLevel = 10;
        });
    });
}

// Update the loot handling function
function lootItem(dropTable) {
  try {
      dropTable.forEach((item) => {
          if (Math.random() < item.chance * player.luck) {
              const stackedItems = {};
              player.inventory.forEach(itemName => {
                  stackedItems[itemName] = (stackedItems[itemName] || 0) + 1;
              });

              // Check if adding a new unique item would exceed slot capacity
              if (!stackedItems[item.item] && Object.keys(stackedItems).length >= GAME_CONFIG.INVENTORY.CAPACITY) {
                  showLoot(`Inventory slots full! Cannot collect ${item.item}`, "error");
                  return;
              }

              // Add item to inventory (unlimited stacking)
              player.inventory.push(item.item);

              // Update collection log
              if (!player.collectionLog.includes(item.item)) {
                  player.collectionLog.push(item.item);
                  showLoot(`New Collection: ${item.item}!`, "S");
              }

              showLoot(`Found ${item.item}!`, item.tier);
          }
      });

      updateInventory();
      renderCollectionLog();
      saveGame();
  } catch (error) {
      console.error("Error handling loot:", error);
      showLoot("Error collecting loot", "error");
  }
}

// Enhanced Collection Log
function renderCollectionLog() {
  try {
      const collectionLog = document.getElementById('collection-log');
      if (!collectionLog) return;

      // Ensure collection log is initialized as an array
      if (!Array.isArray(player.collectionLog)) {
          player.collectionLog = [];
      }

      // Create category selector
      const categorySelector = document.createElement('div');
      categorySelector.className = 'collection-category-selector';
      categorySelector.innerHTML = `
          <button class="category-btn active" data-category="all">All Items</button>
          ${Object.entries(gameData.regions)
              .filter(([_, region]) => region.unlocked)
              .map(([regionId, region]) => `
                  <button class="category-btn" data-category="${regionId}">${region.name}</button>
              `).join('')}
      `;

      // Create subcategory container
      const subcategoryContainer = document.createElement('div');
      subcategoryContainer.className = 'collection-subcategory-container';

      // Add event listeners for category buttons
      categorySelector.querySelectorAll('.category-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              categorySelector.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              renderCategoryContent(btn.dataset.category);
          });
      });

      // Clear and append new structure
      collectionLog.innerHTML = '';
      collectionLog.appendChild(categorySelector);
      collectionLog.appendChild(subcategoryContainer);

      // Initial render of "All Items"
      renderCategoryContent('all');

      function renderCategoryContent(category) {
          subcategoryContainer.innerHTML = '';

          if (category === 'all') {
              renderAllItems();
          } else {
              renderRegionItems(category);
          }
      }

      function renderAllItems() {
          const tiers = ['S', 'A', 'B', 'C'];
          tiers.forEach(tier => renderTierSection(tier, Object.entries(itemData)));
      }

      function renderRegionItems(regionId) {
          const region = gameData.regions[regionId];
          if (!region) return;

          // Create zone selector for region
          const zoneSelector = document.createElement('div');
          zoneSelector.className = 'zone-selector';
          zoneSelector.innerHTML = `
              <button class="zone-btn active" data-zone="all">All ${region.name}</button>
              ${Object.entries(region.zones)
                  .map(([zoneId, zone]) => `
                      <button class="zone-btn" data-zone="${zoneId}">${zone.name}</button>
                  `).join('')}
          `;

          subcategoryContainer.appendChild(zoneSelector);

          // Create zone content container
          const zoneContent = document.createElement('div');
          zoneContent.className = 'zone-content';
          subcategoryContainer.appendChild(zoneContent);

          // Add event listeners for zone buttons
          zoneSelector.querySelectorAll('.zone-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                  zoneSelector.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
                  btn.classList.add('active');
                  renderZoneContent(regionId, btn.dataset.zone);
              });
          });

          // Initial render of all region items
          renderZoneContent(regionId, 'all');
      }

      function renderZoneContent(regionId, zoneId) {
          const zoneContent = subcategoryContainer.querySelector('.zone-content');
          zoneContent.innerHTML = '';

          const items = getItemsForZone(regionId, zoneId);
          const tiers = ['S', 'A', 'B', 'C'];
          tiers.forEach(tier => renderTierSection(tier, items, zoneContent));
      }

      function getItemsForZone(regionId, zoneId) {
          const region = gameData.regions[regionId];
          if (zoneId === 'all') {
              // Get all items from all zones in the region
              return Object.entries(itemData).filter(([_, item]) => item.region === regionId);
          } else {
              // Get items specific to the zone
              const zone = region.zones[zoneId];
              return Object.entries(itemData).filter(([_, item]) => item.zone === zoneId);
          }
      }

      function renderTierSection(tier, items, container = subcategoryContainer) {
          const tierItems = items.filter(([_, item]) => item.tier === tier);
          if (tierItems.length === 0) return;

          const categoryDiv = document.createElement('div');
          categoryDiv.className = 'collection-category';
          
          const unlockedCount = tierItems.filter(([itemName]) => 
              player.collectionLog.includes(itemName)
          ).length;
          
          categoryDiv.innerHTML = `
              <div class="category-header">
                  ${tier} Tier Items
                  <span class="completion-badge">
                      ${unlockedCount}/${tierItems.length} (${Math.floor((unlockedCount/tierItems.length)*100)}%)
                  </span>
              </div>
              <div class="collection-grid"></div>
          `;

          const grid = categoryDiv.querySelector('.collection-grid');
          tierItems.forEach(([itemName, itemInfo]) => {
              const isUnlocked = player.collectionLog.includes(itemName);
              grid.appendChild(createCollectionSlot(itemName, itemInfo, isUnlocked));
          });

          container.appendChild(categoryDiv);
      }
  } catch (error) {
      console.error('Error rendering collection log:', error);
      showLoot('Error updating collection log', 'error');
  }
}

function createCollectionSlot(itemName, itemInfo, isUnlocked) {
  const slot = document.createElement('div');
  slot.className = `collection-slot ${isUnlocked ? 'unlocked' : ''}`;
  
  slot.innerHTML = `
      <img src="assets/items/${itemInfo.image}" 
           alt="${itemName}" 
           class="item-image">
      <div class="item-name">${itemName}</div>
  `;

  slot.addEventListener('mouseenter', (e) => showItemTooltip(e, itemName));
  slot.addEventListener('mouseleave', hideItemTooltip);

  return slot;
}

function showItemTooltip(event, itemName, count = 1) {
  try {
      let tooltip = document.getElementById('tooltip');
      if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'tooltip';
          document.body.appendChild(tooltip);
      }

      const item = itemData[itemName];
      if (!item) return;
      
      tooltip.innerHTML = `
          <div class="tooltip-header ${item.tier}-tier">
              <span class="tooltip-name">${itemName}${count > 1 ? ` (${count})` : ''}</span>
              <span class="tooltip-tier">${item.tier}</span>
          </div>
          <div class="tooltip-body">
              <p>${item.description}</p>
              <div class="tooltip-value">💰 ${item.value} gp each</div>
              ${count > 1 ? `<div class="tooltip-total">Total: ${item.value * count} gp</div>` : ''}
          </div>
      `;

      // Position tooltip
      const rect = event.target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let left = event.clientX + 10;
      let top = event.clientY + 10;
      
      if (left + tooltipRect.width > window.innerWidth) {
          left = event.clientX - tooltipRect.width - 10;
      }
      
      if (top + tooltipRect.height > window.innerHeight) {
          top = event.clientY - tooltipRect.height - 10;
      }
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';

  } catch (error) {
      console.error('Error showing tooltip:', error);
  }
}

function sellBatch(amount) {
    try {
        const stackedItems = {};
        player.inventory.forEach(itemName => {
            stackedItems[itemName] = (stackedItems[itemName] || 0) + 1;
        });

        let totalGold = 0;
        const itemsSold = {};

        Object.entries(stackedItems).forEach(([itemName, count]) => {
            const itemInfo = itemData[itemName];
            if (!itemInfo) {
                console.error(`Invalid item: ${itemName}`);
                return;
            }

            let sellAmount;
            if (amount === 'max') {
                sellAmount = count;
            } else {
                sellAmount = Math.min(count, amount);
            }

            if (sellAmount > 0) {
                const value = itemInfo.value * sellAmount;
                totalGold += value;
                itemsSold[itemName] = sellAmount;

                // Remove items from inventory
                player.inventory = player.inventory.filter(item => {
                    if (item === itemName && sellAmount > 0) {
                        sellAmount--;
                        return false;
                    }
                    return true;
                });
            }
        });

        // Update player gold and show results
        if (totalGold > 0) {
            player.gold += totalGold;
            player.stats.totalGoldEarned += totalGold;
            
            const itemSummary = Object.entries(itemsSold)
                .map(([name, qty]) => `${qty}x ${name}`)
                .join(', ');
            
            showLoot(`Sold ${itemSummary} for ${totalGold} gold!`, "S");
            
            updateUI();
            updateInventory();
            saveGame();
        } else {
            showLoot("No items to sell!", "error");
        }
    } catch (error) {
        console.error('Error selling batch:', error);
        showLoot('Error selling items', 'error');
    }
}

function hideItemTooltip() {
  try {
      const tooltip = document.getElementById('tooltip');
      if (!tooltip) return;

      // Clear any existing timeout
      if (tooltipTimeout) {
          clearTimeout(tooltipTimeout);
          tooltipTimeout = null;
      }

      // Immediately hide the tooltip
      tooltip.style.opacity = '0';
      tooltip.style.display = 'none';
  } catch (error) {
      console.error('Error hiding tooltip:', error);
  }
}

function addSlotInteractions(slot, itemName, count) {
  try {
    let isHovering = false;
    let hoverTimeout = null;

    slot.addEventListener('mouseenter', (e) => {
        isHovering = true;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            if (isHovering) showItemTooltip(e, itemName, count);
        }, GAME_CONFIG.UI.TOOLTIP_DELAY);  // Changed from hardcoded value
    });

      slot.addEventListener('mouseleave', () => {
          isHovering = false;
          if (hoverTimeout) {
              clearTimeout(hoverTimeout);
              hoverTimeout = null;
          }
          hideItemTooltip();
      });

      // Remove mousemove handler to prevent tooltip flickering
      slot.addEventListener('mousemove', (e) => {
          if (isHovering) {
              // Update tooltip position without recreating it
              updateTooltipPosition(e);
          }
      });
  } catch (error) {
      console.error('Error adding slot interactions:', error);
  }
}

let isChampionsPaused = false;

function initializeSettings() {
    // Auto-save toggle
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
        autoSaveToggle.checked = player.settings.autoSave;
        autoSaveToggle.addEventListener('change', (e) => {
            player.settings.autoSave = e.target.checked;
            saveGame();
        });
    }
    
    // Champions pause toggle
    const championsPauseToggle = document.getElementById('champions-pause-toggle');
    if (championsPauseToggle) {
        // Set initial state from player settings
        isChampionsPaused = player.settings.championsPaused || false;
        championsPauseToggle.checked = isChampionsPaused;
        
        // Add event listener
        championsPauseToggle.addEventListener('change', function() {
            toggleChampionsPause(this.checked);
        });
    }

    // Update game information
    updateGameInfo();
}

function toggleChampionsPause(paused) {
    isChampionsPaused = paused;
    
    // Visual feedback
    const message = isChampionsPaused ? "Champions paused" : "Champions resumed";
    showLoot(message, "info");
    
    // Save the setting
    if (player.settings) {
        player.settings.championsPaused = isChampionsPaused;
        saveGame();
    }
}

function updateGameInfo() {
    const versionElement = document.getElementById('game-version');
    const lastSavedElement = document.getElementById('last-saved');

    if (versionElement) {
        versionElement.textContent = GAME_CONFIG.VERSION.NUMBER;
    }

    if (lastSavedElement) {
        const lastSaved = localStorage.getItem('lastSaved');
        lastSavedElement.textContent = lastSaved ? 
            new Date(parseInt(lastSaved)).toLocaleString() : 
            'Never';
    }
}

function updateTooltipPosition(event) {
    const tooltip = event.currentTarget.querySelector('.upgrade-tooltip');
    if (!tooltip) return;

    const icon = event.currentTarget;
    const iconRect = icon.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gameContainer = document.getElementById('game-container');
    const containerRect = gameContainer.getBoundingClientRect();

    // Reset tooltip position and classes
    tooltip.style.transform = '';
    tooltip.classList.remove('tooltip-adjusted-left', 'tooltip-adjusted-right');

    // Default position (above the icon)
    let top = iconRect.top - tooltipRect.height - 10;
    let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

    // Check left edge
    if (left < containerRect.left + 10) {
        left = containerRect.left + 10;
        tooltip.classList.add('tooltip-adjusted-left');
    }
    // Check right edge
    else if (left + tooltipRect.width > containerRect.right - 10) {
        left = containerRect.right - tooltipRect.width - 10;
        tooltip.classList.add('tooltip-adjusted-right');
    }

    // Check top edge - if too close, show below instead
    if (top < containerRect.top + 10) {
        top = iconRect.bottom + 10;
        tooltip.classList.add('tooltip-bottom');
    } else {
        tooltip.classList.add('tooltip-top');
    }

    // Apply new position
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// Add event listeners
document.querySelectorAll('.upgrade-icon').forEach(icon => {
    icon.addEventListener('mouseenter', updateTooltipPosition);
    icon.addEventListener('mousemove', updateTooltipPosition);
});

function preloadAssets() {
  const images = [];
  Object.values(itemData).forEach((item) => {
    const img = new Image();
    img.src = `assets/items/${item.image}`;
    img.onerror = () => console.error(`Failed to load image: ${item.image}`);
    images.push(img);
  });
}

function getStackedInventory() {
  const stackedItems = {};
  player.inventory.forEach((itemName) => {
    stackedItems[itemName] = (stackedItems[itemName] || 0) + 1;
  });
  return stackedItems;
}

function showLoot(message, tier) {
    const feed = DOMCache.get("#loot-feed");
    const entry = document.createElement("div");
    entry.className = `loot-entry ${tier}-tier`; // Instead of just 'error'
    entry.textContent = message;

    // Actually add to DOM
    feed.insertBefore(entry, feed.firstChild);

    // Limit to 5 messages
    if (feed.children.length > 5) {
        feed.removeChild(feed.lastChild);
    }

    // Add error styling
    if (tier === "error") {
        entry.style.color = "#ff4444";
        entry.style.fontWeight = "bold";
    }
}

function setupTabPanels() {
    try {
        // Set up left panel tabs
        const leftPanel = document.querySelector('.left-panel');
        if (leftPanel) {
            const leftTabs = leftPanel.querySelectorAll('.osrs-interface-tab');
            const leftPanels = leftPanel.querySelectorAll('.osrs-panel');

            leftTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs in LEFT panel only
                    leftTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Hide all panels in LEFT panel only
                    leftPanels.forEach(panel => panel.classList.remove('active'));

                    // Show selected panel
                    const panelId = tab.getAttribute('data-panel');
                    const targetPanel = leftPanel.querySelector(`#${panelId}-panel`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                        // Handle special panel renders
                        if (panelId === 'shop') {
                            renderShop();
                        } else if (panelId === 'inventory') {
                            updateInventory();
                        } else if (panelId === 'champions') {
                            renderChampionsPanel();
                        }
                    }
                });
            });
        }

        // Set up right panel tabs
        const rightPanel = document.querySelector('.right-panel');
        if (rightPanel) {
            const rightTabs = rightPanel.querySelectorAll('.osrs-interface-tab');
            const rightPanels = rightPanel.querySelectorAll('.osrs-panel');

            rightTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs in RIGHT panel only
                    rightTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Hide all panels in RIGHT panel only
                    rightPanels.forEach(panel => panel.classList.remove('active'));

                    // Show selected panel
                    const panelId = tab.getAttribute('data-panel');
                    const targetPanel = rightPanel.querySelector(`#${panelId}-panel`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                        // Handle special panel renders
                        if (panelId === 'collection') {
                            renderCollectionLog();
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error setting up tab panels:', error);
        showLoot('Error initializing interface panels', 'error');
    }
}

function updateUI() {
  try {
    updateHealthDisplay();
    updateInventory();
    updateProgressBar();
    updateStatsDisplay(); // Add this line
    renderAchievements(); // Add this line
    const goldDisplay = document.getElementById('gold-display');
    if (goldDisplay) {
        goldDisplay.textContent = formatNumber(player.gold);
    }
      UIManager.queueUpdate('all');
  } catch (error) {
      GameError.handleError(error, 'updateUI');
  }
  
}

function getTierForVariant(variantName) {
  // Get actual variant data
  const zone = gameData.regions[player.region].zones[player.currentZone];
  const variant = zone.variants.find((v) => variantName.startsWith(v.name));

  return variant?.tier || "common"; // Add 'tier' property to variants
}

function updateInventory() {
  try {
      const grid = document.querySelector('.inventory-grid');
      if (!grid) {
          /*console.error('Inventory grid not found');*/
          return;
      }

      // Clear grid
      grid.innerHTML = '';

      // Create stacked inventory with unlimited stacking
      const stackedItems = {};
      player.inventory.forEach(itemName => {
          stackedItems[itemName] = (stackedItems[itemName] || 0) + 1;
      });

      // Convert stacked items to array for display
      const stackedArray = Object.entries(stackedItems).map(([itemName, count]) => ({
          name: itemName,
          count: count
      }));

      // Check if we have more unique items than slots
      if (stackedArray.length > GAME_CONFIG.INVENTORY.CAPACITY) {
          showLoot("Inventory slots full! (Max unique items reached)", "error");
          return false;
      }

      // Create all inventory slots
      for (let i = 0; i < GAME_CONFIG.INVENTORY.CAPACITY; i++) {
          const slot = document.createElement('div');
          slot.className = 'inventory-slot';
          
          // If we have an item for this slot
          if (i < stackedArray.length) {
              const item = stackedArray[i];
              const itemInfo = itemData[item.name];

              if (itemInfo) {
                  slot.innerHTML = `
                      <img src="assets/items/${itemInfo.image}" alt="${item.name}" class="item-image">
                      ${item.count > 1 ? `<div class="item-count">${item.count}</div>` : ''}
                      <button class="sell-button" data-item="${item.name}">💰</button>
                  `;

                  // Add event listeners
                  const sellButton = slot.querySelector('.sell-button');
                  if (sellButton) {
                      sellButton.addEventListener('click', () => {
                          sellStackedItem(item.name);
                      });
                  }

                  addSlotInteractions(slot, item.name, item.count);
              }
          }
          
          grid.appendChild(slot);
      }

      return true;
  } catch (error) {
      console.error('Error updating inventory:', error);
      showLoot('Error updating inventory', 'error');
      return false;
  }
}

function cleanupEventListeners() {
  try {
      const elements = {
          attackButton: document.getElementById('attack-button'),
          interfaceTabs: document.querySelectorAll('.osrs-interface-tab'),
          resetButton: document.getElementById('hard-reset-btn')
      };

      if (elements.attackButton) {
          elements.attackButton.removeEventListener('click', attackHandler);
      }

      if (elements.resetButton) {
          elements.resetButton.removeEventListener('click', showResetConfirmation);
      }

      elements.interfaceTabs.forEach(tab => {
          tab.removeEventListener('click', handleInterfaceTab);
      });
  } catch (error) {
      console.error('Error cleaning up event listeners:', error);
  }
}

function createInventorySlot(itemName, count) {
    try {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";

        const itemInfo = itemData[itemName];
        if (!itemInfo) return slot;

        slot.innerHTML = `
            <img src="assets/items/${itemInfo.image}" alt="${itemName}" class="item-image">
            ${count > 1 ? `<div class="item-count">${count}</div>` : ""}
            <button class="sell-button" data-item="${itemName}">💰</button>
        `;

        // Add event listeners
        const sellButton = slot.querySelector('.sell-button');
        if (sellButton) {
            sellButton.addEventListener('click', () => sellStackedItem(itemName));
        }

        // Add tooltip interactions
        addSlotInteractions(slot, itemName, count);

        return slot;
    } catch (error) {
        console.error("Error creating inventory slot:", error);
        return document.createElement("div");
    }
}

// Add to your game.js
function initMobileUI() {
    // Handle navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding panel
            const panelId = btn.dataset.panel;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.querySelector(`.${panelId}-panel`).classList.add('active');
        });
    });

    // Add touch event for attack button
    const attackBtn = document.getElementById('attack-button');
    if (attackBtn) {
        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            attackHandler();
        });
    }
}

function setupMonsterClickHandler() {
    const monsterContainer = document.querySelector('.monster-container');
    if (!monsterContainer) return;

    monsterContainer.addEventListener('click', (e) => {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = (e.offsetX - 20) + 'px';
        ripple.style.top = (e.offsetY - 20) + 'px';
        monsterContainer.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);

        // Handle the attack
        attackHandler();
    });

    // Prevent dragging of monster sprite
    const monsterSprite = document.querySelector('.monster-sprite');
    if (monsterSprite) {
        monsterSprite.addEventListener('dragstart', (e) => e.preventDefault());
    }
}


function initGame() {
    try {
        // Ensure current region and zone are set
        currentRegion = currentRegion || "lumbridge";
        currentZone = currentZone || "cowpen";

        // Initialize game systems
        initializeCollectionLog();
        preloadAssets();

        // Load saved game or set initial state
        loadGame();

        // Initialize UI elements
        setupMonsterClickHandler();
        initializeSellButtons();
        updateUI();
        renderLevelSelect();
        renderCollectionLog();
        updateInventory();
        renderShop();
        renderRegionTabs();
        renderZoneTabs();

        // Set default active panels
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');

        if (leftPanel) {
            const championsTab = leftPanel.querySelector('[data-panel="champions"]');
            const championsPanel = leftPanel.querySelector('#champions-panel');
            if (championsTab && championsPanel) {
                // Remove active class from all tabs and panels
                leftPanel.querySelectorAll('.osrs-interface-tab').forEach(tab => tab.classList.remove('active'));
                leftPanel.querySelectorAll('.osrs-panel').forEach(panel => panel.classList.remove('active'));
                // Set champions active
                championsTab.classList.add('active');
                championsPanel.classList.add('active');
            }
        }

        if (rightPanel) {
            const collectionTab = rightPanel.querySelector('[data-panel="collection"]');
            const collectionPanel = rightPanel.querySelector('#collection-panel');
            if (collectionTab && collectionPanel) {
                // Remove active class from all tabs and panels
                rightPanel.querySelectorAll('.osrs-interface-tab').forEach(tab => tab.classList.remove('active'));
                rightPanel.querySelectorAll('.osrs-panel').forEach(panel => panel.classList.remove('active'));
                // Set collection log active
                collectionTab.classList.add('active');
                collectionPanel.classList.add('active');
            }
        }

        // Set up initial monster
        const zone = gameData.regions[currentRegion].zones[currentZone];
        spawnMonster(zone);
        updateItemValues(zone.currentLevel);

        // Setup event listeners
        setupEventListeners();

        // Initialize champions if needed
        if (!player.champions) {
            player.champions = {
                owned: {},
                totalDPS: 0
            };
        }
        initializeChampions();
        renderChampionsPanel();

        // Initialize mobile UI if on mobile device
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            initMobileUI();
        }

        if (!player.collectionLog || !Array.isArray(player.collectionLog)) {
            player.collectionLog = [];
        }

        // Set up auto-save interval if enabled
        if (player.settings.autoSave) {
            // Clear any existing interval first
            if (window.autoSaveInterval) {
                clearInterval(window.autoSaveInterval);
            }

            // Set new interval
            window.autoSaveInterval = setInterval(() => {
                if (player.settings.autoSave) {
                    saveGame();
                    if (player.settings.notifications) {
                        showLoot("Game auto-saved", "info");
                    }
                }
            }, GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        showLoot("Error initializing game", "error");
    }
}

function toggleAutoSave() {
    try {
        player.settings.autoSave = !player.settings.autoSave;
        
        // Clear existing interval
        if (window.autoSaveInterval) {
            clearInterval(window.autoSaveInterval);
            window.autoSaveInterval = null;
        }
        
        // Set up new interval if enabled
        if (player.settings.autoSave) {
            window.autoSaveInterval = setInterval(() => {
                if (player.settings.autoSave) {
                    saveGame();
                    if (player.settings.notifications) {
                        showLoot("Game auto-saved", "info");
                    }
                }
            }, GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
            showLoot("Auto-save enabled", "info");
        } else {
            showLoot("Auto-save disabled", "info");
        }
        
        // Update UI if needed
        const autoSaveBtn = document.getElementById('auto-save-toggle');
        if (autoSaveBtn) {
            autoSaveBtn.classList.toggle('active', player.settings.autoSave);
        }
        
        saveGame(); // Save the setting change
    } catch (error) {
        console.error("Error toggling auto-save:", error);
        showLoot("Error toggling auto-save", "error");
    }
}

class GameLoop {
    static fps = 60;
    static frameTime = 1000 / this.fps;
    static lastFrameTime = 0;
    static deltaTime = 0;

    static update(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastFrameTime;
        
        // Only update if enough time has passed
        if (this.deltaTime >= this.frameTime) {
            // Update game state
            this.updateGameState();
            
            // Update UI elements
            UIManager.processUpdates();
            
            this.lastFrameTime = currentTime;
        }
        
        // Request next frame
        requestAnimationFrame(time => this.update(time));
    }

    static updateGameState() {
        // Handle champion DPS
        if (player.champions.totalDPS > 0) {
            applyChampionDPS();
        }
        
        // Handle auto-progress
        if (isAutoProgressEnabled) {
            handleAutoProgress();
        }
    }

    static start() {
        requestAnimationFrame(time => this.update(time));
    }
}

class UIBatcher {
    static batchTimeMs = 50; // Update every 50ms
    static lastUpdate = 0;
    static pendingUpdates = new Set();

    static queueUpdate(component) {
        this.pendingUpdates.add(component);
        
        const currentTime = performance.now();
        if (currentTime - this.lastUpdate >= this.batchTimeMs) {
            this.processBatch();
        }
    }

    static processBatch() {
        if (this.pendingUpdates.size === 0) return;

        // Process all pending updates
        this.pendingUpdates.forEach(component => {
            UIManager.updateComponent(component);
        });

        this.pendingUpdates.clear();
        this.lastUpdate = performance.now();
    }
}

function handleAutoProgress() {
    try {
        // Don't progress if we're fighting a boss
        if (player.currentBoss) return;
        
        const zone = gameData.regions[currentRegion].zones[currentZone];
        if (!zone) return;
        
        // Check if enough kills to level up
        if (zone.currentKills >= zone.monstersPerLevel) {
            const nextLevel = zone.currentLevel + 1;
            const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
            
            // Only auto-progress if:
            // 1. Next level is within region cap
            // 2. Next level is either previously reached or just one level higher
            if (nextLevel <= regionCap && (nextLevel <= zone.highestLevel + 1)) {
                // Use setTimeout to prevent instant progression
                setTimeout(() => {
                    // Double-check conditions before selecting level
                    // (conditions might have changed during timeout)
                    if (isAutoProgressEnabled && 
                        !player.currentBoss && 
                        zone.currentKills >= zone.monstersPerLevel) {
                        selectLevel(nextLevel);
                    }
                }, GAME_CONFIG.AUTO_PROGRESS.DELAY);
            }
        }
    } catch (error) {
        console.error("Error in auto-progress:", error);
    }
}

function cleanupGameState() {
    // Clear unnecessary data
    player.inventory = player.inventory.filter(item => item !== null);
    
    // Limit collection log size
    if (player.collectionLog.length > 1000) {
        player.collectionLog = player.collectionLog.slice(-1000);
    }
    
    // Clear old achievements
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.unlocked) {
            delete achievement.criteria;
        }
    });
}

// Call periodically
setInterval(cleanupGameState, 300000); // Every 5 minutes

const PerformanceMonitor = {
    metrics: {
        fps: 0,
        updateTime: 0,
        renderTime: 0
    },

    startMeasure(label) {
        performance.mark(`${label}-start`);
    },

    endMeasure(label) {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measurement = performance.getEntriesByName(label).pop();
        this.metrics[label] = measurement.duration;
        
        performance.clearMarks();
        performance.clearMeasures();
    },

    logMetrics() {
        console.table(this.metrics);
    }
};

function cleanupGame() {
    try {
        // Clear auto-save interval
        if (window.autoSaveInterval) {
            clearInterval(window.autoSaveInterval);
            window.autoSaveInterval = null;
        }

        // Clear champions panel interval
        if (championsPanelInterval) {
            clearInterval(championsPanelInterval);
            championsPanelInterval = null;
        }

                // Cancel animation frame for smooth DPS
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }

        // Save one last time
        saveGame();

        // Other cleanup code...
    } catch (error) {
        console.error("Error cleaning up game:", error);
    }
}

function showResetConfirmation() {
    try {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h2>⚠️ Warning: Hard Reset</h2>
                    <p>This will completely reset your game progress.</p>
                    <p>This action cannot be undone!</p>
                    <div class="modal-buttons">
                        <button class="osrs-button danger-button" id="confirm-reset-btn">Reset Game</button>
                        <button class="osrs-button" id="cancel-reset-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        modalContainer.style.display = 'flex';

        const confirmBtn = document.getElementById('confirm-reset-btn');
        const cancelBtn = document.getElementById('cancel-reset-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                hardResetGame();
                modalContainer.style.display = 'none';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modalContainer.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Error showing reset confirmation:', error);
        showLoot('Error showing reset dialog', 'error');
    }
}

function hardResetGame() {
    try {
        // Clear local storage
        localStorage.clear();

        // Reset player data
        player = {
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
            }
        };

        // Reset game state
        currentRegion = "lumbridge";
        currentZone = "cowpen";
        isAutoProgressEnabled = false;

        // Reset game data
        Object.values(gameData.regions).forEach(region => {
            region.unlocked = region.name === "Lumbridge";
            region.miniBossesDefeated = 0;
            region.bossDefeated = false;

            Object.values(region.zones).forEach(zone => {
                zone.unlocked = zone.name === "Cow Pen";
                zone.currentLevel = 1;
                zone.highestLevel = 1;
                zone.completedLevels = [];
                zone.currentKills = 0;
                zone.defeatedMiniBosses = [];
                zone.monstersPerLevel = 10;
            });
        });

        // Reset UI and game state
        updateUI();
        renderChampionsPanel();
        renderLevelSelect();
        renderCollectionLog();
        updateInventory();
        renderShop();
        renderRegionTabs();
        renderZoneTabs();
        updateZoneBackground(currentZone);

        // Save the reset state
        saveGame();

        showLoot("Game has been reset!", "info");
    } catch (error) {
        console.error("Error resetting game:", error);
        showLoot("Error resetting game", "error");
    }
}

function closeModal() {
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) modalContainer.style.display = 'none';
}

// Add helper function to format zone names
function formatZoneName(zoneName) {
  return zoneName
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function setupEventListeners() {
    const resetBtn = DOMCache.get('#hard-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', showResetConfirmation);
    }

    const autoProgressBtn = DOMCache.get('#auto-progress');
    if (autoProgressBtn) {
        autoProgressBtn.addEventListener('click', toggleAutoProgress);
    }

    document.querySelectorAll('.sell-batch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount === 'max' ? 'max' : parseInt(btn.dataset.amount);
            toggleSellButton(amount);
        });
    });

    document.querySelectorAll('.osrs-interface-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.target.dataset.panel;
            handleTabSwitch(tabId);
        });
    });
}

function renderZoneTabs() {
    try {
        const zoneTabs = document.querySelector('.zone-tabs');
        if (!zoneTabs) return;

        zoneTabs.innerHTML = '';

        // Get all zones for current region
        const zones = gameData.regions[currentRegion].zones;

        Object.entries(zones).forEach(([zoneId, zoneData]) => {
            const tab = document.createElement('button');
            tab.className = `osrs-tab ${zoneId === currentZone ? 'active' : ''} 
                           ${!zoneData.unlocked ? 'locked' : ''}`;
            tab.dataset.zone = zoneId;

            // Show lock icon and requirements for locked zones
            if (!zoneData.unlocked && zoneData.requiredForUnlock) {
                const reqZone = gameData.regions[currentRegion].zones[zoneData.requiredForUnlock.zone];
                tab.innerHTML = `
                    <span>${zoneData.name}</span>
                    <div class="unlock-req">
                        🔒 Requires ${reqZone.name} Level ${zoneData.requiredForUnlock.level}
                    </div>
                `;
            } else {
                tab.innerHTML = `<span>${zoneData.name}</span>`;
            }

            // Only add click handler if zone is unlocked
            if (zoneData.unlocked) {
                tab.onclick = () => switchZone(zoneId);
            }

            zoneTabs.appendChild(tab);
        });

    } catch (error) {
        console.error("Error rendering zone tabs:", error);
        showLoot("Error updating zone display", "error");
    }
}

function saveGame(showMessage = false) {
    if (window.saveSystem) {
        window.saveSystem.saveGame(showMessage);
    } else {
        console.error("Save system not initialized");
    }
}

function switchRegion(region) {
  try {
      // Update current region
      currentRegion = region;

      // Update region tabs
      document.querySelectorAll('.osrs-tab').forEach(tab => {
          tab.classList.remove('active');
          if (tab.dataset.region === region) {
              tab.classList.add('active');
          }
      });

      // Set default zone for the new region
      if (region === "varrock") {
          currentZone = "marketplace";
      } else {
          currentZone = Object.keys(gameData.regions[region].zones)[0];
      }

      // Render zone tabs for the new region
      renderZoneTabs();

      // Update game state
      const zone = gameData.regions[region].zones[currentZone];
      if (zone) {
          zone.monster = null;
          spawnMonster(zone);
      }

      // Update UI
      updateZoneBackground(currentZone);
      updateUI();
      renderLevelSelect();
      renderCollectionLog();
      updateInventory();
      renderShop();

      showLoot(`Switched to ${gameData.regions[region].name}`, "S");
  } catch (error) {
      console.error('Error switching region:', error);
      showLoot('Error switching region', 'error');
  }
}

function switchZone(zoneId) {
    try {
        const zone = gameData.regions[currentRegion].zones[zoneId];
        
        // Check if zone is locked
        if (!zone.unlocked) {
            // Show requirements message
            if (zone.requiredForUnlock) {
                const reqZone = zone.requiredForUnlock.zone;
                const reqLevel = zone.requiredForUnlock.level;
                showLoot(`Reach level ${reqLevel} in ${formatZoneName(reqZone)} to unlock ${formatZoneName(zoneId)}!`, "error");
            } else {
                showLoot(`This zone is locked!`, "error");
            }
            return;
        }

        // Clear any existing boss timers in the current zone
        const currentZoneData = gameData.regions[currentRegion].zones[currentZone];
        if (currentZoneData.bossTimer) {
            clearInterval(currentZoneData.bossTimer);
            currentZoneData.bossTimer = null;
        }

        currentZone = zoneId;
      
        // Update zone tabs
        document.querySelectorAll('.osrs-subtab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.zone === zoneId) {
                tab.classList.add('active');
            }
        });

        // Update background
        updateZoneBackground(zoneId, currentRegion);  // FIXED: Added currentRegion parameter

        // Reset monster and update UI
        if (zone) {
            zone.monster = null;
            spawnMonster(zone);
        }

        // Update UI elements
        document.getElementById('zone-name').textContent = zone.name;
        document.getElementById('zone-level').textContent = zone.currentLevel;
        
        updateUI();
        renderLevelSelect();
    } catch (error) {
        console.error('Error switching zone:', error);
        showLoot('Error switching zone', 'error');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    try {
        initDOMCache(); // Initialize DOMCache early
        loadGame();
        updateVersionButton();
        
        // If no save exists, initialize with default zone
        const zone = gameData.regions[currentRegion].zones[currentZone];
        if (zone) {
            zone.monster = getCurrentMonsterStats(zone);
            updateUI();
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        showLoot("Error initializing game", "error");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        initDOMCache();
        UIManager.init(); // Initialize UI element references
        validateGameData(); 
        await preloadAssets();
        initGame();
        setupEventListeners();
        setupLevelNavigation();
        setupTabPanels(); // Ensure this is called

        // Set champions panel as the default active panel
        const leftPanel = document.querySelector('.left-panel');
        if (leftPanel) {
            const championsTab = leftPanel.querySelector('[data-panel="champions"]');
            const championsPanel = leftPanel.querySelector('#champions-panel');
            if (championsTab && championsPanel) {
                // Remove active class from all tabs and panels
                leftPanel.querySelectorAll('.osrs-interface-tab').forEach(tab => tab.classList.remove('active'));
                leftPanel.querySelectorAll('.osrs-panel').forEach(panel => panel.classList.remove('active'));
                // Set champions active
                championsTab.classList.add('active');
                championsPanel.classList.add('active');
            }
        }

        // Ensure the champions panel is rendered and updated
        renderChampionsPanel();

        // Listen for champions panel update events
        EventSystem.on('championsPanelUpdate', renderChampionsPanel);

    } catch (error) {
        console.error("Error initializing game:", error);
        showLoot("Error loading game assets", "error");
    }
});

function checkAllZonesCapped(region) {
    const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
    return Object.values(region.zones).every(zone => zone.currentLevel >= regionCap);
}

function checkRegionBossAvailability() {
    const region = gameData.regions[currentRegion];
    if (checkAllZonesCapped(region) && !region.bossDefeated) {
        // Show boss availability notification
        showLoot("Region Boss Available!", "special");
        return true;
    }
    return false;
}

function handleZoneCompletion(zone) {
    if (checkRegionBossAvailability()) {
        // Trigger region boss encounter
        triggerRegionBossEncounter();
    }
}

function triggerRegionBossEncounter() {
    const region = gameData.regions[currentRegion];
    const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
    
    // Set up the boss encounter
    region.boss = {
        name: `${region.name} Champion`,
        health: regionCap * 100,
        maxHealth: regionCap * 100,
        level: regionCap,
        isBoss: true,
        isRegionBoss: true,
        timeLimit: 60000 // 60 seconds for region boss
    };
    
    // Update UI to show boss fight
    updateBossUI(region.boss);
}
window.addEventListener('beforeunload', cleanupGame);
// Add functions and constants to the global scope
window.DOMCache = DOMCache;
window.initDOMCache = initDOMCache;
window.DROP_TABLES = DROP_TABLES;
window.GAME_CONFIG = GAME_CONFIG;
window.ZONE_VARIANTS = ZONE_VARIANTS;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.checkAchievements = checkAchievements;
window.handleGoldEarned = handleGoldEarned;
window.showTab = showTab;
window.renderAchievements = renderAchievements;
window.showVersionInfo = showVersionInfo;
window.CHAMPION_CONFIG = CHAMPION_CONFIG;
window.championsData = championsData;
window.positionTooltip = positionTooltip;
window.showAchievementTooltip = showAchievementTooltip;
window.getAchievementRequirementText = getAchievementRequirementText;
window.formatReward = formatReward;
window.toggleAutoProgress = toggleAutoProgress;
window.REGION_DIFFICULTY_MULTIPLIERS = REGION_DIFFICULTY_MULTIPLIERS;
window.gameData = gameData;
window.saveGame = saveGame;
window.varrockItems = varrockItems;
window.checkZoneUnlocks = checkZoneUnlocks;
window.calculateChampionBonus = calculateChampionBonus;
window.calculateChampionBonusMultiplier = calculateChampionBonusMultiplier;
window.calculateChampionCost = calculateChampionCost;
window.calculateChampionDPS = calculateChampionDPS;
window.buyChampion = buyChampion;
window.updateTotalChampionDPS = updateTotalChampionDPS;
window.applyChampionDPS = applyChampionDPS;
window.initializeChampions = initializeChampions;
window.checkChampionUnlock = checkChampionUnlock;
window.purchaseChampionUpgrade = purchaseChampionUpgrade;
window.renderChampionsPanel = renderChampionsPanel;
window.renderChampionRequirements = renderChampionRequirements;
window.calculateBulkChampionCost = calculateBulkChampionCost;
window.calculateMaxAffordableLevels = calculateMaxAffordableLevels;
window.buyChampionLevels = buyChampionLevels;
window.unlockChampion = unlockChampion;
window.toggleChampionMinimize = toggleChampionMinimize;
window.formatRequirement = formatRequirement;
window.updateVersionButton = updateVersionButton;
window.calculateBaseGold = calculateBaseGold;
window.calculateItemValue = calculateItemValue;
window.initializeMapControls = initializeMapControls;
window.openMapModal = openMapModal;
window.initializeSidebar = initializeSidebar;
window.toggleExpand = toggleExpand;
window.updateSidebarStates = updateSidebarStates;
window.zoomToButton = zoomToButton;
window.resetZoom = resetZoom;
window.updateMapZones = updateMapZones;
window.closeMapModal = closeMapModal;
window.handleMapNavigation = handleMapNavigation;
window.loadImage = loadImage;
window.getZoneTitleForLevel = getZoneTitleForLevel;
window.handleBossDefeat = handleBossDefeat;
window.handleRegionBossDefeat = handleRegionBossDefeat;
window.unlockVarrock = unlockVarrock;
window.initializeRegionMechanics = initializeRegionMechanics;
window.startPatrolSystem = startPatrolSystem;
window.handlePrestige = handlePrestige;
window.unlockNewRegion = unlockNewRegion;
window.showBossConfirmation = showBossConfirmation;
window.startRegionBoss = startRegionBoss;
window.renderRegionTabs = renderRegionTabs;
window.prestige = prestige;
window.startBossTimer = startBossTimer;
window.calculateWeaponPrice = calculateWeaponPrice;
window.calculateWeaponDamage = calculateWeaponDamage;
window.generateMoreWeaponTiers = generateMoreWeaponTiers;
window.shopItems = shopItems;
window.itemPrices = itemPrices;
window.findCurrentTier = findCurrentTier;
window.renderEquipmentShop = renderEquipmentShop;
window.renderShop = renderShop;
window.buyItem = buyItem;
window.saveGame = () => saveSystem.saveGame();
window.applyItemEffect = applyItemEffect;
window.findItemByName = findItemByName;
window.saveSystem = saveSystem;
window.getNextUpgrade = getNextUpgrade;
window.toggleSellButton = toggleSellButton;
window.sellItem = sellItem;
window.initializeSellButtons = initializeSellButtons;
window.sellStackedItem = sellStackedItem;
window.getTierForItem = getTierForItem;
window.updateAutoProgressButton = updateAutoProgressButton;
window.loadGame = loadGame;
window.loadBackupSave = loadBackupSave;
window.handleVersionMigration = handleVersionMigration;
window.compareVersions = compareVersions;
window.checkDataIntegrity = checkDataIntegrity;
window.lootItem = lootItem;
window.renderCollectionLog = renderCollectionLog;
window.createCollectionSlot = createCollectionSlot;
window.showItemTooltip = showItemTooltip;
window.sellBatch = sellBatch;
window.hideItemTooltip = hideItemTooltip;
window.addSlotInteractions = addSlotInteractions;
window.updateTooltipPosition = updateTooltipPosition;
window.preloadAssets = preloadAssets;
window.getStackedInventory = getStackedInventory;
window.showLoot = showLoot;
window.setupTabPanels = setupTabPanels;
window.updateUI = updateUI;
window.getMonsterVariantsForLevel = getMonsterVariantsForLevel;
window.getTierForVariant = getTierForVariant;
window.updateInventory = updateInventory;
window.cleanupEventListeners = cleanupEventListeners;
window.createInventorySlot = createInventorySlot;
window.initMobileUI = initMobileUI;
window.setupMonsterClickHandler = setupMonsterClickHandler;
window.initGame = initGame;
window.toggleAutoSave = toggleAutoSave;
window.GameLoop = GameLoop;
window.UIBatcher = UIBatcher;
window.cleanupGameState = cleanupGameState;
window.PerformanceMonitor = PerformanceMonitor;
window.cleanupGame = cleanupGame;
window.showResetConfirmation = showResetConfirmation;
window.closeModal = closeModal;
window.formatZoneName = formatZoneName;
window.setupEventListeners = setupEventListeners;
window.renderZoneTabs = renderZoneTabs;
window.switchRegion = switchRegion;
window.updateZoneBackground = updateZoneBackground;
window.switchZone = switchZone;
window.checkAllZonesCapped = checkAllZonesCapped;
window.checkRegionBossAvailability = checkRegionBossAvailability;
window.handleZoneCompletion = handleZoneCompletion;
window.triggerRegionBossEncounter = triggerRegionBossEncounter;
window.hardResetGame = hardResetGame;