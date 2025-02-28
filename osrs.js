/**
 * OSRS Interface - UI Manager
 * Handles the RuneScape-style interface components
 */

class OSRSInterface {
    constructor() {
        this.panels = {
            inventory: null,
            skills: null,
            equipment: null,
            prayer: null,
            magic: null,
            combat: null,
            champions: null,
            collection: null,
            achievements: null
        };
        
        this.activeLeftTab = 'inventory';
        this.activeRightTab = 'skills';
        this.chatTab = 'all';
    }

    init() {
        try {
            this.cacheDOMElements();
            this.initializeTabs();
            this.initializeChatSystem();
            this.initializeMinimapControls();
            this.setupBindings();
            
            // Initialize stats panel if it exists
            this.initializeStatsPanel();
            
            console.log("OSRS Interface initialized successfully");
        } catch (error) {
            console.error("Error initializing OSRS interface:", error);
        }
    }

    // Add this missing method
    safelyCall(fnName, ...args) {
        if (typeof window[fnName] === 'function') {
            try {
                return window[fnName](...args);
            } catch (error) {
                console.warn(`Error calling ${fnName}:`, error);
            }
        } else {
            console.warn(`Function ${fnName} is not available`);
        }
        return null;
    }

    cacheDOMElements() {
        // Cache main layout elements
        this.elements = {
            gameContainer: document.getElementById('game-container'),
            leftPanel: document.querySelector('.left-panel'),
            centerPanel: document.querySelector('.center-panel'),
            rightPanel: document.querySelector('.right-panel'),
            chatArea: document.querySelector('.chat-area'),
            leftTabs: document.querySelectorAll('.left-panel .osrs-tab'),
            rightTabs: document.querySelectorAll('.right-panel .osrs-tab'),
            chatTabs: document.querySelectorAll('.chat-tab'),
            chatMessages: document.getElementById('loot-feed'),
            minimapButton: document.getElementById('minimap-button'),
            combatView: document.querySelector('.combat-view')
        };

        // Cache specific panel elements
        Object.keys(this.panels).forEach(panelName => {
            this.panels[panelName] = document.getElementById(`${panelName}-panel`);
        });
    }
    
    initializeStatsPanel() {
        const statsPanel = document.getElementById('stats-panel');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div class="stat-entry">
                    <span class="stat-label">Gold:</span>
                    <span class="stat-value" id="stat-gold">0</span>
                </div>
                <div class="stat-entry">
                    <span class="stat-label">Damage:</span>
                    <span class="stat-value" id="stat-damage">1</span>
                </div>
                <div class="stat-entry">
                    <span class="stat-label">Luck:</span>
                    <span class="stat-value" id="stat-luck">1.0x</span>
                </div>
                <div class="stat-entry">
                    <span class="stat-label">Prestige:</span>
                    <span class="stat-value" id="stat-prestige">0</span>
                </div>
                <div class="stat-entry">
                    <span class="stat-label">Monsters Killed:</span>
                    <span class="stat-value" id="stat-monsters">0</span>
                </div>
                <div class="stat-entry">
                    <span class="stat-label">Bosses Killed:</span>
                    <span class="stat-value" id="stat-bosses">0</span>
                </div>
                <div class="settings-section">
                    <button id="hard-reset-btn" class="osrs-button danger-button">
                        🔄 Hard Reset Game
                    </button>
                </div>
            `;
            
            // Add hard reset button event listener
            const hardResetBtn = statsPanel.querySelector('#hard-reset-btn');
            if (hardResetBtn) {
                hardResetBtn.addEventListener('click', () => {
                    if (typeof window.confirmHardReset === 'function') {
                        window.confirmHardReset();
                    } else {
                        alert('Hard reset functionality is not available.');
                    }
                });
            }
        }
    }

    initializeTabs() {
        // Initialize left panel tabs
        if (this.elements.leftTabs) {
            this.elements.leftTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const panelName = tab.dataset.panel;
                    this.switchLeftTab(panelName);
                });
            });
        }

        // Initialize right panel tabs
        if (this.elements.rightTabs) {
            this.elements.rightTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const panelName = tab.dataset.panel;
                    this.switchRightTab(panelName);
                });
            });
        }

        // Set initial active tabs
        if (this.elements.leftTabs && this.elements.leftTabs.length) {
            this.switchLeftTab(this.activeLeftTab);
        }
        if (this.elements.rightTabs && this.elements.rightTabs.length) {
            this.switchRightTab(this.activeRightTab);
        }
    }

    initializeChatSystem() {
        if (this.elements.chatTabs && this.elements.chatTabs.length) {
            this.elements.chatTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.elements.chatTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const chatType = tab.textContent.toLowerCase();
                    this.switchChatTab(chatType);
                });
            });
        }
    }

    initializeMinimapControls() {
        if (this.elements.minimapButton) {
            this.elements.minimapButton.addEventListener('click', () => {
                openMapModal();
            });
        }
    }

    switchLeftTab(tabName) {
        if (!this.elements.leftPanel) return;
        
        // Update active tab state
        if (this.elements.leftTabs) {
            this.elements.leftTabs.forEach(tab => {
                const isActive = tab.dataset.panel === tabName;
                tab.classList.toggle('active', isActive);
            });
        }

        // Show selected panel, hide others
        const leftPanelContent = this.elements.leftPanel.querySelector('.panel-content');
        if (leftPanelContent) {
            const panels = leftPanelContent.querySelectorAll('.panel-section');
            panels.forEach(panel => {
                const isPanelMatch = panel.id === `${tabName}-panel`;
                panel.classList.toggle('active', isPanelMatch);
            });
        }

        this.activeLeftTab = tabName;
        
        // Trigger specific panel updates
        this.updatePanelContent(tabName);
    }

    switchRightTab(tabName) {
        if (!this.elements.rightPanel) return;
        
        // Update active tab state
        if (this.elements.rightTabs) {
            this.elements.rightTabs.forEach(tab => {
                const isActive = tab.dataset.panel === tabName;
                tab.classList.toggle('active', isActive);
            });
        }

        // Show selected panel, hide others
        const rightPanelContent = this.elements.rightPanel.querySelector('.panel-content');
        if (rightPanelContent) {
            const panels = rightPanelContent.querySelectorAll('.panel-section');
            panels.forEach(panel => {
                const isPanelMatch = panel.id === `${tabName}-panel`;
                panel.classList.toggle('active', isPanelMatch);
            });
        }

        this.activeRightTab = tabName;
        
        // Trigger specific panel updates
        this.updatePanelContent(tabName);
    }

    switchChatTab(tabName) {
        this.chatTab = tabName;
        
        if (!this.elements.chatMessages) return;
        
        // Filter messages based on type
        const messages = this.elements.chatMessages.querySelectorAll('.loot-entry');
        
        if (tabName === 'all') {
            messages.forEach(msg => msg.style.display = 'block');
        } else if (tabName === 'combat') {
            messages.forEach(msg => {
                const isCombat = msg.textContent.includes('⚔️') || 
                                 msg.textContent.includes('defeated') ||
                                 msg.textContent.includes('killed');
                msg.style.display = isCombat ? 'block' : 'none';
            });
        } else if (tabName === 'loot') {
            messages.forEach(msg => {
                const isLoot = msg.textContent.includes('Found') || 
                               msg.textContent.includes('Collection') ||
                               msg.textContent.includes('Sold') ||
                               msg.classList.contains('S-tier') ||
                               msg.classList.contains('A-tier') ||
                               msg.classList.contains('B-tier') ||
                               msg.classList.contains('C-tier');
                msg.style.display = isLoot ? 'block' : 'none';
            });
        }
    }

    updatePanelContent(panelName) {
        // Trigger specific update functions based on panel
        switch(panelName) {
            case 'inventory':
                this.safelyCall('updateInventory');
                break;
            case 'champions':
                this.safelyCall('renderChampionsPanel');
                break;
            case 'collection':
                this.safelyCall('renderCollectionLog');
                break;
            case 'achievements':
                this.safelyCall('renderAchievements');
                break;
            case 'stats':
                // Update stats panel with latest player info
                this.updateStatsPanel();
                break;
        }
    }
    
    updateStatsPanel() {
        try {
            const statsPanel = document.getElementById('stats-panel');
            if (!statsPanel) return;
            
            // Get player object safely
            const player = window.player || { 
                gold: 0, 
                damage: 1, 
                luck: 1, 
                prestigeLevel: 0,
                stats: { monstersKilled: 0, bossesKilled: 0 } 
            };
            
            // Update player stats display
            const goldDisplay = statsPanel.querySelector('#stat-gold');
            const damageDisplay = statsPanel.querySelector('#stat-damage');
            const luckDisplay = statsPanel.querySelector('#stat-luck');
            const prestigeDisplay = statsPanel.querySelector('#stat-prestige');
            const monstersDisplay = statsPanel.querySelector('#stat-monsters');
            const bossesDisplay = statsPanel.querySelector('#stat-bosses');
            
            if (goldDisplay) goldDisplay.textContent = formatNumber(player.gold || 0);
            if (damageDisplay) damageDisplay.textContent = formatNumber(player.damage || 1);
            if (luckDisplay) luckDisplay.textContent = `${(player.luck || 1).toFixed(1)}x`;
            if (prestigeDisplay) prestigeDisplay.textContent = player.prestigeLevel || 0;
            if (monstersDisplay) monstersDisplay.textContent = formatNumber(player.stats?.monstersKilled || 0);
            if (bossesDisplay) bossesDisplay.textContent = formatNumber(player.stats?.bossesKilled || 0);
        } catch (error) {
            console.error('Error updating stats panel:', error);
        }
    }

    setupBindings() {
        // Bind key shortcuts
        document.addEventListener('keydown', (e) => {
            // Only process if not in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'i': // Inventory
                    this.switchLeftTab('inventory');
                    break;
                case 'c': // Champions 
                    this.switchLeftTab('champions');
                    break;
                case 's': // Stats
                    this.switchRightTab('stats');
                    break;
                case 'l': // Collection log
                    this.switchRightTab('collection');
                    break;
                case 'a': // Achievements
                    this.switchRightTab('achievements');
                    break;
                case 'Escape': // Close modals
                    closeModal();
                    break;
            }
        });
        
        // Resize handler for responsive UI
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize check
        this.handleResize();
    }
    
    handleResize() {
        // Adjust UI for mobile/small screens
        if (this.elements.gameContainer) {
            if (window.innerWidth < 768) {
                this.elements.gameContainer.classList.add('mobile-layout');
            } else {
                this.elements.gameContainer.classList.remove('mobile-layout');
            }
        }
    }
}

function formatNumber(num) {
    // Use game's formatNumber if available
    if (typeof window.formatNumber === 'function') {
        return window.formatNumber(num);
    }
    
    // Fallback implementation
    if (num === undefined || num === null) return "0";
    if (num < 1000) return num.toString();
    
    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.log10(Math.abs(num)) / 3 | 0;
    if (tier === 0) return num.toString();
    
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    
    return scaled.toFixed(1).replace(/\.0$/, '') + suffix;
}

// Modal handling functions
function openMapModal() {
    const mapModal = document.getElementById('mapModal');
    if (mapModal) mapModal.style.display = 'flex';
}

function closeModal() {
    const modals = document.querySelectorAll('.map-modal, .modal-container');
    modals.forEach(modal => {
        if (modal) modal.style.display = 'none';
    });
}

// Initialize the OSRS Interface
const osrsInterface = new OSRSInterface();

// Set up the interface after DOM is ready
window.addEventListener('DOMContentLoaded', function() {
    // Delay initialization slightly to ensure all elements are loaded
    setTimeout(() => {
        try {
            osrsInterface.init();
            
            // Hook into existing update functions if they exist
            if (typeof window.updateUI === 'function') {
                const originalUpdateUI = window.updateUI;
                window.updateUI = function() {
                    try {
                        // Call original function first
                        originalUpdateUI();
                        
                        // Then update our interface elements
                        osrsInterface.updateStatsPanel();
                    } catch (error) {
                        console.error('Error in updateUI override:', error);
                    }
                };
            }
            
            // Add a button to show the OSRS interface from the original UI
            const mainContainer = document.querySelector('.main-content');
            if (mainContainer) {
                const osrsButton = document.createElement('button');
                osrsButton.className = 'osrs-button osrs-ui-toggle';
                osrsButton.textContent = 'Toggle OSRS UI';
                osrsButton.onclick = function() {
                    document.body.classList.toggle('osrs-mode');
                };
                mainContainer.appendChild(osrsButton);
            }
            
            // Export to window for debugging
            window.osrsInterface = osrsInterface;
        } catch (error) {
            console.error('Error initializing OSRS UI:', error);
        }
    }, 100);
});

// Export these functions to the global scope so they can be used by HTML elements
window.openMapModal = openMapModal;
window.closeModal = closeModal;