export const saveSystem = {
    init(playerRef, gameDataRef) {
        if (!playerRef || !gameDataRef) {
            console.error('Player or game data reference not provided to save system');
            return;
        }

        this.player = playerRef;
        this.gameData = gameDataRef;

        if (this.player.settings?.autoSave) {
            setInterval(() => this.saveGame(), GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
        }
    },

    saveGame() {
        try {
            const saveData = {
                version: GAME_CONFIG.VERSION.NUMBER,
                timestamp: Date.now(),
                player: {
                    // Basic stats
                    gold: this.player.gold,
                    damage: this.player.damage,
                    luck: this.player.luck,
                    prestigeLevel: this.player.prestigeLevel,

                    // Inventory and collection
                    inventory: this.player.inventory,
                    collectionLog: this.player.collectionLog || [],

                    // Champions system
                    champions: {
                        owned: Object.entries(this.player.champions.owned).reduce((acc, [id, champion]) => {
                            acc[id] = {
                                level: champion.level,
                                currentDPS: champion.currentDPS,
                                clickDamageBonus: champion.clickDamageBonus,
                                upgrades: champion.upgrades || [],
                                minimized: champion.minimized || false
                            };
                            return acc;
                        }, {}),
                        totalDPS: this.player.champions.totalDPS
                    },

                    // Game statistics
                    stats: {
                        monstersKilled: this.player.stats.monstersKilled,
                        bossesKilled: this.player.stats.bossesKilled,
                        totalGoldEarned: this.player.stats.totalGoldEarned,
                        highestDamage: this.player.stats.highestDamage || 0,
                        criticalHits: this.player.stats.criticalHits || 0,
                        longestCombo: this.player.stats.longestCombo || 0
                    },

                    // Achievement system
                    achievements: ACHIEVEMENTS.reduce((acc, achievement) => {
                        acc[achievement.id] = achievement.unlocked;
                        return acc;
                    }, {}),

                    // Settings
                    settings: {
                        autoSave: this.player.settings.autoSave,
                        notifications: this.player.settings.notifications
                    }
                },

                // Game state
                gameState: {
                    currentRegion: this.gameData.currentState.currentRegion,
                    currentZone: this.gameData.currentState.currentZone,
                    isAutoProgressEnabled: this.gameData.currentState.isAutoProgressEnabled,

                    // Region data
                    regions: Object.entries(this.gameData.regions).reduce((acc, [regionName, region]) => {
                        acc[regionName] = {
                            unlocked: region.unlocked,
                            miniBossesDefeated: region.miniBossesDefeated || [],
                            bossDefeated: region.bossDefeated,
                            
                            // Zone data
                            zones: Object.entries(region.zones).reduce((zoneAcc, [zoneName, zone]) => {
                                zoneAcc[zoneName] = {
                                    unlocked: zone.unlocked,
                                    currentLevel: zone.currentLevel,
                                    highestLevel: zone.highestLevel,
                                    completedLevels: zone.completedLevels || [],
                                    currentKills: zone.currentKills,
                                    monstersPerLevel: zone.monstersPerLevel,
                                    defeatedMiniBosses: zone.defeatedMiniBosses || []
                                };
                                return zoneAcc;
                            }, {})
                        };
                        return acc;
                    }, {})
                }
            };

            // Store backup
            const previousSave = localStorage.getItem("gameSave");
            if (previousSave) {
                localStorage.setItem("gameSaveBackup", previousSave);
            }

            localStorage.setItem("gameSave", JSON.stringify(saveData));
            localStorage.setItem('lastSaved', Date.now().toString());
            
            if (!this.player.settings.autoSave) {
                showLoot("Game saved successfully!", "info");
            }
            
            this.updateGameInfo();
        } catch (error) {
            console.error("Error saving game:", error);
            showLoot("Error saving game", "error");
        }
    },

    loadGame() {
        try {
            const savedData = localStorage.getItem("gameSave");
            if (!savedData) return false;

            const saveData = JSON.parse(savedData);
            
            // Version check and migration if needed
            if (saveData.version !== GAME_CONFIG.VERSION.NUMBER) {
                this.handleVersionMigration(saveData);
            }

            // Load all saved data into current game state
            this.loadSaveData(saveData);

            return true;
        } catch (error) {
            console.error("Error loading game:", error);
            showLoot("Error loading save data", "error");
            return false;
        }
    },

    loadSaveData(saveData) {
        // Load player data
        Object.assign(this.player, saveData.player);
        
        // Load game state
        Object.assign(this.gameData.currentState, saveData.gameState);
        
        // Load regions data
        Object.entries(saveData.gameState.regions).forEach(([regionName, regionData]) => {
            Object.assign(this.gameData.regions[regionName], regionData);
        });

        // Restore achievements
        ACHIEVEMENTS.forEach(achievement => {
            achievement.unlocked = saveData.player.achievements[achievement.id] || false;
        });

        // Update UI
        updateUI();
        renderChampionsPanel();
        renderCollectionLog();
        renderAchievements();
    }
};