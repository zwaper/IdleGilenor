import { saveGame, showLoot, renderAchievements, showAchievementModal } from './game.js';

export const ACHIEVEMENTS = [
    // Combat Achievements
    {
        id: "firstKill",
        name: "First Blood",
        description: "Kill your first monster",
        criteria: () => window.player.stats.monstersKilled >= 1,
        unlocked: false,
        category: "Combat",
        reward: { gold: 100 }
    },
    {
        id: "hundredKills",
        name: "Monster Hunter",
        description: "Kill 100 monsters",
        criteria: () => window.player.stats.monstersKilled >= 100,
        unlocked: false,
        category: "Combat",
        reward: { gold: 1000 }
    },
    {
        id: "thousandKills",
        name: "Monster Slayer",
        description: "Kill 1,000 monsters",
        criteria: () => window.player.stats.monstersKilled >= 1000,
        unlocked: false,
        category: "Combat",
        reward: { gold: 10000 }
    },
    // Boss Achievements
    {
        id: "firstBossKill",
        name: "Boss Slayer",
        description: "Defeat your first boss",
        criteria: () => window.player.stats.bossesKilled >= 1,
        unlocked: false,
        category: "Bosses",
        reward: { gold: 500 }
    },
    {
        id: "tenBossKills",
        name: "Boss Hunter",
        description: "Defeat 10 bosses",
        criteria: () => window.player.stats.bossesKilled >= 10,
        unlocked: false,
        category: "Bosses",
        reward: { gold: 5000 }
    },
    // Wealth Achievements
    {
        id: "thousandGold",
        name: "Gold Hoarder",
        description: "Earn 1,000 gold",
        criteria: () => window.player.stats.totalGoldEarned >= 1000,
        unlocked: false,
        category: "Wealth",
        reward: { gold: 100 }
    },
    {
        id: "millionGold",
        name: "Millionaire",
        description: "Earn 1,000,000 gold",
        criteria: () => window.player.stats.totalGoldEarned >= 1000000,
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

export function checkAchievements() {
    let achievementUnlocked = false;
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievement.unlocked && achievement.criteria()) {
            achievement.unlocked = true;
            // Give rewards
            if (achievement.reward) {
                if (achievement.reward.gold) {
                    window.player.gold += achievement.reward.gold;
                    showLoot(`🎉 Achievement Unlocked: ${achievement.name}! (+${achievement.reward.gold} gold)`, "S");
                }
            } else {
                showLoot(`🎉 Achievement Unlocked: ${achievement.name}!`, "S");
            }
            showAchievementModal(achievement); // Show the achievement modal
            achievementUnlocked = true;
        }
    });

    if (achievementUnlocked) {
        renderAchievements();
        saveGame();
    }
}

export function getAchievementRequirementText(achievement) {
    switch(achievement.id) {
        case 'firstKill':
            return 'Kill 1 monster';
        case 'hundredKills':
            return `Kill 100 monsters (${Math.min(window.player.stats.monstersKilled, 100)}/100)`;
        case 'thousandKills':
            return `Kill 1,000 monsters (${Math.min(window.player.stats.monstersKilled, 1000)}/1,000)`;
        // Add more cases for other achievements
        default:
            return achievement.description;
    }
}

export function formatReward(reward) {
    if (reward.gold) {
        return `${reward.gold.toLocaleString()} gold`;
    }
    return 'No reward';
}