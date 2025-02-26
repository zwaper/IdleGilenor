// Game Constants
const GAME_CONFIG = {
  COMBAT: {
      MINIBOSS_BASE_MULTIPLIER: 5,
      MINIBOSS_LEVEL_MULTIPLIER: 1.5,
      MINIBOSS_LEVEL_INTERVAL: 10,
      ELITE_BOSS_INTERVAL: 100,
      MINI_BOSS_TIME_LIMIT: 30000
  },
  INVENTORY: {
      CAPACITY: 28,
      LEVELS_PER_PAGE: 9
  },
  SAVE: {
      VERSION: "1.0.0",
      AUTOSAVE_INTERVAL: 30000
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
    }
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
    player.gold += amount;
    player.stats.totalGoldEarned += amount;
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

// Call renderAchievements when the game initializes
document.addEventListener('DOMContentLoaded', () => {
    renderAchievements();
    renderChampionsPanel();
    updateUI();
    // ...other initialization code...
});

let currentLevelPage = 0;
let tooltipTimeout = null;

// Game State
let player = {
  gold: 0,
  damage: 1,
  luck: 1.0,
  defense: 0,
  inventory: [],
  upgrades: [],
  prestigeLevel: 0,
  selectedSellAmount: 1,  // Set default to 1
  autoClicker: null,
  autoClickerLevel: "None",
  autoClickerDamage: 0,
  autoClickerPaused: false,
  autoClickerInterval: 1000,
  currentBoss: null,
  bossTimer: null,
  bossTimeLeft: 0,
  champions: {
    owned: {},  // Will store champion levels and current DPS
    totalDPS: 0 // Total DPS from all champions
},
  region: "lumbridge",
  currentZone: "cowpen",
  collectionLog: [], // Track collected items
  stats: {
    monstersKilled: 0,
    bossesKilled: 0,
    totalGoldEarned: 0,
  },
  settings: {
    autoSave: true,
    notifications: true,
  },
};

const REGION_DIFFICULTY_MULTIPLIERS = {
    lumbridge: 1.0,  // Base difficulty
    varrock: 2.5,    // 2.5x harder than Lumbridge
    // Future regions can scale up from here
    // falador: 4.0,
    // ardougne: 6.0,
};

// Game Data
const gameData = {
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
          variants: [
            {
              name: "Cow", // Levels 1-9
              baseHP: 30,
              baseDamage: 2,
              images: [
                "cow.png",
              ],
              weight: 100,
              tier: "C",
              dropTable: [
                { item: "Cowhide", chance: 0.7, tier: "C" },
                { item: "Beef", chance: 0.3, tier: "C" },
              ],
            },
            {
              name: "Zanaris Cow", // Unlocks at level 10-19
              baseHP: 45,
              baseDamage: 3,
              image: "zanaris_cow.png",
              weight: 70,
              tier: "B",
              dropTable: [
                { item: "Shiny Hide", chance: 0.5, tier: "B" },
                { item: "Moon Beef", chance: 0.2, tier: "A" },
              ],
            },
            {
              name: "Zombie Cow", // Unlocks at level 20+
              baseHP: 60,
              baseDamage: 4,
              image: "zombie_cow.png",
              weight: 50,
              tier: "A",
              dropTable: [
                { item: "Rotting Hide", chance: 0.8, tier: "C" },
                { item: "Cursed Hoof", chance: 0.1, tier: "S" },
              ],
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
              dropTable: [
                  { item: "Elite Hide", chance: 1.0, tier: "S" },
                  { item: "Elite Horn", chance: 0.5, tier: "S" },
                  { item: "Elite Crown", chance: 0.25, tier: "S" }
              ]
          },
          {
              name: "Supreme Elite Cow", // Level 200 Boss
              baseHP: 15000,
              baseDamage: 150,
              images: [
                  "supreme_elite_cow1.png",
                  "supreme_elite_cow2.png"
              ],
              weight: 0,
              tier: "S",
              level: 200,
              timeLimit: 180,
              dropTable: [
                  { item: "Supreme Hide", chance: 1.0, tier: "S" },
                  { item: "Supreme Horn", chance: 0.4, tier: "S" },
                  { item: "Supreme Crown", chance: 0.2, tier: "S" }
              ]
          }
          ],
          miniBoss: {
            name: "Cow King",
            hp: 500,
            maxHP: 500,
            image: "cow_king.png",
            timeLimit: 45,
            dropTable: [
              { item: "Golden Hide", chance: 1, tier: "B" },
              { item: "Cow Crown", chance: 1 / 50, tier: "S" },
            ],
            unlocked: false,
          },
        },
        goblinvillage: {
          name: "Goblin Village",
          currentLevel: 1,
          highestLevel: 1,
          completedLevels: [],
          monstersPerLevel: 10,
          currentKills: 0,
          monster: null,
          variants: [
            {
              name: "Goblin", // Levels 1-9
              baseHP: 25,
              baseDamage: 3,
              image: "goblin.png",
              weight: 100,
              tier: "C",
              dropTable: [
                { item: "Bones", chance: 1.0, tier: "C" },
                { item: "Rusty Sword", chance: 0.3, tier: "B" },
              ],
            },
            {
              name: "Goblin Chief", // Unlocks at level 10-19
              baseHP: 40,
              baseDamage: 5,
              image: "goblin_chief.png",
              weight: 70,
              tier: "B",
              dropTable: [
                { item: "Ornate Bracelet", chance: 0.4, tier: "A" },
                { item: "Chief's Helm", chance: 0.1, tier: "S" },
              ],
            },
            {
              name: "Goblin Brute", // Unlocks at level 20+
              baseHP: 55,
              baseDamage: 7,
              image: "goblin_brute.png",
              weight: 50,
              tier: "A",
              dropTable: [
                { item: "Broken Chainmail", chance: 0.6, tier: "B" },
                { item: "Brute Force Potion", chance: 0.2, tier: "A" },
              ],
            },
          ],
          miniBoss: {
            name: "Goblin Warlord",
            hp: 800,
            maxHP: 800,
            image: "goblin_warlord.png",
            timeLimit: 60,
            dropTable: [{ item: "Warlord's Helm", chance: 1, tier: "A" }],
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
        dropTable: [{ item: "Giant's Ring", chance: 1, tier: "S" }],
      },
    },
// Replace the varrock section in gameData.regions
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

// Add to GAME_CONFIG at the top of your file
const CHAMPION_CONFIG = {
    BASE_COST: 100,
    COST_MULTIPLIER: 1.15,  // Each level costs 15% more
    DPS_MULTIPLIER: 1.1,    // Each level increases DPS by 10%
    UNLOCK_COST_MULTIPLIER: 5, // Each new champion costs 5x more than the previous

    UNLOCK_CONDITIONS: {
        warrior: { level: 1, cost: 100 },  // Starter champion
        archer: { 
            level: 10, 
            cost: 1000,
            requires: {
                monstersKilled: 100,
                gold: 1000
            }
        },
        mage: { 
            level: 25, 
            cost: 5000,
            requires: {
                bossesKilled: 5,
                gold: 5000,
                championLevels: { warrior: 10, archer: 5 }
            }
        }
    }
};

// Define champions data
const championsData = {
    champions: [
        {
            id: "clickWarrior",
            name: "Cid the Clicker",
            baseCost: 100,
            baseDamage: 0, // Base damage is 0 because this champion boosts click damage instead
            clickDamageBonus: 1, // Starts with +1 click damage
            description: "A warrior who enhances your clicking power",
            image: "cid.png",
            unlocked: true,
            upgrades: [
                { level: 10, name: "Swift Strikes", effect: "Click Damage x2" },
                { level: 25, name: "Power Clicks", effect: "Click Damage x3" },
                { level: 50, name: "Legendary Clicks", effect: "Click Damage x5" }
            ]
        },
        {
            id: "warrior",
            name: "Warrior",
            baseCost: 250,
            baseDPS: 5,
            description: "A basic melee fighter",
            image: "warrior.png",
            unlocked: true,
            upgrades: [
                { level: 10, name: "Sharp Blade", effect: "DPS x2" },
                { level: 25, name: "Combat Training", effect: "DPS x3" },
                { level: 50, name: "Warrior's Spirit", effect: "DPS x5" }
            ]
        },
        {
            id: "archer",
            name: "Ranger",
            baseCost: 500,
            baseDPS: 25,
            description: "Attacks from range with a bow",
            image: "ranger.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Precise Shot", effect: "DPS x2" },
                { level: 25, name: "Rapid Fire", effect: "DPS x3" },
                { level: 50, name: "Eagle Eye", effect: "DPS x5" }
            ]
        },
        {
            id: "mage",
            name: "Mage",
            baseCost: 2500,
            baseDPS: 125,
            description: "Casts powerful spells",
            image: "mage.png",
            unlocked: false,
            upgrades: [
                { level: 10, name: "Arcane Focus", effect: "DPS x2" },
                { level: 25, name: "Elemental Mastery", effect: "DPS x3" },
                { level: 50, name: "Ancient Magic", effect: "DPS x5" }
            ]
        }
    ]
};

// Update the calculateChampionDPS function to handle click damage bonus
function calculateChampionBonus(champion, level) {
    try {
        if (!champion || level < 0) return 0;

        if (champion.id === "clickWarrior") {
            let clickBonus = champion.clickDamageBonus * level;
            
            // Apply upgrade multipliers
            champion.upgrades.forEach(upgrade => {
                if (level >= upgrade.level) {
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
            
            champion.upgrades.forEach(upgrade => {
                if (level >= upgrade.level) {
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

// Add champion functions
function calculateChampionCost(champion, level) {
    return Math.floor(champion.baseCost * Math.pow(CHAMPION_CONFIG.COST_MULTIPLIER, level));
}

function calculateChampionDPS(champion, level) {
    try {
        if (!champion || !champion.baseDPS || level < 0) return 0;

        let dps = champion.baseDPS * Math.pow(CHAMPION_CONFIG.DPS_MULTIPLIER, level - 1);
        
        // Apply upgrade multipliers
        champion.upgrades.forEach(upgrade => {
            if (level >= upgrade.level) {
                const multiplier = parseInt(upgrade.effect.split('x')[1]);
                if (!isNaN(multiplier)) {
                    dps *= multiplier;
                }
            }
        });
        
        return Math.max(0, Math.floor(dps));
    } catch (error) {
        console.error("Error calculating champion DPS:", error);
        return 0;
    }
}

function buyChampion(championId) {
    try {
        const champion = championsData.champions.find(c => c.id === championId);
        if (!champion || !champion.unlocked) return;

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
            player.gold -= cost;
            player.champions.owned[championId].level = nextLevel;

            if (champion.id === "clickWarrior") {
                // Update click damage bonus
                const bonus = calculateChampionBonus(champion, nextLevel);
                player.champions.owned[championId].clickDamageBonus = bonus;
                player.damage = Math.max(1, 1 + bonus); // Ensure minimum damage of 1
            } else {
                // Update DPS for regular champions
                const dps = calculateChampionBonus(champion, nextLevel);
                player.champions.owned[championId].currentDPS = dps;
            }
            
            updateTotalChampionDPS();

            // Spawn new monster with correct HP
            const zone = gameData.regions[currentRegion].zones[currentZone];
            if (zone) {
                if (player.currentBoss) {
                    // Maintain boss HP ratio when upgrading
                    const hpRatio = player.currentBoss.hp / player.currentBoss.maxHp;
                    if (player.currentBoss.isMiniBoss) {
                        const scaledHP = calculateHP(zone.miniBoss.hp, zone.currentLevel, true);
                        player.currentBoss.maxHp = scaledHP;
                        player.currentBoss.hp = Math.ceil(scaledHP * hpRatio);
                    } else if (player.currentBoss.isRegionBoss) {
                        const region = gameData.regions[currentRegion];
                        player.currentBoss.maxHp = region.regionBoss.hp;
                        player.currentBoss.hp = Math.ceil(region.regionBoss.hp * hpRatio);
                    }
                } else {
                    // Spawn new regular monster
                    spawnMonster(zone);
                }
            }
            
            // Check for upgrades
            const newUpgrade = champion.upgrades.find(u => u.level === nextLevel);
            if (newUpgrade) {
                showLoot(`${champion.name} unlocked upgrade: ${newUpgrade.name}!`, "S");
            }

            renderChampionsPanel();
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
    } catch (error) {
        console.error("Error updating total DPS:", error);
        player.champions.totalDPS = 0;
    }
}

// Add to your game loop
function applyChampionDPS() {
    if (player.champions.totalDPS <= 0) return;

    const zone = gameData.regions[currentRegion].zones[currentZone];
    if (!zone || !zone.monster) return;

    if (player.currentBoss) {
        player.currentBoss.hp -= player.champions.totalDPS;
        if (player.currentBoss.hp <= 0) {
            handleBossDefeat(zone);
        }
    } else {
        zone.monster.hp -= player.champions.totalDPS;
        if (zone.monster.hp <= 0) {
            handleMonsterDeath(zone);
        }
    }
    updateUI();
}

// Add this to your initGame function
function initializeChampions() {
    if (!player.champions) {
        player.champions = {
            owned: {},
            totalDPS: 0
        };
    }
    // Start champion DPS application
    setInterval(applyChampionDPS, 1000);
}

function checkChampionUnlock(championId) {
    const champion = championsData.champions.find(c => c.id === championId);
    if (!champion) return false;

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

function renderChampionsPanel() {
    try {
        const container = document.getElementById('champions-panel');
        if (!container) return;

        // Initialize champions if needed
        if (!player.champions) {
            player.champions = {
                owned: {},
                totalDPS: 0
            };
        }

        // Calculate and update total DPS before rendering
        updateTotalChampionDPS();

        let html = `
            <div class="champions-header">
                <h2>Champions</h2>
                <div class="total-dps">Total DPS: ${formatNumber(player.champions.totalDPS)}</div>
            </div>
            <div class="champions-container">
        `;

        championsData.champions.forEach(champion => {
            const owned = player.champions.owned[champion.id] || { level: 0, currentDPS: 0, clickDamageBonus: 0 };
            const isUnlocked = champion.unlocked || owned.level > 0;
            const canUnlock = !isUnlocked && checkChampionUnlock(champion.id);

            if (isUnlocked) {
                // Calculate next level cost
                const nextLevelCost = calculateChampionCost(champion, owned.level + 1);
                const canAfford = player.gold >= nextLevelCost;

                // Calculate current stats (DPS or Click Damage)
                let currentStat = '';
                if (champion.id === "clickWarrior") {
                    currentStat = `Click Damage: ${formatNumber(owned.clickDamageBonus || 0)}`;
                } else {
                    currentStat = `DPS: ${formatNumber(calculateChampionDPS(champion, owned.level))}`;
                }

                html += `
                    <div class="champion-card ${canAfford ? 'can-afford' : ''}">
                        <div class="champion-header">
                            <img src="assets/champions/${champion.image}" alt="${champion.name}">
                            <div class="champion-info">
                                <h3>${champion.name}</h3>
                                <p>Level ${owned.level}</p>
                                <p>${currentStat}</p>
                            </div>
                        </div>
                        <div class="champion-description">
                            <p>${champion.description}</p>
                        </div>
                        <div class="champion-upgrades">
                            ${champion.upgrades.map(upgrade => `
                                <div class="upgrade ${owned.level >= upgrade.level ? 'unlocked' : 'locked'}">
                                    ${upgrade.name} (Level ${upgrade.level})
                                    <span class="upgrade-effect">${upgrade.effect}</span>
                                </div>
                            `).join('')}
                        </div>
                        <button class="osrs-button" 
                            onclick="buyChampion('${champion.id}')"
                            ${canAfford ? '' : 'disabled'}>
                            Level Up (${formatNumber(nextLevelCost)} gold)
                        </button>
                    </div>
                `;
            } else {
                // Show locked champion card
                html += `
                    <div class="champion-card locked ${canUnlock ? 'can-unlock' : ''}">
                        <div class="champion-header">
                            <img src="assets/champions/${champion.image}" alt="${champion.name}" class="locked-image">
                            <div class="champion-info">
                                <h3>${champion.name}</h3>
                                <p>${champion.description}</p>
                            </div>
                        </div>
                        <div class="unlock-requirements">
                            <h4>Requirements:</h4>
                            <ul>
                                <li>💰 ${formatNumber(champion.baseCost)} Gold</li>
                                ${champion.unlockRequirements ? Object.entries(champion.unlockRequirements).map(([req, val]) => `
                                    <li>${formatRequirement(req, val)}</li>
                                `).join('') : ''}
                            </ul>
                        </div>
                        <button class="osrs-button" 
                            onclick="unlockChampion('${champion.id}')"
                            ${canUnlock ? '' : 'disabled'}>
                            ${canUnlock ? 'Unlock Champion' : 'Locked'}
                        </button>
                    </div>
                `;
            }
        });

        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error("Error rendering champions panel:", error);
        showLoot("Error updating champions display", "error");
    }
}

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
        const conditions = CHAMPION_CONFIG.UNLOCK_CONDITIONS[championId];

        // Deduct gold cost
        player.gold -= conditions.cost;

        // Unlock champion
        champion.unlocked = true;

        // Initialize champion data
        player.champions.owned[championId] = {
            level: 0,
            currentDPS: 0
        };

        showLoot(`🎉 Unlocked ${champion.name}!`, "S");
        renderChampionsPanel();
        updateUI();
        saveGame();

    } catch (error) {
        console.error("Error unlocking champion:", error);
        showLoot("Error unlocking champion", "error");
    }
}

setInterval(applyChampionDPS, 1000); // Apply champion DPS every

// Initialize Game
let currentRegion = "lumbridge";
let currentZone = "cowpen";

// Add this helper function to format numbers
function formatNumber(num) {
    if (num < 1000000) { // Show regular numbers up to 1 million
        return num.toLocaleString();
    } else if (num < 1e21) { // Use standard notation up to 1 sextillion
        return num.toLocaleString();
    } else {
        return num.toExponential(2); // Switch to scientific notation, showing 2 decimal places
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

// Function to calculate base monster gold for a given level
function calculateBaseGold(level) {
    if (level <= 140) {
        return Math.floor(Math.pow(1.6, level - 1));
    } else {
        const baseGold = 4.717e28; // Base gold at level 140
        return Math.floor(baseGold * Math.pow(1.15, level - 140));
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

// Add this function to update item values when level changes
function updateItemValues(level) {
    Object.entries(itemData).forEach(([itemName, data]) => {
        data.value = calculateItemValue(data.tier, level);
    });
}

// Add item data constant
const getItemData = () => ({
  // Common Items (C Tier)
  "Cowhide": {
    tier: "C",
    value: 0,
    description: "Raw hide from a cow",
    image: "cowhide.png",
    region: "lumbridge",
    zone: "cowpen"
},
"Beef": {
    tier: "C",
    value: 0,
    description: "Raw beef",
    image: "raw_beef.png"
},
  "Bones": {
    tier: "C", 
    value: 0,
    description: "Regular bones",
    image: "bones.png",
  },
  "Rotting Hide": {
    tier: "C",
    value: 0,
    description: "A decomposing cow hide",
    image: "rotting_hide.png",
  },

  // Uncommon Items (B Tier)
  "Shiny Hide": {
    tier: "B",
    value: 0,
    description: "Glowing bovine hide",
    image: "shiny_hide.png",
  },
  "Golden Hide": {
    tier: "B",
    value: 0,
    description: "Rare golden cowhide",
    image: "golden_hide.png",
  },
  "Rusty Sword": {
    tier: "B",
    value: 0,
    description: "An old goblin's Sword",
    image: "Rusty_Sword.png",
  },
  "Broken Chainmail": {
    tier: "B",
    value: 0,
    description: "Damaged goblin armor",
    image: "broken_chainmail.png",
  },

  // Rare Items (A Tier)
  "Moon Beef": {
    tier: "A",
    value: 0,
    description: "Meat infused with lunar energy",
    image: "moon_beef.png",
  },
  "Ornate Bracelet": {
    tier: "A",
    value: 0,
    description: "A goblin chief's jewelry",
    image: "ornate_bracelet.png",
  },
  "Brute Force Potion": {
    value: 0,
    value: 250,
    description: "A goblin's strength brew",
    image: "brute_potion.png",
  },
  "Cow Mask": {
    tier: "A",
    value: 0,
    description: "A fearsome cow mask",
    image: "cow_mask.png",
  },
  "Goblin Mail": {
    tier: "A",
    value: 0,
    description: "Goblin chainmail armor",
    image: "goblin_mail.png",
  },
  "Warlord's Helm": {
    tier: "A",
    value: 0,
    description: "Helmet of the Goblin Warlord",
    image: "warlord_helm.png",
  },

  // Super Rare Items (S Tier)
  "Cursed Hoof": {
    tier: "S",
    value: 0,
    description: "A darkly pulsating hoof",
    image: "cursed_hoof.png",
  },
  "Chief's Helm": {
    tier: "S",
    value: 0,
    description: "Helmet of a goblin chief",
    image: "chiefs_helm.png",
  },
  "Cow Crown": {
    tier: "S",
    value: 0,
    description: "Crown of the Cow King",
    image: "cow_crown.png",
  },
  "Giant's Ring": {
    tier: "S",
    value: 0,
    description: "Ring of the Lumbridge Giant",
    image: "giant_ring.png",
  },
  "Elite Hide": {
    tier: "S",
    value: 0,
    description: "A legendary hide from an Elite Cow",
    image: "elite_hide.png"
},
"Elite Horn": {
    tier: "S",
    value: 0,
    description: "A powerful horn from an Elite Cow",
    image: "elite_horn.png"
},
"Elite Crown": {
    tier: "S",
    value: 0,
    description: "A crown worn by the Elite Cow",
    image: "elite_crown.png"
},
"Supreme Hide": {
    tier: "S",
    value: 0,
    description: "A mythical hide from a Supreme Elite Cow",
    image: "supreme_hide.png"
},
"Supreme Horn": {
    tier: "S",
    value: 0,
    description: "An incredibly powerful horn",
    image: "supreme_horn.png"
},
"Supreme Crown": {
    tier: "S",
    value: 0,
    description: "A crown of supreme power",
    image: "supreme_crown.png"
},
"Stolen Valuables": {
        tier: "C",
        value: 0,
        description: "A bunch of stolen valuables",
        image: "stolen_valuables.png"
    },
    "Lockpick": {
        tier: "C",
        value: 0,
        description: "A basic lockpicking tool",
        image: "lockpick.png"
    },
    "Thief's Cape": {
        tier: "A",
        value: 0,
        description: "Cape worn by master thieves",
        image: "thief_cape.png"
    },
    "Captain's Badge": {
        tier: "S",
        value: 0,
        description: "Badge of the Varrock Guard Captain",
        image: "captain_badge.png"
    },
// Add to your getItemData function
"Guard Badge": {
    tier: "B",
    value: 0,
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
"Assassin's Blade": {
    tier: "S",
    value: 0,
    description: "A deadly assassin's weapon",
    image: "assassin_blade.png"
},
"Shadow Cape": {
    tier: "S",
    value: 0,
    description: "A cape that blends with shadows",
    image: "shadow_cape.png"
},
"Master's Lockpick": {
    tier: "S",
    value: 0,
    description: "An expert thief's tool",
    image: "master_lockpick.png"
}
// ... Add other new items for the Slums zone
});

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
      stopAutoClicker();
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
          autoClickerDisplay: document.getElementById("stat-auto"),
          luckDisplay: document.getElementById("stat-luck"),
          prestigeDisplay: document.getElementById("stat-prestige"),
          monstersKilledDisplay: document.getElementById("stat-monsters"),
          bossesKilledDisplay: document.getElementById("stat-bosses"),

          // Buttons and special elements
          autoClickerToggle: document.getElementById("auto-clicker-toggle"),
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
          this.elements.healthText.textContent = `${monster.hp}/${monster.maxHp} HP`;
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
      if (elements.goldDisplay) elements.goldDisplay.textContent = player.gold.toLocaleString();
      if (elements.damageDisplay) elements.damageDisplay.textContent = player.damage;
      if (elements.autoClickerDisplay) elements.autoClickerDisplay.textContent = player.autoClickerLevel;
      if (elements.luckDisplay) elements.luckDisplay.textContent = `${player.luck.toFixed(1)}x`;
      if (elements.prestigeDisplay) elements.prestigeDisplay.textContent = player.prestigeLevel;
      if (elements.monstersKilledDisplay) elements.monstersKilledDisplay.textContent = player.stats.monstersKilled;
      if (elements.bossesKilledDisplay) elements.bossesKilledDisplay.textContent = player.stats.bossesKilled;
      if (elements.goldDisplay) {
        elements.goldDisplay.textContent = player.gold.toLocaleString();
        updateGoldIcon(player.gold); // Add this line
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

      // Update Auto-Clicker Toggle
      if (this.elements.autoClickerToggle) {
          this.elements.autoClickerToggle.style.display = player.autoClickerLevel !== "None" ? "block" : "none";
          if (player.autoClickerLevel !== "None") {
              updateAutoClickerButton();
          }
      }
  }
};

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

function getZoneTitleForLevel(zoneName, level) {
  const tier = Math.floor((level - 1) / 10);
  const zoneNames = {
    cowpen: [
      "Cow Pen", // Levels 1-10
      "Dairy Plains", // Levels 11-20
      "Bovine Fields", // Levels 21-30
      "Cattle Kingdom", // Levels 31-40
      "Ancient Pastures", // Levels 41+
    ],
    goblinvillage: [
      "Goblin Village", // Levels 1-10
      "Goblin Outpost", // Levels 11-20
      "Goblin Stronghold", // Levels 21-30
      "Goblin Fortress", // Levels 31-40
      "Goblin City", // Levels 41+
    ],
  };

  const names = zoneNames[zoneName] || [zoneName];
  return names[Math.min(tier, names.length - 1)];
}

// Load initial monster
gameData.regions[currentRegion].zones[currentZone].monster =
  getCurrentMonsterStats(gameData.regions[currentRegion].zones[currentZone]);

// Combat System
document
  .getElementById("attack-button")
  .addEventListener("click", attackHandler);

  function saveGame() {
    try {
        const saveData = {
            version: GAME_CONFIG.SAVE_VERSION,
            player: JSON.stringify(player),
            gameState: {
                currentRegion,
                currentZone,
                regions: Object.entries(gameData.regions).reduce((acc, [regionName, region]) => {
                    acc[regionName] = {
                        unlocked: region.unlocked,
                        miniBossesDefeated: region.miniBossesDefeated,
                        bossDefeated: region.bossDefeated,
                        zones: Object.entries(region.zones).reduce((zoneAcc, [zoneName, zone]) => {
                            zoneAcc[zoneName] = {
                                currentLevel: zone.currentLevel,
                                highestLevel: zone.highestLevel,
                                completedLevels: zone.completedLevels,
                                currentKills: zone.currentKills,
                                defeatedMiniBosses: zone.defeatedMiniBosses || [],
                                monstersPerLevel: zone.monstersPerLevel
                            };
                            return zoneAcc;
                        }, {})
                    };
                    return acc;
                }, {})
            },
            timestamp: Date.now()
        };
        
        localStorage.setItem("gameSave", JSON.stringify(saveData));
    } catch (error) {
        console.error("Error saving game:", error);
        showLoot("Error saving game", "error");
    }
}

setInterval(() => {
  if (player.settings.autoSave) saveGame();
}, GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);  // Changed from 30000

function attackHandler() {
    try {
        const zone = gameData.regions[currentRegion].zones[currentZone];
        const monster = player.currentBoss || zone.monster;
        
        if (!monster) {
            console.error('No monster found');
            return;
        }

        // Ensure damage is a valid number
        const clickDamage = Math.max(1, player.damage);
        if (isNaN(clickDamage)) {
            console.error('Invalid damage value:', player.damage);
            return;
        }

        // Add attack animation
        const monsterSprite = document.getElementById('monster-sprite');
        if (monsterSprite) {
            monsterSprite.classList.add('attack-animation');
            setTimeout(() => monsterSprite.classList.remove('attack-animation'), 200);
        }

        // Apply damage
        if (player.currentBoss) {
            player.currentBoss.hp = Math.max(0, player.currentBoss.hp - clickDamage);
            if (player.currentBoss.hp <= 0) {
                if (player.currentBoss.isRegionBoss) {
                    handleRegionBossDefeat(gameData.regions[currentRegion]);
                } else {
                    handleBossDefeat(zone);
                }
            }
        } else {
            zone.monster.hp = Math.max(0, zone.monster.hp - clickDamage);
            if (zone.monster.hp <= 0) {
                handleMonsterDeath(zone);
            }
        }

        updateUI();
    } catch (error) {
        console.error('Error handling attack:', error);
        showLoot('Error processing attack', 'error');
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

        // Filter variants based on zone and minimum level requirements
        const availableVariants = zone.variants.filter(variant => {
            // If variant has a specific level requirement (like bosses)
            if (variant.level) {
                return effectiveLevel >= variant.level;
            }

            // Regular monster variants with level ranges
            if (currentRegion === "lumbridge") {
                if (currentZone === "cowpen") {
                    switch (variant.name) {
                        case "Cow":
                            return true; // Always available (levels 1+)
                        case "Zanaris Cow":
                            return effectiveLevel >= 11; // Available from level 11+
                        case "Zombie Cow":
                            return effectiveLevel >= 21; // Available from level 21+
                        default:
                            return false;
                    }
                } else if (currentZone === "goblinvillage") {
                    switch (variant.name) {
                        case "Goblin":
                            return true; // Always available (levels 1+)
                        case "Goblin Chief":
                            return effectiveLevel >= 11; // Available from level 11+
                        case "Goblin Brute":
                            return effectiveLevel >= 21; // Available from level 21+
                        default:
                            return false;
                    }
                }
            } else if (currentRegion === "varrock") {
                if (currentZone === "marketplace") {
                    switch (variant.name) {
                        case "Thief":
                            return true; // Always available (levels 1+)
                        case "Guard":
                            return effectiveLevel >= 11; // Available from level 11+
                        case "Elite Guard":
                            return effectiveLevel >= 21; // Available from level 21+
                        case "Master Assassin":
                            return effectiveLevel >= 50; // Available from level 50+
                        default:
                            return false;
                    }
                } else if (currentZone === "slums") {
                    switch (variant.name) {
                        case "Street Rat":
                            return true; // Always available (levels 1+)
                        case "Gang Member":
                            return effectiveLevel >= 11; // Available from level 11+
                        case "Gang Leader":
                            return effectiveLevel >= 21; // Available from level 21+
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
            if (effectiveLevel > 30) {
                if (variant.name === "Zanaris Cow" || variant.name === "Goblin Chief" || 
                    variant.name === "Guard" || variant.name === "Gang Member") {
                    adjustedWeight *= 0.7;
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

        // Calculate scaled stats based on level
        function calculateStats(baseValue, level, isHP = false) {
            let scaledValue;
            
            if (isHP) {
                if (level === 1) {
                    // Base HP for level 1
                    scaledValue = baseValue;
                } else if (level <= 140) {
                    // Modified scaling for levels 2-140
                    scaledValue = baseValue * (1 + (level - 1) * 0.1);
                } else if (level <= 500) {
                    const base140 = baseValue * (1 + 139 * 0.1);
                    const levelDiff = level - 140;
                    scaledValue = base140 * Math.pow(1.145, levelDiff);
                } else {
                    const base500 = baseValue * (1 + 139 * 0.1) * Math.pow(1.145, 360);
                    const levelDiff = level - 500;
                    scaledValue = base500 * Math.pow(1.15, levelDiff);
                }
            } else {
                // For damage and other stats
                scaledValue = baseValue * (1 + (level - 1) * 0.05);
            }

            // Apply region multiplier
            scaledValue *= regionMultiplier;

            // Ensure the value is valid
            if (!Number.isFinite(scaledValue)) {
                console.warn("Value calculation exceeded safe limits, using maximum safe value");
                return Number.MAX_SAFE_INTEGER;
            }

            return Math.max(1, Math.floor(scaledValue));
        }

        // Calculate HP, damage, and gold values
        const hp = calculateStats(variant.baseHP, effectiveLevel, true);
        const damage = calculateStats(variant.baseDamage, effectiveLevel);
        const goldValue = calculateBaseGold(effectiveLevel) * regionMultiplier;

        // Create monster object
        const monster = {
            name: `${variant.name} Lv${effectiveLevel}`,
            hp: hp,
            maxHp: hp,
            damage: damage,
            image: Array.isArray(variant.images) ? 
                variant.images[Math.floor(Math.random() * variant.images.length)] : 
                variant.image,
            dropTable: variant.dropTable,
            goldValue: Math.floor(goldValue),
            tier: variant.tier || 'C'
        };

        // Announce new monster types at the start of each tier
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
        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion];
        const level = zone.currentLevel;

        // Calculate scaled HP and damage for miniboss
        const scaledHP = calculateHP(zone.miniBoss.hp, level, true) * regionMultiplier;
        const scaledDamage = Math.floor(zone.miniBoss.damage * regionMultiplier);

        // Set current boss data
        player.currentBoss = {
            name: `${zone.miniBoss.name} Lv${level}`,
            hp: scaledHP,
            maxHp: scaledHP,
            damage: scaledDamage,
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

// Helper function to calculate HP that is used by both regular monsters and bosses
function calculateHP(baseHP, level, isBoss = false) {
  let baseScaling;
  
  if (level <= 140) {
      baseScaling = 10 * (level - 1 + Math.pow(1.55, level));
  } 
  else if (level <= 500) {
      const base139 = 10 * (139 + Math.pow(1.55, 139));
      const levelDiff = level - 140;
      baseScaling = base139 * Math.pow(1.145, levelDiff);
  } 
  else if (level <= 200000) {
      const base500 = 10 * (139 + Math.pow(1.55, 139)) * Math.pow(1.145, 360);
      const levelDiff = level - 501;
      const dynamicRate = 1.145 + (0.001 * (levelDiff / 500));
      baseScaling = base500 * Math.pow(dynamicRate, levelDiff);
  }
  else {
      const levelDiff = level - 200001;
      const baseExp = Math.pow(1.545, levelDiff);
      const multiplier = 1.240 * Math.pow(10, 25409);
      baseScaling = baseExp * multiplier + (level - 1) * 10;

      if (!Number.isFinite(baseScaling)) {
          console.warn("HP calculation exceeded safe limits, using maximum safe value");
          baseScaling = Number.MAX_SAFE_INTEGER;
      }
  }

  // Apply boss multiplier (10x for bosses)
  return Math.floor(baseScaling * (isBoss ? 10 : 1));
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
      healthText.textContent = `${player.currentBoss.hp}/${player.currentBoss.maxHp} HP`;
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

function handleBossTimeout() {
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
      
      // Spawn regular monster
      const zone = gameData.regions[currentRegion].zones[currentZone];
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
        
        // Ensure completedLevels exists and is an array
        if (!zone.completedLevels) {
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
        if (nextBtn) nextBtn.disabled = currentPageStart + levelsPerPage > zone.highestLevel + 1;

    } catch (error) {
        console.error('Error rendering level select:', error);
        showLoot('Error updating level display', 'error');
    }
}

function updateHealthDisplay() {
  try {
      const zone = gameData.regions[currentRegion].zones[currentZone];
      const monster = player.currentBoss || zone.monster;
      if (!monster) return;

      const healthBar = document.getElementById('health-bar');
      const healthText = document.getElementById('health-text');
      const monsterName = document.getElementById('monster-name');
      
      // Update health bar width and color
      if (healthBar) {
          const healthPercent = (monster.hp / monster.maxHp) * 100;
          healthBar.style.width = `${healthPercent}%`;
          healthBar.style.backgroundColor = getHealthColor(healthPercent);
      }

      // Update health text
      if (healthText) {
          healthText.textContent = `${monster.hp}/${monster.maxHp} HP`;
      }

      // Update monster name
      if (monsterName) {
          monsterName.textContent = monster.name;
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
    const totalMiniBosses =
      Object.keys(region.zones).length * (50 / GAME_CONFIG_COMBAT.MINIBOSS_LEVEL_INTERVAL); // Total possible minibosses up to level 50
    const defeatedMiniBosses = Object.values(region.zones).reduce(
      (total, zone) => total + (zone.defeatedMiniBosses?.length || 0),
      0
    );

    // Update progress display if it exists
    const progressElement = document.getElementById("region-progress");
    if (progressElement) {
      progressElement.textContent = `Region Progress: ${defeatedMiniBosses}/${totalMiniBosses} Mini-bosses`;
    }

    return defeatedMiniBosses >= totalMiniBosses;
  } catch (error) {
    console.error("Error updating region progress:", error);
    return false;
  }
}

function selectLevel(level) {
    try {
        const zone = gameData.regions[currentRegion].zones[currentZone];
        const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;

        // Prevent selecting levels above the cap
        if (level > regionCap) {
            showLoot(`Cannot exceed level cap (${regionCap}) in ${GAME_CONFIG.REGIONS[currentRegion].name}`, "error");
            return;
        }
        
        // Initialize arrays if they don't exist
        if (!zone.completedLevels) {
            zone.completedLevels = [];
        }

        // Can only access completed levels or the next available level
        const highestCompletedLevel = Math.max(...zone.completedLevels, 0);
        if (level > highestCompletedLevel + 1) {
            showLoot("Must complete previous levels first!", "error");
            return;
        }

        // Clear existing boss state
        if (player.currentBoss) {
            clearInterval(player.bossTimer);
            player.bossTimer = null;
            player.currentBoss = null;
        }

        // Hide boss timer display
        const bossTimer = document.getElementById("boss-timer");
        if (bossTimer) {
            bossTimer.style.display = "none";
        }

        // Set new level and reset kills
        zone.currentLevel = level;
        zone.currentKills = 0;

        // Update highest level if needed
        if (level > zone.highestLevel) {
            zone.highestLevel = level;
            showLoot(`🎉 New highest level in ${formatZoneName(currentZone)}: ${zone.currentLevel}!`, "S");
        }

        // Handle miniboss/elite boss levels
        const isMiniBossLevel = level % GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL === 0;
        const isEliteBossLevel = level % GAME_CONFIG.COMBAT.ELITE_BOSS_INTERVAL === 0;

        if (isMiniBossLevel || isEliteBossLevel) {
            showLoot(`👑 ${isEliteBossLevel ? 'Elite' : 'Mini'}-boss encounter at level ${level}!`, "S");
            spawnMiniBoss(zone);
            if (bossTimer) {
                bossTimer.style.display = "block";
            }
        } else {
            spawnMonster(zone);
        }

        updateItemValues(level);
        updateUI();
        renderLevelSelect();
        updateInventory();
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
        // Check if all zones have reached their level cap
        const allZonesAtCap = Object.values(region.zones).every(zone => {
            const regionCap = GAME_CONFIG.REGIONS[currentRegion].levelCap;
            return zone.currentLevel >= regionCap;
        });

        // If all zones are at cap and boss isn't defeated yet, show boss
        if (allZonesAtCap && !region.bossDefeated) {
            showBossConfirmation();
        }

        return allZonesAtCap && region.bossDefeated;
    } catch (error) {
        console.error("Error checking region completion:", error);
        return false;
    }
}

function handleLevelUp(zone) {
    try {
        // Reset kills for current level
        zone.currentKills = 0;

        // Initialize completedLevels array if it doesn't exist
        if (!zone.completedLevels) {
            zone.completedLevels = [];
        }

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
            
            // Check if all zones in the region are at cap
            const region = gameData.regions[currentRegion];
            const allZonesAtCap = Object.values(region.zones).every(z => z.currentLevel >= regionCap);

            // If all zones are at cap and boss isn't defeated, show boss button
            if (allZonesAtCap && !region.bossDefeated) {
                const regionBossBtn = document.getElementById("region-boss-btn");
                if (regionBossBtn) {
                    regionBossBtn.style.display = "block";
                }
            }
        } else {
            // Normal level up progression
            zone.currentLevel++;

            // Update highest level if needed
            if (zone.currentLevel > zone.highestLevel) {
                zone.highestLevel = zone.currentLevel;
                showLoot(`🎉 New highest level in ${formatZoneName(currentZone)}: ${zone.currentLevel}!`, "S");
            }

            // Handle zone name changes
            if (zone.currentLevel % 10 === 1) {
                const zoneNameElement = document.getElementById("zone-name");
                if (zoneNameElement) {
                    zoneNameElement.classList.add("changing");
                    setTimeout(() => zoneNameElement.classList.remove("changing"), 500);
                }
                showLoot(`🌟 Entering new area: ${getZoneTitleForLevel(currentZone, zone.currentLevel)}!`, "S");
            }

            // Spawn appropriate monster or boss
            const isMiniBossLevel = zone.currentLevel % GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL === 0;
            if (isMiniBossLevel) {
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
        saveGame();

    } catch (error) {
        console.error("Error handling level up:", error);
        showLoot("Error processing level up", "error");
    }
}

function handleMonsterDeath(zone) {
  try {
    if (!zone || !zone.monster) {
      console.error("Invalid zone or monster");
      return;
    }

    // Increment kills only for regular monsters
    if (!player.currentBoss) {
      zone.currentKills++;
    }

    // Add gold and update stats
    player.gold += zone.monster.goldValue;
    player.stats.monstersKilled++;

    // Handle drops
    if (player.currentBoss) {
      lootItem(player.currentBoss.dropTable);
      showLoot(`Defeated ${player.currentBoss.name}!`, "S-tier");
      player.stats.bossesKilled++;
      handleBossDefeat(zone);
    } else {
      lootItem(zone.monster.dropTable);
      // Check if we've reached required kills for level up
      if (zone.currentKills >= zone.monstersPerLevel) {
        handleLevelUp(zone);
      } else {
        // Spawn new monster if we haven't reached required kills
        spawnMonster(zone);
      }
    }

    // Update UI
    checkAchievements(); // Add this line
    updateUI();
    renderLevelSelect();
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

function preloadAssets() {
  return new Promise((resolve, reject) => {
      try {
          const imagePromises = [];
          const images = new Set();

          // Add game assets
          Object.values(gameData.regions).forEach(region => {
              Object.values(region.zones).forEach(zone => {
                  zone.variants.forEach(variant => {
                      const imagePath = `assets/${variant.image}`;
                      if (!images.has(imagePath)) {
                          images.add(imagePath);
                          imagePromises.push(loadImage(imagePath));
                      }
                  });
              });
          });

          // Add item assets
          Object.values(itemData).forEach(item => {
              const imagePath = `assets/items/${item.image}`;
              if (!images.has(imagePath)) {
                  images.add(imagePath);
                  imagePromises.push(loadImage(imagePath));
              }
          });

          Promise.all(imagePromises)
              .then(() => resolve())
              .catch(error => reject(error));
      } catch (error) {
          reject(error);
      }
  });
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

            // Track first-time defeat only
            if (!zone.defeatedMiniBosses.includes(zone.currentLevel)) {
                zone.defeatedMiniBosses.push(zone.currentLevel);
                zone.defeatedMiniBosses.sort((a, b) => a - b); // Keep sorted

                const region = gameData.regions[currentRegion];
                region.miniBossesDefeated++;

                // Check for region boss unlock
                const totalMiniBosses = Object.keys(region.zones).length * 
                    (50 / GAME_CONFIG.COMBAT.MINIBOSS_LEVEL_INTERVAL);
                if (region.miniBossesDefeated >= totalMiniBosses) {
                    showBossConfirmation();
                }

                showLoot(`🎯 First time ${player.currentBoss.name} defeat!`, "S");
            }
        }

        // Handle elite boss defeat
        if (player.currentBoss?.isEliteBoss) {
            showLoot(`⚔️ Defeated Elite Boss: ${player.currentBoss.name}!`, "S");
        }

        // Clear boss state
        clearInterval(player.bossTimer);
        player.bossTimer = null;

        // Add loot and update stats
        if (player.currentBoss.dropTable) {
            lootItem(player.currentBoss.dropTable);
        }
        player.stats.bossesKilled++;

        // Calculate gold reward with region multiplier
        const baseGold = calculateBaseGold(zone.currentLevel);
        const regionMultiplier = REGION_DIFFICULTY_MULTIPLIERS[currentRegion];
        const goldReward = Math.floor(baseGold * regionMultiplier * (player.currentBoss.isEliteBoss ? 3 : 2));
        
        player.gold += goldReward;
        player.stats.totalGoldEarned += goldReward;

        // Progress to next level
        player.currentBoss = null;
        zone.currentLevel++;
        zone.currentKills = 0;

        // Update highest level if needed
        if (zone.currentLevel > zone.highestLevel) {
            zone.highestLevel = zone.currentLevel;
        }

        // Hide boss timer display
        const bossTimer = document.getElementById("boss-timer");
        if (bossTimer) {
            bossTimer.style.display = "none";
        }

        // Spawn next level's monster
        spawnMonster(zone);

        // Update UI elements
        updateItemValues(zone.currentLevel);
        checkAchievements(); // Add this line
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
        const modalContainer = document.getElementById("modal-container");

        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <h2>Region Boss Available!</h2>
                    <p>All zones in ${region.name} have reached level cap ${GAME_CONFIG.REGIONS[currentRegion].levelCap}!</p>
                    <p>Would you like to fight the ${region.regionBoss.name}?</p>
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

function closeModal() {
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) {
    modalContainer.style.display = "none";
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

    // Reset auto-clicker
    cleanupAutoClicker();

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

// Add this pricing function
function calculateWeaponPrice(level) {
  if (level <= 15) {
      return Math.floor((5 + level) * Math.pow(1.07, level - 1));
  } else {
      return Math.floor(20 * Math.pow(1.07, level - 1));
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

// Shop System
const shopItems = {
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
        name: "Basic Auto-Clicker",
        price: 500,
        effect: {
            interval: 2000, // 2 seconds
            damage: 1,
        },
        type: "auto",
        nextTier: {
            name: "Copper Auto-Clicker",
            price: 1500,
            effect: {
                interval: 1800, // 1.8 seconds
                damage: 2,
            },
            type: "auto",
            nextTier: {
                name: "Iron Auto-Clicker",
                price: 3000,
                effect: {
                    interval: 1600, // 1.6 seconds
                    damage: 4,
                },
                type: "auto",
                nextTier: {
                    name: "Steel Auto-Clicker",
                    price: 6000,
                    effect: {
                        interval: 1400, // 1.4 seconds
                        damage: 8,
                    },
                    type: "auto",
                    nextTier: {
                        name: "Mithril Auto-Clicker",
                        price: 12000,
                        effect: {
                            interval: 1200, // 1.2 seconds
                            damage: 16,
                        },
                        type: "auto",
                        nextTier: {
                            name: "Adamant Auto-Clicker",
                            price: 25000,
                            effect: {
                                interval: 1000, // 1 second
                                damage: 32,
                            },
                            type: "auto",
                            nextTier: {
                                name: "Rune Auto-Clicker",
                                price: 50000,
                                effect: {
                                    interval: 800, // 0.8 seconds
                                    damage: 64,
                                },
                                type: "auto",
                                nextTier: {
                                    name: "Dragon Auto-Clicker",
                                    price: 100000,
                                    effect: {
                                        interval: 600, // 0.6 seconds
                                        damage: 128,
                                    },
                                    type: "auto",
                                    nextTier: {
                                        name: "Crystal Auto-Clicker",
                                        price: 250000,
                                        effect: {
                                            interval: 400, // 0.4 seconds
                                            damage: 256,
                                        },
                                        type: "auto",
                                        nextTier: {
                                            name: "Divine Auto-Clicker",
                                            price: 500000,
                                            effect: {
                                                interval: 200, // 0.2 seconds
                                                damage: 512,
                                            },
                                            type: "auto"
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

const itemPrices = {
  // Common (C) tier items
  Cowhide: 20,
  Beef: 15,
  Bones: 10,
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

// Helper function to calculate DPS
function calculateAutoclickerDPS(tier) {
    return (tier.effect.damage * 1000) / tier.effect.interval;
}

/* DPS for each tier:
Basic:    0.5 DPS (1 damage every 2s)
Copper:   1.1 DPS (2 damage every 1.8s)
Iron:     2.5 DPS (4 damage every 1.6s)
Steel:    5.7 DPS (8 damage every 1.4s)
Mithril:  13.3 DPS (16 damage every 1.2s)
Adamant:  32 DPS (32 damage every 1s)
Rune:     80 DPS (64 damage every 0.8s)
Dragon:   213.3 DPS (128 damage every 0.6s)
Crystal:  640 DPS (256 damage every 0.4s)
Divine:   2,560 DPS (512 damage every 0.2s)
*/

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
                          ${nextUpgrade.effect.luck ? `<div class="effect">🍀 +${nextUpgrade.effect.luck} Luck</div>` : ""}
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
      const container = document.querySelector(".shop-items-container");
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

      // Handle auto-clicker purchase/upgrade
      if (item.type === 'auto') {
          player.autoClickerLevel = item.name;
          player.autoClickerDamage = item.effect.damage;
          player.autoClickerInterval = item.effect.interval;
          player.autoClickerPaused = false;

          const toggleBtn = document.getElementById('auto-clicker-toggle');
          if (toggleBtn) {
              toggleBtn.style.display = 'block';
          }
          startAutoClicker();
      }

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
  if (effect.interval) startAutoClicker(effect.interval, effect.damage);
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

function loadGame() {
  try {
    const savedData = localStorage.getItem("gameSave");
    if (savedData) {
        const parseData = JSON.parse(savedData);
        if (parseData.version !== GAME_CONFIG.SAVE_VERSION) {
            console.warn("Save version mismatch, using default values");
            return;
        }

        // Load player data
        const savedPlayer = JSON.parse(parseData.player);
        player = { 
            ...player, 
            ...savedPlayer,
            autoClickerPaused: savedPlayer.autoClickerPaused || false,
            autoClickerInterval: savedPlayer.autoClickerInterval || 1000
        };

          // Load game state and update current region/zone
          if (parseData.gameState) {
              currentRegion = parseData.gameState.currentRegion || "lumbridge";
              currentZone = parseData.gameState.currentZone || "cowpen";

              // Load region data
              Object.entries(parseData.gameState.regions).forEach(([regionName, regionData]) => {
                  if (gameData.regions[regionName]) {
                      const region = gameData.regions[regionName];
                      region.unlocked = regionData.unlocked;
                      region.miniBossesDefeated = regionData.miniBossesDefeated;
                      region.bossDefeated = regionData.bossDefeated;

                      // Load zone data
                      Object.entries(regionData.zones).forEach(([zoneName, zoneData]) => {
                          if (region.zones[zoneName]) {
                              const zone = region.zones[zoneName];
                              zone.currentLevel = zoneData.currentLevel || 1;
                              zone.highestLevel = zoneData.highestLevel || 1;
                              zone.completedLevels = zoneData.completedLevels || [];
                              zone.currentKills = zoneData.currentKills || 0;
                              zone.defeatedMiniBosses = zoneData.defeatedMiniBosses || [];
                              zone.monstersPerLevel = zoneData.monstersPerLevel || 10;
                          }
                      });
                  }
              });
          }
      }

      // Initialize other systems
      initializeCollectionLog();
      initializeAutoClicker();
      renderChampionsPanel(); // Add this line
      renderAchievements(); // Add this line
      updateUI();
  } catch (error) {
      console.error("Error loading game:", error);
      showLoot("Error loading game", "error");
  }
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

function updateTooltipPosition(event) {
  try {
      const tooltip = document.getElementById('tooltip');
      if (!tooltip || tooltip.style.display === 'none') return;

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
  } catch (error) {
      console.error('Error updating tooltip position:', error);
  }
}

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
  const feed = document.getElementById("loot-feed");
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
                    } else if (panelId === 'champions') { // <-- Fixed
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
    renderAchievements(); // Add this line
    const goldDisplay = document.getElementById('stat-gold');
    if (goldDisplay) {
        goldDisplay.textContent = formatLargeNumber(player.gold);
    }
      UIManager.queueUpdate('all');
  } catch (error) {
      GameError.handleError(error, 'updateUI');
  }
  
}

function getMonsterVariantsForLevel(zone, level) {
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
    }

    return availableVariants.length > 0 ? availableVariants : variants;
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
          console.error('Inventory grid not found');
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

// Add autoClicker attack function
function autoClickerAttack() {
  const region = gameData.regions[currentRegion];
  const zone = region.zones[currentZone];

  if (player.currentBoss) {
    player.currentBoss.hp -= player.autoClickerDamage;
    if (player.currentBoss.hp <= 0) {
      handleBossDefeat(zone);
    }
  } else {
    zone.monster.hp -= player.autoClickerDamage;
    if (zone.monster.hp <= 0) {
      handleMonsterDeath(zone);
    }
  }
  updateUI();
}

function initializeAutoClicker() {
  try {
      const toggleBtn = document.getElementById('auto-clicker-toggle');
      if (!toggleBtn) return;

      // Add click event listener for the toggle button
      toggleBtn.addEventListener('click', toggleAutoClicker);
      
      if (player.autoClickerLevel !== "None") {
          toggleBtn.style.display = 'block';
          if (!player.autoClickerPaused) {
              startAutoClicker();
          }
          updateAutoClickerButton();
      }
  } catch (error) {
      console.error('Error initializing auto clicker:', error);
  }
}

function toggleAutoClicker() {
  try {
      player.autoClickerPaused = !player.autoClickerPaused;
      
      if (player.autoClickerPaused) {
          stopAutoClicker();
      } else {
          startAutoClicker();
      }
      
      updateAutoClickerButton();
      saveGame();
  } catch (error) {
      console.error('Error toggling auto clicker:', error);
  }
}

function updateAutoClickerButton() {
  const toggleBtn = document.getElementById('auto-clicker-toggle');
  const playIcon = toggleBtn.querySelector('.play-icon');
  const pauseIcon = toggleBtn.querySelector('.pause-icon');
  
  if (player.autoClickerPaused) {
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
  } else {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
  }
}

function startAutoClicker() {
  try {
      // Clear any existing interval
      stopAutoClicker();

      // Only start if we have a valid interval and aren't paused
      if (player.autoClickerInterval && !player.autoClickerPaused) {
          player.autoClicker = setInterval(() => {
              const attackButton = document.getElementById('attack-button');
              if (attackButton && !attackButton.disabled) {
                  attackHandler();
              }
          }, player.autoClickerInterval);
      }
      updateAutoClickerButton();
  } catch (error) {
      console.error('Error starting auto clicker:', error);
  }
}

function stopAutoClicker() {
  if (player.autoClicker) {
      clearInterval(player.autoClicker);
      player.autoClicker = null;
  }
}

// Add cleanup function for auto-clicker
function cleanupAutoClicker() {
  if (player.autoClicker) {
    clearInterval(player.autoClicker);
    player.autoClicker = null;
    player.autoClickerLevel = "None";
    player.autoClickerDamage = 0;
  }
}

function cleanupEventListeners() {
  try {
      const elements = {
          autoClickerToggle: document.getElementById('auto-clicker-toggle'),
          attackButton: document.getElementById('attack-button'),
          interfaceTabs: document.querySelectorAll('.osrs-interface-tab'),
          resetButton: document.getElementById('hard-reset-btn')
      };

      if (elements.autoClickerToggle) {
          elements.autoClickerToggle.removeEventListener('click', toggleAutoClicker);
      }

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

      // Set inventory active in left panel
      if (leftPanel) {
          const inventoryTab = leftPanel.querySelector('[data-panel="inventory"]');
          const inventoryPanel = leftPanel.querySelector('#inventory-panel');
          if (inventoryTab && inventoryPanel) {
              // Remove active class from all tabs and panels
              leftPanel.querySelectorAll('.osrs-interface-tab').forEach(tab => tab.classList.remove('active'));
              leftPanel.querySelectorAll('.osrs-panel').forEach(panel => panel.classList.remove('active'));
              // Set inventory active
              inventoryTab.classList.add('active');
              inventoryPanel.classList.add('active');
          }
      }

      // Set collection log active in right panel
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

      // Start auto-save system
      if (player.settings.autoSave) {
          setInterval(saveGame, 30000);
      }
  } catch (error) {
      console.error("Error initializing game:", error);
      showLoot("Error initializing game", "error");
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
      if (confirmBtn) {
          confirmBtn.addEventListener('click', () => {
              stopAutoClicker(); // Stop auto-clicker before reset
              localStorage.clear();
              location.reload();
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

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
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
  try {
      setupTabPanels(); // Add this line

      // Add batch sell button listeners
      document.querySelectorAll('.sell-batch-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              const amount = btn.dataset.amount === 'max' ? 'max' : parseInt(btn.dataset.amount);
              toggleSellButton(amount);
          });
      });

      // Hard Reset Button
      const resetBtn = document.getElementById('hard-reset-btn');
      if (resetBtn) {
          resetBtn.addEventListener('click', showResetConfirmation);
      }

      // Set initial active state for sell buttons
      document.querySelectorAll('.sell-batch-btn').forEach(btn => {
          const amount = btn.dataset.amount === 'max' ? 'max' : parseInt(btn.dataset.amount);
          btn.classList.toggle('active', amount === 1);
      });

      document.querySelectorAll('.osrs-interface-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.target.dataset.panel;
            handleTabSwitch(tabId);
        });
    });

      // Remove duplicate event listeners
      document.removeEventListener("DOMContentLoaded", setupEventListeners);
  } catch (error) {
      console.error('Error setting up event listeners:', error);
      showLoot('Error initializing game controls', 'error');
  }
}

function renderZoneTabs() {
  try {
      const zoneTabsContainer = document.getElementById('zone-tabs');
      if (!zoneTabsContainer) return;

      zoneTabsContainer.innerHTML = '';

      const region = gameData.regions[currentRegion];
      if (!region) return;

      Object.entries(region.zones).forEach(([zoneId, zone]) => {
          const tab = document.createElement('button');
          tab.className = `osrs-subtab ${zoneId === currentZone ? 'active' : ''}`;
          tab.dataset.zone = zoneId;
          tab.innerHTML = `<span>${zone.name}</span>`;
          tab.onclick = () => switchZone(zoneId);
          zoneTabsContainer.appendChild(tab);
      });
  } catch (error) {
      console.error('Error rendering zone tabs:', error);
      showLoot('Error updating zone tabs', 'error');
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

function updateZoneBackground(zoneId) {
  try {
      const body = document.body;
      
      // Add transition CSS if not already present
      body.style.transition = 'background-image 0.3s ease';

      // Prepare new background URL based on zone
      let newBackground;
      switch(zoneId) {
          case 'cowpen':
              newBackground = 'url("assets/backgrounds/cowpen.png")';
              break;
          case 'goblinvillage':
              newBackground = 'url("assets/backgrounds/goblinvillage.png")';
              break;
          case 'marketplace':
              newBackground = 'url("assets/backgrounds/marketplace.png")';
              break;
          default:
              console.warn('Unknown zone ID:', zoneId);
              newBackground = 'url("assets/backgrounds/cowpen.png")';
      }

      // Debug log the new background
      console.log('Setting new background:', newBackground);

      // Fade out current background
      body.style.opacity = '0.8';
      
      // Wait for fade out, then change background and fade in
      setTimeout(() => {
          body.style.backgroundImage = newBackground;
          body.style.opacity = '1';
      }, 150);

  } catch (error) {
      console.error('Error updating zone background:', error);
  }
}

function switchZone(zoneId) {
  try {
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
      updateZoneBackground(zoneId);

      // Reset monster and update UI
      const zone = gameData.regions[currentRegion].zones[zoneId];
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
      UIManager.init(); // Initialize UI element references
      await preloadAssets();
      initGame();
      setupEventListeners();
      setupLevelNavigation();
      
      // Clean up any existing auto-clicker state
      stopAutoClicker();
      
      // Initialize auto-clicker if needed
      initializeAutoClicker();
  } catch (error) {
      console.error("Error initializing game:", error);
      showLoot("Error loading game assets", "error");
  }
});
