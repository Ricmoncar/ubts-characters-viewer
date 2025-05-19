// Audio fade utility functions
function fadeOut(audioElement, duration = 1000) {
    return new Promise(resolve => {
        // Store initial volume
        const startVolume = audioElement.volume;
        
        // Set interval for gradual volume reduction
        const fadeStep = startVolume / (duration / 50);
        const fadeInterval = setInterval(() => {
            if (audioElement.volume > fadeStep) {
                audioElement.volume -= fadeStep;
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                // Reset volume for next time
                audioElement.volume = startVolume;
                clearInterval(fadeInterval);
                resolve();
            }
        }, 50);
    });
}

function fadeIn(audioElement, duration = 1000) {
    return new Promise(resolve => {
        // Start with volume 0
        const targetVolume = 1.0; // or another target volume
        audioElement.volume = 0;
        audioElement.play();
        
        // Set interval for gradual volume increase
        const fadeStep = targetVolume / (duration / 50);
        const fadeInterval = setInterval(() => {
            if (audioElement.volume < targetVolume - fadeStep) {
                audioElement.volume += fadeStep;
            } else {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
                resolve();
            }
        }, 50);
    });
}

// Replace the current music control functions with these enhanced versions
async function pauseAllMusic() {
    const fadePromises = [];
    for (const audio of Object.values(audioElements)) {
        if (!audio.paused) {
            fadePromises.push(fadeOut(audio));
        }
    }
    // Wait for all fades to complete
    await Promise.all(fadePromises);
}

async function playCharacterMusic(character) {
    if (isMusicMuted) return;
    
    // Fade out all currently playing music
    await pauseAllMusic();
    
    // Fade in the appropriate music for the selected character
    switch(character) {
        case 'blackjack':
            if (blackjackMusicState === 'humility') {
                fadeIn(audioElements.blackjackHumility);
            } else {
                fadeIn(audioElements.blackjackBravery);
            }
            startBlackjackMusicCycle();
            break;
        case 'yuki':
            fadeIn(audioElements.yuki);
            clearTimeout(animationTimeoutId);
            break;
        case 'snaps':
            fadeIn(audioElements.snaps);
            clearTimeout(animationTimeoutId);
            break;
        case 'flowey':
            fadeIn(audioElements.flowey);
            clearTimeout(animationTimeoutId);
            break;
    }
}

// Slow down Blackjack's music cycle to 30 seconds (instead of 5)
// And implement crossfade between Humility and Bravery themes
async function startBlackjackMusicCycle() {
    clearTimeout(animationTimeoutId);
    
    // Extend the cycle to 30 seconds
    animationTimeoutId = setTimeout(async () => {
        if (currentCharacter === 'blackjack' && !isMusicMuted) {
            // Apply CSS transition class for color change
            const characterElements = document.querySelectorAll('.character-blackjack');
            
            if (blackjackMusicState === 'humility') {
                // Transition to bravery state
                blackjackMusicState = 'bravery';
                
                // Update CSS classes for color transition
                characterElements.forEach(el => {
                    el.classList.remove('humility-state');
                    el.classList.add('bravery-state');
                });
                
                // Crossfade the music
                fadeIn(audioElements.blackjackBravery, 3000);
                fadeOut(audioElements.blackjackHumility, 3000);
            } else {
                // Transition to humility state
                blackjackMusicState = 'humility';
                
                // Update CSS classes for color transition
                characterElements.forEach(el => {
                    el.classList.remove('bravery-state');
                    el.classList.add('humility-state');
                });
                
                // Crossfade the music
                fadeIn(audioElements.blackjackHumility, 3000);
                fadeOut(audioElements.blackjackBravery, 3000);
            }
        }
        
        // Set up for the next switch
        startBlackjackMusicCycle();
    }, 30000); // 30 seconds for full cycle
}

// Add this to the initialization function to set up initial state
function initializeCharacterState() {
    if (currentCharacter === 'blackjack') {
        // Set initial state class
        const characterElements = document.querySelectorAll('.character-blackjack');
        characterElements.forEach(el => {
            el.classList.add(blackjackMusicState === 'humility' ? 'humility-state' : 'bravery-state');
        });
    }
}

// Call this after rendering the character
initializeCharacterState();