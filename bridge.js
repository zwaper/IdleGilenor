/**
 * Bridge file to connect the OSRS UI with the game logic
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time to ensure both UI and game are loaded
    setTimeout(() => {
        initializeBridge();
    }, 500);
});

function initializeBridge() {
    try {
        // Map the inventory slot in the OSRS UI to the game's inventory display
        const inventoryGrid = document.querySelector('.inventory-grid');
        if (inventoryGrid && typeof updateInventory === 'function') {
            // Initial update
            updateInventory();
            
            // Create observer to watch for UI updates
            const observer = new MutationObserver(() => {
                // When original inventory is updated, copy content to OSRS UI inventory
                const originalInventory = document.querySelector('.inventory-grid:not(.osrs-inventory)');
                if (originalInventory && inventoryGrid) {
                    inventoryGrid.innerHTML = originalInventory.innerHTML;
                }
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        }
        
        // Connect attack button
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.addEventListener('click', function() {
                const monsterContainer = document.querySelector('.monster-container');
                if (monsterContainer && typeof attackHandler === 'function') {
                    // Create a mock event that attackHandler can use
                    const mockEvent = { target: monsterContainer };
                    attackHandler(mockEvent);
                }
            });
        }
        
        // Connect auto-progress button
        const autoProgressBtn = document.getElementById('auto-progress');
        if (autoProgressBtn && typeof toggleAutoProgress === 'function') {
            autoProgressBtn.addEventListener('click', toggleAutoProgress);
        }
        
        // Hook into updateUI function to update OSRS interface
        const originalUpdateUI = window.updateUI;
        if (typeof originalUpdateUI === 'function') {
            window.updateUI = function() {
                // Call original function
                originalUpdateUI();
                
                // Update OSRS UI elements
                updateOSRSInterface();
            };
        }
        
        // Initial UI update
        updateOSRSInterface();
        
        console.log('Bridge initialized successfully');
    } catch (error) {
        console.error('Error initializing bridge:', error);
    }
}

function updateOSRSInterface() {
    try {
        // Update stats display
        if (typeof player !== 'undefined') {
            const goldDisplay = document.getElementById('stat-gold');
            const damageDisplay = document.getElementById('stat-damage');
            const luckDisplay = document.getElementById('stat-luck');
            const prestigeDisplay = document.getElementById('stat-prestige');
            const monstersDisplay = document.getElementById('stat-monsters');
            const bossesDisplay = document.getElementById('stat-bosses');
            
            if (goldDisplay) goldDisplay.textContent = formatNumber(player.gold || 0);
            if (damageDisplay) damageDisplay.textContent = formatNumber(player.damage || 1);
            if (luckDisplay) luckDisplay.textContent = `${(player.luck || 1).toFixed(1)}x`;
            if (prestigeDisplay) prestigeDisplay.textContent = player.prestigeLevel || 0;
            if (monstersDisplay) monstersDisplay.textContent = formatNumber(player.stats?.monstersKilled || 0);
            if (bossesDisplay) bossesDisplay.textContent = formatNumber(player.stats?.bossesKilled || 0);
        }
        
        // Update monster display
        if (typeof gameData !== 'undefined') {
            const currentZoneData = gameData.regions[currentRegion]?.zones[currentZone];
            if (currentZoneData) {
                const zoneName = document.getElementById('zone-name');
                const zoneLevel = document.getElementById('zone-level');
                const monsterName = document.getElementById('monster-name');
                const monsterSprite = document.getElementById('monster-sprite');
                const healthBar = document.getElementById('health-fill');
                const healthText = document.getElementById('health-text');
                
                if (zoneName) zoneName.textContent = formatZoneName(currentZone);
                if (zoneLevel) zoneLevel.textContent = `Level: ${currentZoneData.currentLevel || 1}`;
                
                if (currentZoneData.monster) {
                    if (monsterName) monsterName.textContent = currentZoneData.monster.name || 'Monster';
                    
                    if (monsterSprite && currentZoneData.monster.image) {
                        monsterSprite.src = `assets/monsters/${currentZoneData.monster.image}`;
                    }
                    
                    if (healthBar && currentZoneData.monster.health !== undefined) {
                        const healthPercent = (currentZoneData.monster.health / currentZoneData.monster.maxHealth) * 100;
                        healthBar.style.width = `${healthPercent}%`;
                        
                        // Change color based on health percentage
                        if (healthPercent > 50) {
                            healthBar.style.backgroundColor = '#44FF44';
                        } else if (healthPercent > 25) {
                            healthBar.style.backgroundColor = '#FFFF44';
                        } else {
                            healthBar.style.backgroundColor = '#FF4444';
                        }
                    }
                    
                    if (healthText) {
                        healthText.textContent = `${formatNumber(currentZoneData.monster.health)}/${formatNumber(currentZoneData.monster.maxHealth)}`;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating OSRS interface:', error);
    }
}