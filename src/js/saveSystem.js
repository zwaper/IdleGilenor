export const saveSystem = {
    init(playerRef, gameStateRef) {
        if (!playerRef || !gameStateRef) {
            console.error('Player or game state reference not provided to save system');
            return;
        }

        // Store references
        this.player = playerRef;
        this.gameState = gameStateRef;

        // Initialize auto-save if enabled
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
                gold: player.gold,
                damage: player.damage,
                inventory: player.inventory,
                prestigeLevel: player.prestigeLevel,
                luck: player.luck,
                champions: player.champions,
                stats: player.stats,
                settings: player.settings,
                upgrades: player.upgrades || [],
                activeBuffs: player.activeBuffs || {},
                collectionLog: player.collectionLog || []
            },
            gameState: {
                currentRegion,
                currentZone,
                isAutoProgressEnabled,
                regions: Object.entries(gameData.regions).reduce((acc, [regionName, region]) => {
                    acc[regionName] = {
                        unlocked: region.unlocked,
                        miniBossesDefeated: region.miniBossesDefeated,
                        bossDefeated: region.bossDefeated,
                        zones: Object.entries(region.zones).reduce((zoneAcc, [zoneName, zone]) => {
                            zoneAcc[zoneName] = {
                                unlocked: zone.unlocked,
                                currentLevel: zone.currentLevel,
                                highestLevel: zone.highestLevel,
                                completedLevels: zone.completedLevels || [],
                                currentKills: zone.currentKills,
                                defeatedMiniBosses: zone.defeatedMiniBosses || [],
                                monstersPerLevel: zone.monstersPerLevel
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
            updateGameInfo();

        } catch (error) {
            console.error("Error saving game:", error);
            showLoot("Error saving game", "error");
        }
    },

    loadBackupSave() {
        try {
            const backupSave = localStorage.getItem("gameSaveBackup");
            if (!backupSave) {
                showLoot("No backup save found", "error");
                return;
            }

            localStorage.setItem("gameSave", backupSave);
            location.reload();
        } catch (error) {
            console.error("Error loading backup save:", error);
            showLoot("Error loading backup save", "error");
        }
    }
};