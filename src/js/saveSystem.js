export const saveSystem = {
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

    saveGame(showMessage = false) {
        try {
            // Construct complete save data object with all important game state
            const saveData = {
                version: GAME_CONFIG.VERSION.NUMBER,
                timestamp: Date.now(),
                player: {
                    // Basic player stats
                    gold: this.player.gold,
                    damage: this.player.damage,
                    luck: this.player.luck,
                    prestigeLevel: this.player.prestigeLevel,
                    
                    // Collections and inventory
                    inventory: [...this.player.inventory],
                    collectionLog: [...this.player.collectionLog],
                    upgrades: [...this.player.upgrades],
                    
                    // Champions data
                    champions: {
                        owned: {},
                        totalDPS: this.player.champions?.totalDPS || 0
                    },
                    
                    // Game statistics
                    stats: {
                        monstersKilled: this.player.stats?.monstersKilled || 0,
                        bossesKilled: this.player.stats?.bossesKilled || 0,
                        totalGoldEarned: this.player.stats?.totalGoldEarned || 0,
                        highestDamage: this.player.stats?.highestDamage || 0,
                        criticalHits: this.player.stats?.criticalHits || 0,
                        longestCombo: this.player.stats?.longestCombo || 0
                    },
                    
                    // User preferences
                    settings: {
                        autoSave: this.player.settings?.autoSave ?? true,
                        notifications: this.player.settings?.notifications ?? true
                    },
                    
                    // Achievements
                    achievements: {}
                },
                
                // Game state
                gameState: {
                    currentRegion: this.gameData.currentState?.currentRegion || "lumbridge",
                    currentZone: this.gameData.currentState?.currentZone || "cowpen",
                    isAutoProgressEnabled: this.gameData.currentState?.isAutoProgressEnabled || false,
                    regions: {}
                }
            };
            
            // Save champions data
            if (this.player.champions?.owned) {
                Object.entries(this.player.champions.owned).forEach(([id, champ]) => {
                    saveData.player.champions.owned[id] = {
                        level: champ.level || 0,
                        currentDPS: champ.currentDPS || 0,
                        clickDamageBonus: champ.clickDamageBonus || 0,
                        upgrades: [...(champ.upgrades || [])],
                        minimized: champ.minimized || false
                    };
                });
            }
            
            // Save achievements
            ACHIEVEMENTS.forEach(achievement => {
                saveData.player.achievements[achievement.id] = achievement.unlocked || false;
            });
            
            // Save regions data
            Object.entries(this.gameData.regions).forEach(([regionId, region]) => {
                saveData.gameState.regions[regionId] = {
                    unlocked: region.unlocked || regionId === "lumbridge",
                    miniBossesDefeated: region.miniBossesDefeated || 0,
                    bossDefeated: region.bossDefeated || false,
                    zones: {}
                };
                
                // Save zones data for this region
                Object.entries(region.zones).forEach(([zoneId, zone]) => {
                    saveData.gameState.regions[regionId].zones[zoneId] = {
                        unlocked: zone.unlocked || (regionId === "lumbridge" && zoneId === "cowpen"),
                        currentLevel: zone.currentLevel || 1,
                        highestLevel: zone.highestLevel || 1,
                        completedLevels: [...(zone.completedLevels || [])],
                        currentKills: zone.currentKills || 0,
                        defeatedMiniBosses: [...(zone.defeatedMiniBosses || [])],
                        monstersPerLevel: zone.monstersPerLevel || 10
                    };
                });
            });

            // Store backup of previous save
            const previousSave = localStorage.getItem("gameSave");
            if (previousSave) {
                localStorage.setItem("gameSaveBackup", previousSave);
            }

            // Save the game
            localStorage.setItem("gameSave", JSON.stringify(saveData));
            localStorage.setItem('lastSaved', Date.now().toString());
            
            // Show message if explicitly requested OR if auto-save is disabled
            if (showMessage || !this.player.settings?.autoSave) {
                showLoot("Game saved successfully!", "info");
            }
            
            this.rotateSaveBackups();
            this.updateGameInfo();
            return true;
        } catch (error) {
            console.error("Error saving game:", error);
            showLoot("Error saving game: " + error.message, "error");
            return false;
        }
    },

    updateGameInfo() {
        try {
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
        } catch (error) {
            console.error("Error updating game info:", error);
            // Don't show this error to user as it's not critical
        }
    },

    recoverFromCorruptSave() {
        try {
            console.log("Attempting to recover from corrupt save...");
            // Try the most recent backup first
            const backupSave = localStorage.getItem("gameSaveBackup_0") || localStorage.getItem("gameSaveBackup");
            
            if (backupSave) {
                localStorage.setItem("gameSave", backupSave);
                console.log("Restored from backup save");
                return this.loadGame();
            } else {
                // Try older backups
                for (let i = 1; i < GAME_CONFIG.SAVE.BACKUP_COUNT; i++) {
                    const olderBackup = localStorage.getItem(`gameSaveBackup_${i}`);
                    if (olderBackup) {
                        localStorage.setItem("gameSave", olderBackup);
                        console.log(`Restored from older backup ${i}`);
                        return this.loadGame();
                    }
                }
                
                console.log("No backup save found");
                return false;
            }
        } catch (error) {
            console.error("Recovery failed:", error);
            return false;
        }
    },

    loadGame() {
        try {
            const savedData = localStorage.getItem("gameSave");
            if (!savedData) {
                console.log("No saved game found");
                return false;
            }

            const saveData = JSON.parse(savedData);
            
            // Version check and migration if needed
            if (saveData.version !== GAME_CONFIG.VERSION.NUMBER) {
                console.log(`Save version ${saveData.version} differs from current version ${GAME_CONFIG.VERSION.NUMBER}`);
                this.handleVersionMigration(saveData);
            }

            // Load all saved data into current game state
            this.loadSaveData(saveData);
            
            console.log("Game loaded successfully");
            return true;
        } catch (error) {
            console.error("Error loading game:", error);
            showLoot("Error loading save data. Attempting recovery...", "error");
            return this.recoverFromCorruptSave();
        }
    },

    loadSaveData(saveData) {
        // Reset critical game state elements to defaults before loading
        this.resetGameState();
        
        // Load player basic stats
        this.player.gold = saveData.player.gold || 0;
        this.player.damage = saveData.player.damage || 1;
        this.player.luck = saveData.player.luck || 1.0;
        this.player.prestigeLevel = saveData.player.prestigeLevel || 0;
        
        // Load inventory and collection (as new arrays)
        this.player.inventory = [...(saveData.player.inventory || [])];
        this.player.collectionLog = [...(saveData.player.collectionLog || [])];
        this.player.upgrades = [...(saveData.player.upgrades || [])];
        
        // Load champions data with proper object structure
        this.player.champions = {
            owned: {},
            totalDPS: saveData.player.champions?.totalDPS || 0
        };
        
        // Process champions individually to ensure proper structure
        if (saveData.player.champions?.owned) {
            Object.entries(saveData.player.champions.owned).forEach(([id, champ]) => {
                this.player.champions.owned[id] = {
                    level: champ.level || 0,
                    currentDPS: champ.currentDPS || 0,
                    clickDamageBonus: champ.clickDamageBonus || 0,
                    upgrades: [...(champ.upgrades || [])],
                    minimized: champ.minimized || false
                };
            });
        }
        
        // Load stats with proper defaults
        this.player.stats = {
            monstersKilled: saveData.player.stats?.monstersKilled || 0,
            bossesKilled: saveData.player.stats?.bossesKilled || 0,
            totalGoldEarned: saveData.player.stats?.totalGoldEarned || 0,
            highestDamage: saveData.player.stats?.highestDamage || 0,
            criticalHits: saveData.player.stats?.criticalHits || 0,
            longestCombo: saveData.player.stats?.longestCombo || 0
        };
        
        // Load settings
        this.player.settings = {
            autoSave: saveData.player.settings?.autoSave ?? true,
            notifications: saveData.player.settings?.notifications ?? true
        };
        
        // Load combo state
        this.player.combo = {
            count: saveData.player.combo?.count || 0,
            timer: null
        };
        
        // Load sell amount
        this.player.selectedSellAmount = saveData.player.selectedSellAmount || 1;

        // Load current game state
        this.gameData.currentState = {
            currentRegion: saveData.gameState?.currentRegion || "lumbridge",
            currentZone: saveData.gameState?.currentZone || "cowpen",
            isAutoProgressEnabled: saveData.gameState?.isAutoProgressEnabled || false
        };
        
        // Set global variables for backward compatibility
        window.currentRegion = this.gameData.currentState.currentRegion;
        window.currentZone = this.gameData.currentState.currentZone;
        window.isAutoProgressEnabled = this.gameData.currentState.isAutoProgressEnabled;
        
        // Load regions data carefully
        if (saveData.gameState?.regions) {
            Object.entries(saveData.gameState.regions).forEach(([regionName, regionData]) => {
                // Make sure the region exists
                if (!this.gameData.regions[regionName]) {
                    this.gameData.regions[regionName] = {
                        name: regionName,
                        unlocked: regionName === "lumbridge",
                        miniBossesDefeated: [],
                        bossDefeated: false,
                        zones: {}
                    };
                }
                
                // Update region properties
                const region = this.gameData.regions[regionName];
                region.unlocked = regionData.unlocked || regionName === "lumbridge";
                region.miniBossesDefeated = regionData.miniBossesDefeated || 0;
                region.bossDefeated = regionData.bossDefeated || false;
                
                // Process zones within this region
                if (regionData.zones) {
                    Object.entries(regionData.zones).forEach(([zoneName, zoneData]) => {
                        // Make sure the zone exists
                        if (!region.zones[zoneName]) {
                            region.zones[zoneName] = {
                                name: zoneName,
                                unlocked: regionName === "lumbridge" && zoneName === "cowpen",
                                currentLevel: 1,
                                highestLevel: 1,
                                completedLevels: [],
                                currentKills: 0,
                                monstersPerLevel: 10,
                                defeatedMiniBosses: []
                            };
                        }
                        
                        // Update zone properties
                        const zone = region.zones[zoneName];
                        zone.unlocked = zoneData.unlocked || (regionName === "lumbridge" && zoneName === "cowpen");
                        zone.currentLevel = zoneData.currentLevel || 1;
                        zone.highestLevel = zoneData.highestLevel || 1;
                        zone.completedLevels = [...(zoneData.completedLevels || [])];
                        zone.currentKills = zoneData.currentKills || 0;
                        zone.monstersPerLevel = zoneData.monstersPerLevel || 10;
                        zone.defeatedMiniBosses = [...(zoneData.defeatedMiniBosses || [])];
                    });
                }
            });
        }
        
        // Restore achievements
        ACHIEVEMENTS.forEach(achievement => {
            achievement.unlocked = saveData.player.achievements?.[achievement.id] || false;
        });

        // Initialize current zone monster
        const currentZone = this.gameData.regions[this.gameData.currentState.currentRegion].zones[this.gameData.currentState.currentZone];
        if (currentZone && !currentZone.monster) {
            currentZone.monster = getCurrentMonsterStats(currentZone);
        }

        // Update UI elements
        updateUI();
        renderChampionsPanel();
        renderCollectionLog();
        renderAchievements();
        updateZoneBackground(this.gameData.currentState.currentZone, this.gameData.currentState.currentRegion);
        renderLevelSelect();
        
        // Update auto-save interval based on settings
        if (this.player.settings.autoSave) {
            this.startAutoSaveInterval();
        } else {
            this.stopAutoSaveInterval();
        }
    },

    resetGameState() {
        // Reset critical game state to avoid references to old state
        if (this.player.bossTimer) {
            clearInterval(this.player.bossTimer);
            this.player.bossTimer = null;
        }
        
        if (this.player.combo?.timer) {
            clearTimeout(this.player.combo.timer);
            this.player.combo.timer = null;
        }
        
        this.player.currentBoss = null;
    },

    handleVersionMigration(oldSaveData) {
        // Implement version-specific migrations here as needed
        console.log(`Migrating save from ${oldSaveData.version} to ${GAME_CONFIG.VERSION.NUMBER}`);
        
        // Basic migration - just update the version
        oldSaveData.version = GAME_CONFIG.VERSION.NUMBER;
        
        // Save migrated data back to localStorage
        localStorage.setItem("gameSave", JSON.stringify(oldSaveData));
        
        return oldSaveData;
    },

    startAutoSaveInterval() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
        }
        this._autoSaveInterval = setInterval(() => this.saveGame(), GAME_CONFIG.SAVE.AUTOSAVE_INTERVAL);
        console.log("Auto-save interval started");
    },
    
    stopAutoSaveInterval() {
        if (this._autoSaveInterval) {
            clearInterval(this._autoSaveInterval);
            this._autoSaveInterval = null;
            console.log("Auto-save interval stopped");
        }
    },
    
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
            
            // Validate the save data structure
            try {
                const parsedData = JSON.parse(saveData);
                if (!parsedData.player || !parsedData.gameState) {
                    showLoot("Invalid save data format", "error");
                    return false;
                }
            } catch (parseError) {
                showLoot("Invalid save data - could not parse", "error");
                return false;
            }
            
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

window.saveSystem = saveSystem;