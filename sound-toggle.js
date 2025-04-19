class SoundToggle {
    constructor() {
        this.isPlaying = false;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.frequency = 432; // 432 Hz
        this.volume = 0.1; // 10% volume
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        this.createToggle();
    }

    createToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'sound-toggle';
        toggle.innerHTML = `
            <style>
                .sound-toggle {
                    position: fixed;
                    bottom: calc(20px + env(safe-area-inset-bottom));
                    right: 20px;
                    z-index: 1000;
                    cursor: pointer;
                    background: var(--dark-bg);
                    border: 2px solid var(--neon-blue);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--box-glow);
                    transition: all 0.3s ease;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                .sound-toggle:active {
                    transform: scale(0.95);
                }
                .sound-toggle::before {
                    content: '🔊';
                    font-size: 24px;
                    color: var(--neon-blue);
                    text-shadow: var(--text-glow);
                }
                .sound-toggle.playing::before {
                    content: '🔈';
                }
            </style>
        `;

        // Add both click and touch events
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSound();
        });
        toggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleSound();
        }, { passive: false });

        document.body.appendChild(toggle);
    }

    toggleSound() {
        if (!this.isPlaying) {
            this.startSound();
        } else {
            this.stopSound();
        }
        this.isPlaying = !this.isPlaying;
        document.querySelector('.sound-toggle').classList.toggle('playing');
    }

    startSound() {
        // Handle iOS audio context initialization
        if (this.isIOS) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Resume audio context on first interaction
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        } else {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
        this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.start();
    }

    stopSound() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Initialize the sound toggle when the page loads
window.addEventListener('load', () => {
    new SoundToggle();
}); 