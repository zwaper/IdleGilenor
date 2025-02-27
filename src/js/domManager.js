export const DOMCache = {
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

export function initDOMCache() {
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

export function updateUI() {
    try {
        renderAchievements(); // Add this line
        const goldDisplay = DOMCache.get('#stat-gold');
        if (goldDisplay) {
            goldDisplay.textContent = formatLargeNumber(player.gold);
        }
        UIManager.queueUpdate('all');
    } catch (error) {
        GameError.handleError(error, 'updateUI');
    }
}

export function setupTabPanels() {
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