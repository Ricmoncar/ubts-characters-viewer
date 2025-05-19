// Color and Music Transition System for Blackjack
// Add this to your JavaScript file or inside a <script> tag

// Configure transition settings
const TRANSITION_SETTINGS = {
    cycleTime: 20000,          // 20 seconds per full cycle
    colorTransitionTime: 5000, // 5 seconds to transition colors
    audioFadeTime: 3000        // 3 seconds for audio crossfade
};

// Track current state
let blackjackMusicState = 'humility'; // Start with humility (blue)
let animationTimeoutId = null;
let isTransitioning = false;

// Audio elements reference
const audioElements = {
    blackjackHumility: document.getElementById('blackjack-humility'),
    blackjackBravery: document.getElementById('blackjack-bravery')
};

// Initialize audio volumes and load status
function initializeAudio() {
    Object.values(audioElements).forEach(audio => {
        audio.volume = 1.0;
        audio.load(); // Ensure audio is loaded and ready
    });
    
    // Preload audio if possible
    audioElements.blackjackHumility.preload = "auto";
    audioElements.blackjackBravery.preload = "auto";
}

// Audio fade utility functions with improved precision
function fadeOut(audioElement, duration = TRANSITION_SETTINGS.audioFadeTime) {
    return new Promise(resolve => {
        if (audioElement.paused || audioElement.volume === 0) {
            resolve();
            return;
        }
        
        // Store initial volume
        const startVolume = audioElement.volume;
        const startTime = performance.now();
        
        // Use requestAnimationFrame for smoother transitions
        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Calculate new volume with slight easing
            audioElement.volume = startVolume * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                audioElement.pause();
                audioElement.volume = startVolume; // Reset volume for next play
                resolve();
            }
        }
        
        requestAnimationFrame(step);
    });
}

function fadeIn(audioElement, duration = TRANSITION_SETTINGS.audioFadeTime) {
    return new Promise(resolve => {
        // Start with volume 0
        const targetVolume = 1.0;
        audioElement.volume = 0;
        
        // Some browsers block autoplay, so handle errors gracefully
        audioElement.play().catch(error => {
            console.log("Audio play failed:", error);
            resolve();
            return;
        });
        
        const startTime = performance.now();
        
        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Calculate new volume with slight easing
            audioElement.volume = targetVolume * progress;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                audioElement.volume = targetVolume;
                resolve();
            }
        }
        
        requestAnimationFrame(step);
    });
}

// Update the visual theme for all Blackjack elements
function updateBlackjackTheme(newState, transitionTime) {
    // Get all Blackjack-related elements
    const characterElements = document.querySelectorAll('.character-blackjack');
    const profileBorder = document.querySelector('.character-blackjack .profile-image');
    const nameText = document.querySelector('.character-blackjack h2.character-name');
    const cardBorders = document.querySelectorAll('.character-blackjack.character-stats, .character-blackjack.character-inventory, .character-blackjack.character-magic');
    const manaBar = document.querySelector('.character-blackjack .mana-bar');
    
    // Update state indicator
    const stateIndicator = document.querySelector('.humility, .bravery'); // Target the state label
    if (stateIndicator) {
        // Change text content
        stateIndicator.textContent = newState.charAt(0).toUpperCase() + newState.slice(1);
        
        // Remove old class and add new class
        stateIndicator.classList.remove('humility', 'bravery');
        stateIndicator.classList.add(newState);
        
        // Set transition duration
        stateIndicator.style.transition = `background-color ${transitionTime}ms ease, color ${transitionTime}ms ease, border-color ${transitionTime}ms ease`;
    }
    
    // Apply transitions to all elements
    const applyTransition = (element, props) => {
        if (!element) return;
        
        // Set transition timing
        element.style.transition = `${props.join(', ')} ${transitionTime}ms ease`;
        
        // Add the new state class and remove old one
        element.classList.remove('humility-state', 'bravery-state');
        element.classList.add(`${newState}-state`);
    };
    
    // Apply to all character elements
    characterElements.forEach(el => {
        applyTransition(el, ['border-color', 'background', 'box-shadow']);
    });
    
    // Special elements with specific properties
    if (profileBorder) {
        applyTransition(profileBorder, ['border-color', 'box-shadow']);
    }
    
    if (nameText) {
        applyTransition(nameText, ['color', 'border-bottom-color']);
    }
    
    cardBorders.forEach(el => {
        applyTransition(el, ['border-color']);
    });
    
    if (manaBar) {
        applyTransition(manaBar, ['background']);
    }
}

// Main cycle function for Blackjack's theme and music
function startBlackjackCycle() {
    clearTimeout(animationTimeoutId);
    
    animationTimeoutId = setTimeout(async () => {
        if (isTransitioning || document.hidden) {
            // If already transitioning or page is hidden, skip this cycle and check again later
            animationTimeoutId = setTimeout(startBlackjackCycle, 1000);
            return;
        }
        
        isTransitioning = true;
        
        // Determine the new state
        const newState = blackjackMusicState === 'humility' ? 'bravery' : 'humility';
        blackjackMusicState = newState;
        
        // Update the visual theme with specified transition time
        updateBlackjackTheme(newState, TRANSITION_SETTINGS.colorTransitionTime);
        
        // Play the appropriate music with crossfade
        if (newState === 'humility') {
            fadeIn(audioElements.blackjackHumility);
            fadeOut(audioElements.blackjackBravery);
        } else {
            fadeIn(audioElements.blackjackBravery);
            fadeOut(audioElements.blackjackHumility);
        }
        
        // Wait for transition to complete
        setTimeout(() => {
            isTransitioning = false;
            // Continue the cycle
            startBlackjackCycle();
        }, TRANSITION_SETTINGS.colorTransitionTime);
        
    }, TRANSITION_SETTINGS.cycleTime - TRANSITION_SETTINGS.colorTransitionTime);
}

// Initialize the system
function initializeBlackjackSystem() {
    // Set up CSS for transitions if not already present
    addTransitionStyles();
    
    // Initialize audio elements
    initializeAudio();
    
    // Set initial state classes
    updateBlackjackTheme(blackjackMusicState, 0); // 0 for instant first setup
    
    // Start playing the initial music
    if (blackjackMusicState === 'humility') {
        audioElements.blackjackHumility.play().catch(e => console.log("Initial audio play failed:", e));
    } else {
        audioElements.blackjackBravery.play().catch(e => console.log("Initial audio play failed:", e));
    }
    
    // Start the cycle
    startBlackjackCycle();
}

// Add necessary CSS styles if not already in stylesheet
function addTransitionStyles() {
    // Check if styles already exist
    if (!document.getElementById('blackjack-transition-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'blackjack-transition-styles';
        styleSheet.innerHTML = `
            /* Blackjack state styles */
            .character-blackjack.humility-state {
                border-color: #1e90ff;
                background: linear-gradient(135deg, rgba(30, 144, 255, 0.2), rgba(30, 144, 255, 0.05));
            }
            
            .character-blackjack.humility-state .profile-image {
                border-color: #1e90ff;
                box-shadow: 0 5px 15px rgba(30, 144, 255, 0.4);
            }
            
            .character-blackjack.humility-state h2.character-name {
                color: #1e90ff;
                border-bottom-color: #1e90ff;
            }
            
            .character-blackjack.humility-state .character-stats,
            .character-blackjack.humility-state .character-inventory,
            .character-blackjack.humility-state .character-magic {
                border-color: #1e90ff;
            }
            
            .character-blackjack.humility-state .mana-bar {
                background: linear-gradient(90deg, #1e90ff, #1e90ff);
            }
            
            .character-blackjack.bravery-state {
                border-color: #ff8c00;
                background: linear-gradient(135deg, rgba(255, 140, 0, 0.2), rgba(255, 140, 0, 0.05));
            }
            
            .character-blackjack.bravery-state .profile-image {
                border-color: #ff8c00;
                box-shadow: 0 5px 15px rgba(255, 140, 0, 0.4);
            }
            
            .character-blackjack.bravery-state h2.character-name {
                color: #ff8c00;
                border-bottom-color: #ff8c00;
            }
            
            .character-blackjack.bravery-state .character-stats,
            .character-blackjack.bravery-state .character-inventory,
            .character-blackjack.bravery-state .character-magic {
                border-color: #ff8c00;
            }
            
            .character-blackjack.bravery-state .mana-bar {
                background: linear-gradient(90deg, #ff8c00, #ff8c00);
            }
            
            /* State indicator styles */
            .humility {
                background-color: rgba(30, 144, 255, 0.2);
                color: #1e90ff;
                border: 1px solid #1e90ff;
                padding: 2px 8px;
                border-radius: 10px;
                display: inline-block;
                transition: all 5s ease;
            }
            
            .bravery {
                background-color: rgba(255, 140, 0, 0.2);
                color: #ff8c00;
                border: 1px solid #ff8c00;
                padding: 2px 8px;
                border-radius: 10px;
                display: inline-block;
                transition: all 5s ease;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', initializeBlackjackSystem);

// Optional: Handle page visibility changes to pause/resume transitions when tab is inactive
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause audio to save resources
        Object.values(audioElements).forEach(audio => {
            if (!audio.paused) {
                audio.pause();
            }
        });
    } else {
        // Page is visible again, resume cycle
        if (currentCharacter === 'blackjack') {
            // Resume the appropriate audio
            if (blackjackMusicState === 'humility') {
                audioElements.blackjackHumility.play().catch(e => {});
            } else {
                audioElements.blackjackBravery.play().catch(e => {});
            }
            
            // Restart the cycle if needed
            if (!animationTimeoutId) {
                startBlackjackCycle();
            }
        }
    }
});