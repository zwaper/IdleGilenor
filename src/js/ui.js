// Initialize UI components
function initializeUI() {
    createHeader();
    createMainContainer();
    createFooter();
    setupEventListeners();
}

// Create header
function createHeader() {
    const header = document.createElement('header');
    header.className = 'game-header';
    header.innerHTML = `
        <div class="header-left">
            <h1>Idle Gielinor</h1>
        </div>
        <div class="header-right">
            <div class="gold-display">
                <img src="assets/coins/coins_1.png" alt="Gold">
                <span id="gold-amount">0</span>
            </div>
            <button id="settings-btn">Settings</button>
        </div>
    `;
    document.body.appendChild(header);
}

// Create main container
function createMainContainer() {
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';
    mainContainer.innerHTML = `
        <div class="left-panel">
            <div class="champions-panel" id="champions-panel">
                <h2>Champions</h2>
                <div class="champion-list" id="champion-list"></div>
            </div>
        </div>
        <div class="center-panel">
            <div class="monster-container">
                <img id="monster-sprite" src="assets/monsters/default.png" alt="Monster">
                <div class="health-bar-container">
                    <div id="health-bar" class="health-bar"></div>
                    <div id="health-text" class="health-text">0/0 HP</div>
                </div>
                <div id="monster-name" class="monster-name">Monster</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-label">
                    <span>Kills:</span>
                    <span>0/10</span>
                </div>
            </div>
        </div>
        <div class="right-panel">
            <div class="shop-panel" id="shop-panel">
                <h2>Shop</h2>
                <div class="shop-list" id="shop-list"></div>
            </div>
        </div>
    `;
    document.body.appendChild(mainContainer);
}

// Create footer
function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'game-footer';
    footer.innerHTML = `
        <div class="footer-left">
            <button id="save-btn">Save</button>
            <button id="load-btn">Load</button>
        </div>
        <div class="footer-right">
            <button id="prestige-btn">Prestige</button>
        </div>
    `;
    document.body.appendChild(footer);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
    document.getElementById('prestige-btn').addEventListener('click', handlePrestige);
}

// Open settings modal
function openSettings() {
    alert('Settings modal not implemented yet.');
}

// Initialize UI on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeUI);