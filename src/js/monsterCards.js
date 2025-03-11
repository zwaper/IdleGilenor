export const MONSTER_CARDS = {
    cow: {
        name: "Cow",
        tier: "C",
        zone: "Cowpen",
        effect: {
            goldMultiplier: 0.1
        },
        dropRate: 0.5
    },
    zanarisCow: {
        name: "Zanaris Cow",
        tier: "B",
        zone: "Cowpen",
        effect: {
            goldMultiplier: 0.15
        },
        dropRate: 0.4
    },
    zombieCow: {
        name: "Zombie Cow",
        tier: "A",
        zone: "Cowpen",
        effect: {
            goldMultiplier: 0.2
        },
        dropRate: 0.0064
    },
    goblin: {
        name: "Goblin",
        tier: "C",
        zone: "Goblin Village",
        effect: {
            goldMultiplier: 0.1
        },
        dropRate: 0.5
    },
    goblinChief: {
        name: "Goblin Chief",
        tier: "B",
        zone: "Goblin Village",
        effect: {
            goldMultiplier: 0.15
        },
        dropRate: 0.4
    },
    goblinBrute: {
        name: "Goblin Brute",
        tier: "A",
        zone: "Goblin Village",
        effect: {
            goldMultiplier: 0.2
        },
        dropRate: 0.3
    }
};

const HOLOGRAPHIC_CHANCE = 0.005;
const HOLOGRAPHIC_MULTIPLIER_BONUS = 0.5; // Holographic cards give 50% more bonus than normal cards

const GOLD_CARD_CHANCE = 0.1; // 5% chance of getting a Gold card
const GOLD_CARD_REWARD_MULTIPLIER = 25; // Gold reward = level × multiplier

function isHolographicDrop() {
    return Math.random() < HOLOGRAPHIC_CHANCE;
}

function isGoldCardDrop() {
    return Math.random() < GOLD_CARD_CHANCE;
}

export function rollForCard(tier) {
    // Check for Gold card first
    if (isGoldCardDrop()) {
        try {
            // Gold card drops instead of a regular monster card
            const currentLevel = getCurrentLevel();
            
            // Calculate reward based on what monsters would drop at this level
            const monsterGoldValue = window.calculateBaseGold ? 
                window.calculateBaseGold(currentLevel) : 
                currentLevel * 10; // Fallback calculation if function doesn't exist
            
            // Make Gold Card more valuable - use the multiplier constant
            const goldReward = Math.floor(monsterGoldValue * GOLD_CARD_REWARD_MULTIPLIER);
            
            console.log(`Gold card found! Level: ${currentLevel}, Base gold: ${monsterGoldValue}, Reward: ${goldReward}`);
            console.log(`Add gold directly: ${addGoldDirectly}`);
            
            // Award gold to player only if requested
            if (addGoldDirectly) {
                console.log(`Adding ${goldReward} gold directly from rollForCard`);
                addPlayerGold(goldReward, "Gold Card (direct roll)");
            }
            
            // Return a special result indicating gold card
            return {
                isGoldCard: true,
                goldAmount: goldReward
            };
        } catch (error) {
            console.error("Error processing gold card:", error);
            // Return a minimum gold reward as fallback
            return {
                isGoldCard: true,
                goldAmount: 100
            };
        }
    }
    
    // Get all cards of the requested tier
    const cards = Object.values(MONSTER_CARDS).filter(card => card.tier === tier);
    
    // For each card in the tier, make an individual drop roll
    const possibleCards = [];
    
    for (const card of cards) {
        // Each card has its own independent chance to drop
        if (Math.random() <= card.dropRate) {
            possibleCards.push(card);
        }
    }
    
    // If multiple cards passed their checks, choose one randomly
    if (possibleCards.length > 0) {
        const selectedCard = possibleCards[Math.floor(Math.random() * possibleCards.length)];
        
        // Check if the card is holographic
        const isHolographic = isHolographicDrop();
        
        return {
            ...selectedCard,
            isHolographic,
            isGoldCard: false
        };
    }
    
    return null;
}

function getCurrentLevel() {
    try {
        const currentRegion = window.currentRegion || "lumbridge";
        const currentZone = window.currentZone || "cowpen";
        return window.gameData.regions[currentRegion].zones[currentZone].currentLevel || 1;
    } catch (error) {
        console.error("Error getting current level:", error);
        return 1; // Default to level 1 if there's an error
    }
}

export function applyCardEffects(player) {
    player.cardEffects = {
        goldMultiplier: 1.0
    };

    // Initialize cards as an object if not defined
    if (!player.cards) {
        console.warn('Player cards not initialized.');
        player.cards = {}; // Initialize cards as an empty object
        return;
    }
    
    // Convert old format if needed
    Object.entries(player.cards).forEach(([cardId, value]) => {
        if (typeof value === 'number') {
            // Convert old format (just a count) to new format
            player.cards[cardId] = {
                count: value,
                holographic: 0
            };
        }
    });

    // Apply effects from all cards
    Object.keys(player.cards).forEach(cardId => {
        const card = MONSTER_CARDS[cardId];
        if (card && card.effect.goldMultiplier) {
            // Get card data
            const cardData = player.cards[cardId];
            
            // Apply normal card multiplier effect
            if (cardData.count > 0) {
                player.cardEffects.goldMultiplier += (card.effect.goldMultiplier * cardData.count);
            }
            
            // Apply enhanced holographic card multiplier effect
            if (cardData.holographic > 0) {
                const holoMultiplier = card.effect.goldMultiplier * (1 + HOLOGRAPHIC_MULTIPLIER_BONUS);
                player.cardEffects.goldMultiplier += (holoMultiplier * cardData.holographic);
            }
        }
    });
}

// Add these functions to your monsterCards.js file

// Card pack prices
const CARD_PRICES = {
    tierC: 200,
    tierB: 500,
    tierA: 1200,
    tierS: 3000,
    basicPack: 500,
    premiumPack: 2000,
    zonePack: 1000  // Price for zone-specific packs
};

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addPlayerGold(amount, source) {
    if (!window.player) {
        console.error(`Failed to add ${amount} gold from ${source}: window.player is undefined`);
        return false;
    }
    
    if (typeof window.player.gold !== 'number') {
        console.error(`Failed to add ${amount} gold from ${source}: window.player.gold is not a number (current value: ${window.player.gold})`);
        window.player.gold = 0; // Initialize to 0 if not a number
    }
    
    const beforeGold = window.player.gold;
    window.player.gold += amount;
    const afterGold = window.player.gold;
    
    // Verify addition happened correctly
    if (afterGold !== beforeGold + amount) {
        console.error(`Gold addition error! Before: ${beforeGold}, Added: ${amount}, After: ${afterGold}, Expected: ${beforeGold + amount}`);
    }
    
    console.log(`Added ${formatNumber(amount)} gold from ${source}. Before: ${formatNumber(beforeGold)}, After: ${formatNumber(afterGold)}`);
    
    // Update the UI to reflect the new gold amount
    updateUI();
    
    return true;
}

// Function to buy individual card rolls per tier
export function buyCardRoll(tier) {
    // Check if player has enough gold
    const price = CARD_PRICES[`tier${tier}`];
    if (!price) {
        console.error(`Invalid tier: ${tier}`);
        return;
    }

    if (window.player.gold < price) {
        showLoot(`Not enough gold! You need ${price} gold to roll for a ${tier}-tier card.`, "error");
        return;
    }

    // Ensure player.cards is an object
    if (!window.player.cards || Array.isArray(window.player.cards)) {
        window.player.cards = {};
    }

    // Deduct gold
    window.player.gold -= price;
    console.log(`Deducted ${price} gold for tier ${tier} card roll. New gold: ${window.player.gold}`);
    
    // Roll for card - passing false means don't add gold in rollForCard
    console.log(`Rolling for a tier ${tier} card with addGoldDirectly=false`);
    const result = rollForCard(tier, false);
    
    if (result) {
        // Check if it's a gold card
        if (result.isGoldCard) {
            console.log(`Got gold card! Amount: ${result.goldAmount}`);
            
            // Verify player gold before adding
            const goldBefore = window.player.gold;
            
            // Add gold reward
            addPlayerGold(result.goldAmount, "Gold Card (single roll)");
            
            // Verify gold was actually added
            console.log(`Gold before: ${goldBefore}, gold after: ${window.player.gold}, expected: ${goldBefore + result.goldAmount}`);
            
            // Show loot notification with formatted gold amount
            showLoot(`You got a Gold Card! Received ${formatNumber(result.goldAmount)} gold!`, "gold");
            return;
        }
        
        // Find card ID from name
        const cardId = Object.entries(MONSTER_CARDS).find(([id, c]) => c.name === result.name)[0];
        
        // Handle holographic status
        const isHolographic = result.isHolographic;
        
        // Check if player already has this card
        if (!window.player.cards[cardId]) {
            // Initialize the card structure
            window.player.cards[cardId] = {
                count: 0,
                holographic: 0
            };
        }
        
        // Increment the appropriate counter
        if (isHolographic) {
            window.player.cards[cardId].holographic++;
            applyCardEffects(window.player);
            showLoot(`You obtained a ✨HOLOGRAPHIC✨ ${result.name} card!`, result.tier);
        } else {
            // Increment the counter
            window.player.cards[cardId].count++;
            applyCardEffects(window.player);
            showLoot(`You obtained a ${result.name} card!`, result.tier);
        }
    } else {
        showLoot("No card obtained. Better luck next time!", "error");
    }
}

// Function to buy and open a card pack
export function buyCardPack(packType) {
    const price = CARD_PRICES[`${packType}Pack`];
    if (!price) {
        console.error(`Invalid pack type: ${packType}`);
        return;
    }

    if (window.player.gold < price) {
        showLoot(`Not enough gold! You need ${price} gold to buy a ${packType} pack.`, "error");
        return;
    }

    // Deduct gold
    window.player.gold -= price;
    
    // Generate cards based on pack type
    const cards = generateCardsFromPack(packType);
    
    // Show pack opening modal
    showPackOpeningModal(cards);
}

export function buyZonePack(zone) {
    const price = CARD_PRICES.zonePack;
    
    if (window.player.gold < price) {
        showLoot(`Not enough gold! You need ${price} gold to buy a ${zone} pack.`, "error");
        return;
    }

    // Deduct gold
    window.player.gold -= price;
    
    // Generate cards based on zone
    const cards = generateZonePack(zone);
    
    // Show pack opening modal
    showPackOpeningModal(cards);
}

// Generate cards from a pack based on probabilities
function generateCardsFromPack(packType) {
    const cards = [];
    let numCards;
    
    // Ensure player.cards is an object
    if (!window.player.cards || Array.isArray(window.player.cards)) {
        window.player.cards = {};
    }
    
    // Set number of cards based on pack type
    if (packType === 'basic') {
        numCards = 3;
    } else { // premium
        numCards = 5;
    }
    
    // Process each card in the pack
    for (let i = 0; i < numCards; i++) {
        // Check for Gold card - removed the goldCardFound restriction
        if (isGoldCardDrop()) {
            const currentLevel = getCurrentLevel();
            
            // Calculate reward based on what monsters would drop at this level
            const monsterGoldValue = window.calculateBaseGold ? 
                window.calculateBaseGold(currentLevel) : 
                currentLevel * 10; // Fallback calculation if function doesn't exist
            
            // Make Gold Card more valuable - use the multiplier constant
            const goldReward = Math.floor(monsterGoldValue * GOLD_CARD_REWARD_MULTIPLIER);
            
            // Award gold to player with error handling
            addPlayerGold(goldReward, "Gold Card (card pack)");
            
            // Add a placeholder for the gold card
            cards.push({
                id: 'goldCard',
                name: 'Gold Card',
                tier: 'gold',
                zone: 'All',
                effect: {
                    goldMultiplier: 0
                },
                isGoldCard: true,
                goldAmount: goldReward
            });
            
            // Skip the rest of this iteration
            continue;
        }
        // Create a weighted pool of all cards based on their drop rates
        const cardPool = [];
        Object.entries(MONSTER_CARDS).forEach(([cardId, card]) => {
            // Calculate weight - using dropRate as the relative weight
            // For premium packs, slightly increase chances for higher tier cards
            let weight = card.dropRate;
            if (packType === 'premium') {
                if (card.tier === 'B') weight *= 1.2;
                if (card.tier === 'A') weight *= 1.5;
                if (card.tier === 'S') weight *= 2.0;
            }
            
            // Add card to pool with its weight
            cardPool.push({
                id: cardId,
                ...card,
                weight: weight
            });
        });
        
        // Calculate total weight
        const totalWeight = cardPool.reduce((sum, card) => sum + card.weight, 0);
        
        // Select a random card based on weights
        let random = Math.random() * totalWeight;
        let selectedCard = null;
        
        for (const card of cardPool) {
            random -= card.weight;
            if (random <= 0) {
                selectedCard = card;
                break;
            }
        }
        
        // Fallback in case of rounding errors
        if (!selectedCard) {
            selectedCard = cardPool[cardPool.length - 1];
        }

        // Determine if this card is holographic
        const isHolographic = isHolographicDrop();
        
        // Add holographic status to the card
        selectedCard.holographic = isHolographic;
        
        // Add to cards array
        cards.push(selectedCard);
        
        // Add to player's collection or increment count
        const cardId = selectedCard.id;
        
        // Initialize the card in player's collection if needed
        if (!window.player.cards[cardId]) {
            window.player.cards[cardId] = {
                count: 0,
                holographic: 0
            };
        }
        
        // If it's holographic, increment that count, otherwise increment normal count
        if (isHolographic) {
            window.player.cards[cardId].holographic++;
        } else {
            window.player.cards[cardId].count++;
        }
    }
    
    applyCardEffects(window.player);
    return cards;
}

function generateZonePack(zone) {
    const cards = [];
    const numCards = 4;  // Zone packs contain 4 cards
    
    // Ensure player.cards is an object
    if (!window.player.cards || Array.isArray(window.player.cards)) {
        window.player.cards = {};
    }
    
    // Filter cards by zone
    const zoneCardPool = [];
    Object.entries(MONSTER_CARDS).forEach(([cardId, card]) => {
        if (card.zone === zone) {
            zoneCardPool.push({
                id: cardId,
                ...card,
                weight: card.dropRate
            });
        }
    });
    
    // Calculate total weight
    const totalWeight = zoneCardPool.reduce((sum, card) => sum + card.weight, 0);
    
    // Select cards for the pack
    for (let i = 0; i < numCards; i++) {
        // If there are no cards for this zone, break
        if (zoneCardPool.length === 0) break;
        
        // Select a random card based on weights
        let random = Math.random() * totalWeight;
        let selectedCard = null;
        
        for (const card of zoneCardPool) {
            random -= card.weight;
            if (random <= 0) {
                selectedCard = card;
                break;
            }
        }
        
        // Fallback in case of rounding errors
        if (!selectedCard) {
            selectedCard = zoneCardPool[zoneCardPool.length - 1];
        }
        
        // Add to cards array
        cards.push(selectedCard);
        
        // Add to player's collection or increment count
        const cardId = selectedCard.id;
        if (window.player.cards[cardId]) {
            window.player.cards[cardId]++;
        } else {
            window.player.cards[cardId] = 1;
        }
    }
    
    applyCardEffects(window.player);
    return cards;
}

// Helper function to select a tier based on probabilities
function selectTierFromProbabilities(tierProbs) {
    const rand = Math.random();
    let cumulativeProb = 0;
    
    for (const [tier, prob] of Object.entries(tierProbs)) {
        cumulativeProb += prob;
        if (rand <= cumulativeProb) {
            return tier;
        }
    }
    return 'C'; // Default fallback
}

// Update the showPackOpeningModal function to display holographic cards
function showPackOpeningModal(cards) {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById("card-pack-modal-container");
    if (!modalContainer) {
        modalContainer = document.createElement("div");
        modalContainer.id = "card-pack-modal-container";
        modalContainer.className = "card-pack-modal-container";
        document.body.appendChild(modalContainer);
    }

    // Reset display style to make sure it's visible
    modalContainer.style.display = "flex";

    // Create confetti for high-tier cards, holographic cards, and gold cards
    const confettiCount = cards.filter(card => 
        card.tier === 'A' || card.tier === 'S' || card.holographic || card.isGoldCard
    ).length * 30;
    
    const confettiHtml = Array(confettiCount).fill().map(() => {
        const color = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ffd700'][Math.floor(Math.random() * 7)];
        const left = Math.random() * 100;
        const animationDuration = 2 + Math.random() * 2;
        const size = 5 + Math.random() * 10;
        return `
            <div class="confetti" style="
                left: ${left}%;
                animation-duration: ${animationDuration}s;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                animation-delay: ${Math.random() * 3}s;
            "></div>
        `;
    }).join('');

    let cardHtml = '';
    cards.forEach(card => {
        if (card.isGoldCard) {
            // Render a gold card with properly formatted numbers
            cardHtml += `
                <div class="pack-card gold-card">
                    <div class="card-glow gold-glow"></div>
                    <div class="card-inner">
                        <div class="card-front">
                            <!-- Card back image is set through CSS -->
                        </div>
                        <div class="card-back gold-back">
                            <div class="card-inner-content">
                                <div class="card-header">
                                    <div class="card-name">Gold Card</div>
                                    <div class="card-tier gold-tier">GOLD</div>
                                </div>
                                <img src="assets/cards/gold_card.png" 
                                     alt="Gold Card" class="card-image">
                                <div class="card-body">
                                    <div class="card-effect">Instant Gold: ${formatNumber(card.goldAmount)}</div>
                                    <div class="card-zone">Special Reward</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Calculate the actual multiplier for display
            const displayMultiplier = card.holographic ? 
                card.effect.goldMultiplier * (1 + HOLOGRAPHIC_MULTIPLIER_BONUS) : 
                card.effect.goldMultiplier;
            
            // Regular card rendering (existing code)
            cardHtml += `
                <div class="pack-card ${card.tier}-tier ${card.holographic ? 'holographic' : ''}">
                    <div class="card-glow"></div>
                    <div class="card-inner">
                        <div class="card-front">
                            <!-- Card back image is set through CSS -->
                        </div>
                        <div class="card-back">
                            <div class="card-inner-content">
                                <div class="card-header">
                                    <div class="card-name">${card.name}</div>
                                    <div class="card-tier">${card.tier}</div>
                                    ${card.holographic ? '<div class="holographic-badge">HOLO</div>' : ''}
                                </div>
                                <img src="assets/cards/${card.name.toLowerCase().replace(/\s+/g, '_')}.png" 
                                     alt="${card.name}" class="card-image">
                                <div class="card-body">
                                    <div class="card-effect">Gold Multiplier: +${displayMultiplier * 100}%</div>
                                    <div class="card-zone">Zone: ${card.zone}</div>
                                    ${card.holographic ? `<div class="holographic-tooltip">+${Math.round(HOLOGRAPHIC_MULTIPLIER_BONUS * 100)}% Enhanced Effect</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    modalContainer.innerHTML = `
        <div class="card-pack-modal">
            <h2>Pack Opening</h2>
            <div class="pack-cards-container">
                ${cardHtml}
            </div>
            <button class="osrs-button card-pack-close-btn" onclick="closeCardPackModal()">Close</button>
            ${confettiHtml}
        </div>
    `;

    // Force reflow to enable animations
    void modalContainer.offsetWidth;
    
    // Show the modal
    modalContainer.classList.add('visible');
    
    // Animate cards flipping one by one
    const cardElements = document.querySelectorAll('.pack-card');
    cardElements.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('reveal');
            // Play card flip sound
            playSound('card_flip');
            
            // Play special sound for gold, high tier or holographic cards
            const isHighTier = card.classList.contains('S-tier') || card.classList.contains('A-tier');
            const isHolographic = card.classList.contains('holographic');
            const isGoldCard = card.classList.contains('gold-card');
            
            if (isGoldCard) {
                setTimeout(() => playSound('gold_card'), 300);
            } else if (isHolographic) {
                setTimeout(() => playSound('holographic_card'), 300);
            } else if (isHighTier) {
                setTimeout(() => {
                    playSound(card.classList.contains('S-tier') ? 'legendary_card' : 'rare_card');
                }, 300);
            }
        }, 500 + index * 800);
    });
}

// Close the modal
export function closeCardPackModal() {
    const modalContainer = document.getElementById("card-pack-modal-container");
    if (modalContainer) {
        modalContainer.classList.remove('visible');
        setTimeout(() => {
            modalContainer.style.display = "none";
        }, 300);
    }
}

// Helper function to play sounds
function playSound(soundName) {
    // You'll need to implement this function or integrate with your sound system
    // For example:
    // const sound = new Audio(`assets/sounds/${soundName}.mp3`);
    // sound.play().catch(e => console.log("Error playing sound:", e));
    console.log(`Playing sound: ${soundName}`);
}

// Update the render function to include the card shop
export function renderMonsterCardsPanel() {
    console.log('renderMonsterCardsPanel function called');

    const container = document.getElementById('monster-cards-panel');
    if (!container) {
        console.error('Monster Cards panel container not found.');
        return;
    }

    // Ensure the panel is visible
    container.classList.add('active');

    console.log('Rendering Monster Cards panel...');

    container.innerHTML = ''; // Clear existing content

    // Create tabs for Collection and Shop
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'cards-tabs';
    tabsContainer.innerHTML = `
        <button class="card-tab active" data-tab="collection">Collection</button>
        <button class="card-tab" data-tab="shop">Card Shop</button>
    `;
    container.appendChild(tabsContainer);

    // Create container for tab content
    const tabContentContainer = document.createElement('div');
    tabContentContainer.className = 'card-tab-content';
    container.appendChild(tabContentContainer);

    // Add event listeners for tabs
    const tabs = tabsContainer.querySelectorAll('.card-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'collection') {
                renderCollectionTab(tabContentContainer);
            } else if (tab.dataset.tab === 'shop') {
                renderShopTab(tabContentContainer);
            }
        });
    });

    // Initial render of collection tab
    renderCollectionTab(tabContentContainer);
}

// Update the renderCollectionTab function
function renderCollectionTab(container) {
    container.innerHTML = '';
    
    // Add panel header
    const header = document.createElement('div');
    header.className = 'cards-panel-header';
    header.innerHTML = '<h2>Monster Cards Collection</h2>';
    container.appendChild(header);

    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    // Initialize cards if needed
    if (!window.player.cards) {
        window.player.cards = {};
    }
    
    // Convert old format if needed
    Object.entries(window.player.cards).forEach(([cardId, value]) => {
        if (typeof value === 'number') {
            // Convert old format (just a count) to new format
            window.player.cards[cardId] = {
                count: value,
                holographic: 0
            };
        }
    });

    // Display collection progress
    const totalCards = Object.keys(MONSTER_CARDS).length;
    const uniqueCards = Object.keys(window.player.cards).length;
    const progressContainer = document.createElement('div');
    progressContainer.className = 'collection-progress';
    progressContainer.innerHTML = `
        <div class="progress-text">Collection: ${uniqueCards}/${totalCards} cards (${Math.round(uniqueCards/totalCards*100)}%)</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(uniqueCards/totalCards*100)}%"></div>
        </div>
    `;
    container.appendChild(progressContainer);

    Object.entries(MONSTER_CARDS).forEach(([cardId, card]) => {
        // Check if card is unlocked
        const cardData = window.player.cards[cardId] || { count: 0, holographic: 0 };
        const isUnlocked = cardData.count > 0 || cardData.holographic > 0;
        const isHolographic = cardData.holographic > 0;
        const totalCount = (cardData.count || 0) + (cardData.holographic || 0);
        
        // Calculate display multiplier based on whether showing holographic version
        const displayMultiplier = isHolographic ? 
            card.effect.goldMultiplier * (1 + HOLOGRAPHIC_MULTIPLIER_BONUS) : 
            card.effect.goldMultiplier;
        
        const cardElement = document.createElement('div');
        cardElement.className = `card-container ${isUnlocked ? 'unlocked' : 'locked'} ${isHolographic ? 'holographic' : ''}`;
        cardElement.setAttribute('data-tier', card.tier);
        
        cardElement.innerHTML = `
        <div class="card-inner-content">
            <div class="card-header">
                <div class="card-name">${isUnlocked ? card.name : '???'}</div>
                <div class="card-tier-badge">${card.tier}</div>
                ${isHolographic ? '<div class="holographic-badge">HOLO</div>' : ''}
            </div>
            <div class="card-image-container">
                <img src="${isUnlocked 
                    ? `assets/cards/${card.name.toLowerCase().replace(/\s+/g, '_')}.png` 
                    : 'assets/cards/unknown_card.png'}" 
                    alt="${isUnlocked ? card.name : 'Unknown Card'}" 
                    class="card-image">
                ${isUnlocked ? `<div class="card-zone">${card.zone}</div>` : ''}
            </div>
            <div class="card-body">
                ${isUnlocked 
                    ? `<div class="card-effect">Gold Multiplier: +${displayMultiplier * 100}%</div>
                       <div class="card-count">
                          Owned: ${totalCount}x 
                          ${isHolographic ? `<span class="holographic-count">(${cardData.holographic}⭐)</span>` : ''}
                       </div>
                       ${isHolographic ? `<div class="holographic-tooltip">+${Math.round(HOLOGRAPHIC_MULTIPLIER_BONUS * 100)}% Enhanced Effect</div>` : ''}` 
                    : `<div class="card-locked-text">Locked</div>`}
            </div>
        </div>
    `;
        cardsContainer.appendChild(cardElement);
    });

    container.appendChild(cardsContainer);
}

// Render the shop tab
function renderShopTab(container) {
    container.innerHTML = '';
    
    // Add panel header
    const header = document.createElement('div');
    header.className = 'cards-panel-header';
    header.innerHTML = '<h2>Monster Cards Shop</h2>';
    container.appendChild(header);

    // Create shop container
    const shopContainer = document.createElement('div');
    shopContainer.className = 'card-shop-container';
    
    // Regular packs section
    let packsHTML = `
        <div class="card-packs-section">
            <h3>Card Packs</h3>
            <div class="card-packs-container">
                <div class="card-pack">
                    <h3>Basic Pack</h3>
                    <img src="assets/cards/basic_pack.png" alt="Basic Pack">
                    <p>Contains 3 cards<br>
                       Cards selected based on<br>
                       individual card drop rates</p>
                    <button class="osrs-button" onclick="window.buyCardPack('basic')">Buy (${CARD_PRICES.basicPack} Gold)</button>
                </div>
                
                <div class="card-pack">
                    <h3>Premium Pack</h3>
                    <img src="assets/cards/premium_pack.png" alt="Premium Pack">
                    <p>Contains 5 cards<br>
                       Cards selected based on<br>
                       individual card drop rates<br>
                       (Higher tier cards boosted)</p>
                    <button class="osrs-button" onclick="window.buyCardPack('premium')">Buy (${CARD_PRICES.premiumPack} Gold)</button>
                </div>
            </div>
        </div>
    `;
    
    // Zone packs section
    packsHTML += `
        <div class="card-packs-section">
            <h3>Zone Packs</h3>
            <div class="card-packs-container">
                <div class="card-pack">
                    <h3>Cowpen Pack</h3>
                    <img src="assets/cards/cowpen_pack.png" alt="Cowpen Pack" onerror="this.src='assets/cards/basic_pack.png'">
                    <p>Contains 4 cards<br>
                       Only Cow monsters<br>
                       from the Cowpen zone</p>
                    <button class="osrs-button" onclick="window.buyZonePack('Cowpen')">Buy (${CARD_PRICES.zonePack} Gold)</button>
                </div>
                
                <div class="card-pack">
                    <h3>Goblin Village Pack</h3>
                    <img src="assets/cards/goblin_village_pack.png" alt="Goblin Village Pack" onerror="this.src='assets/cards/basic_pack.png'">
                    <p>Contains 4 cards<br>
                       Only Goblin monsters<br>
                       from the Goblin Village</p>
                    <button class="osrs-button" onclick="window.buyZonePack('Goblin Village')">Buy (${CARD_PRICES.zonePack} Gold)</button>
                </div>
            </div>
        </div>
    `;
    
    // Individual card rolls section
    packsHTML += `
        <div class="card-tier-container">
            <h3>Individual Card Rolls</h3>
            <div class="tier-buttons">
                <button class="tier-button c-tier" onclick="window.buyCardRoll('C')">
                    Roll C-Tier (${CARD_PRICES.tierC} Gold)
                </button>
                <button class="tier-button b-tier" onclick="window.buyCardRoll('B')">
                    Roll B-Tier (${CARD_PRICES.tierB} Gold)
                </button>
                <button class="tier-button a-tier" onclick="window.buyCardRoll('A')">
                    Roll A-Tier (${CARD_PRICES.tierA} Gold)
                </button>
                <button class="tier-button s-tier" onclick="window.buyCardRoll('S')">
                    Roll S-Tier (${CARD_PRICES.tierS} Gold)
                </button>
            </div>
        </div>
    `;
    
    shopContainer.innerHTML = packsHTML;
    container.appendChild(shopContainer);
}

// Make functions available globally for button onclick events
window.buyZonePack = buyZonePack;
window.buyCardPack = buyCardPack;
window.buyCardRoll = buyCardRoll;
window.closeCardPackModal = closeCardPackModal; // Update this line