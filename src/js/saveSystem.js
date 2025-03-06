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

    rotateSaveBackups() {
        try {
            // Move current backups one slot backward
            for (let i = GAME_CONFIG.SAVE.BACKUP_COUNT - 1; i > 0; i--) {
                const olderBackup = localStorage.getItem(`gameSaveBackup_${i-1}`);
                if (olderBackup) {
                    localStorage.setItem(`gameSaveBackup_${i}`, olderBackup);
                }
            }
            
            // Current save becomes backup 0
            const currentSave = localStorage.getItem("gameSave");
            if (currentSave) {
                localStorage.setItem("gameSaveBackup_0", currentSave);
            }
        } catch (error) {
            console.error("Error rotating save backups:", error);
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
            
            this.rotateSaveBackups();
            this.updateGameInfo();
        } catch (error) {
            console.error("Error saving game:", error);
            showLoot("Error saving game", "error");
        }
    },

    updateGameInfo() {
        // Update last saved time in the UI
        const lastSavedTime = new Date().toLocaleTimeString();
        const lastSavedElement = document.getElementById('last-saved');
        if (lastSavedElement) {
            lastSavedElement.textContent = lastSavedTime;
        }
        
        // Update version info if element exists
        const versionElement = document.getElementById('game-version');
        if (versionElement && GAME_CONFIG) {
            versionElement.textContent = GAME_CONFIG.VERSION.NUMBER;
        }
    },

 // Add this method to the saveSystem object
recoverFromCorruptSave() {
    try {
        console.log("Attempting to recover from corrupt save...");
        const backupSave = localStorage.getItem("gameSaveBackup");
        
        if (backupSave) {
            localStorage.setItem("gameSave", backupSave);
            console.log("Restored from backup save");
            return this.loadGame();
        } else {
            console.log("No backup save found");
            return false;
        }
    } catch (error) {
        console.error("Recovery failed:", error);
        return false;
    }
},

// Then modify the loadGame method to include recovery
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
        showLoot("Error loading save data. Attempting recovery...", "error");
        return this.recoverFromCorruptSave();
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
    },

    updateSettings(settingName, value) {
        if (!this.player || !this.player.settings) {
            console.error("Player settings not initialized");
            return;
        }
        
        // Update the setting
        this.player.settings[settingName] = value;
        
        // Apply immediate effects based on the setting
        switch (settingName) {
            case "autoSave":
                if (value) {
                    this.startAutoSaveInterval();
                } else {
                    this.stopAutoSaveInterval();
                }
                break;
            // Add other settings handlers here
        }
        
        // Save the game to persist settings
        this.saveGame();
        
        return value;
    },
    
    startAutoSaveInterval() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
        }
        this._autoSaveInterval = setInterval(() => this.saveGame(), GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
        console.log("Auto-save enabled");
    },
    
    stopAutoSaveInterval() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
            this._autoSaveInterval = null;
            console.log("Auto-save disabled");
        }
    },
    
    // Then modify the init method
    init(playerRef, gameDataRef) {
        if (!playerRef || !gameDataRef) {
            console.error('Player or game data reference not provided to save system');
            return;
        }
    
        this.player = playerRef;
        this.gameData = gameDataRef;
    
        // Initialize settings if needed
        if (!this.player.settings) {
            this.player.settings = {
                autoSave: true,
                notifications: true
            };
        }
    
        // Start auto-save if enabled
        if (this.player.settings.autoSave) {
            this.startAutoSaveInterval();
        }
    },
    // Add these methods to the saveSystem object
exportSave() {
    try {
        const saveData = localStorage.getItem("gameSave");
        if (!saveData) {
            showLoot("No save data to export", "error");
            return null;
        }
        
        // Create a base64 encoded version for easier sharing
        const encodedSave = btoa(saveData);
        return encodedSave;
    } catch (error) {
        console.error("Error exporting save:", error);
        showLoot("Error exporting save", "error");
        return null;
    }
},

importSave(encodedSave) {
    try {
        if (!encodedSave) {
            showLoot("No save data to import", "error");
            return false;
        }
        
        // Decode the save
        const saveData = atob(encodedSave);
        
        // Backup current save before importing
        this.rotateSaveBackups();
        
        // Store the imported save
        localStorage.setItem("gameSave", saveData);
        
        // Load the imported save
        const success = this.loadGame();
        
        if (success) {
            showLoot("Save imported successfully", "info");
        } else {
            showLoot("Error loading imported save", "error");
        }
        
        return success;
    } catch (error) {
        console.error("Error importing save:", error);
        showLoot("Error importing save - invalid format", "error");
        return false;
    }
}
};