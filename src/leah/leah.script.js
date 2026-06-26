        const state = {
            xp: 0,
            level: 1,
            hearts: 0,
            celebrationPct: 0,
            achievements: [],
            hasSynthesizer: false,
            audioCtx: null,
            redButtonClicks: 0,
            cakeGameActive: false,
            bossGameActive: false,
            constellationActive: false,
            speedrunActive: false,
            bossHasSecondChance: true, 
            cakeHasSecondChance: true, 
            cringeCategory: 'mild',
            constellationDrawMode: false,
            
            // ANTI-SPAM SYSTEM (Aura saturation drops yield if played repeatedly)
            activitySaturations: {
                zen: 0.0,
                pickup: 0.0,
                cupcake: 0.0,
                stare: 0.0,
                slots: 0.0,
                starshield: 0.0,
                cakedefense: 0.0,
                constellation: 0.0,
                harmony: 0.0,
                museum: 0.0,
                speedrun: 0.0
            },
            
            soundAmbiences: {
                wind: null,
                ocean: null,
                cafe: null,
                thunder: null,
                chimes: null,
                cafeInterval: null,
                chimeInterval: null,
                cafeVolume: 0
            },
            cupcakeRecipe: {
                frosting: '#fbcfe8',
                frostingName: 'Pink Strawberry Cream',
                toppings: {
                    cherry: false,
                    sprinkles: false,
                    candle: false,
                    drizzle: false,
                    crown: false,
                    blueberries: false,
                    cookieCrumbles: false,
                    freshMint: false,
                    magicStardust: false
                }
            },
            selectedHarmonyIngredients: []
        };

        const achievementsList = [
            { id: 'ach_join', title: 'Curious Explorer', desc: 'Slipped into Leah\'s interactive Birthday Dimension.', hint: 'Always unlocked.', icon: '🪐' },
            { id: 'ach_rizz', title: 'Cosmic Poet', desc: 'Rated and appreciated sweet astrophysical compliments.', hint: 'Find the Poetic Lines Arena.', icon: '✉️' },
            { id: 'ach_stare', title: 'Absolute Eye-Lock', desc: 'Maintained mesmerizing eye contact for 5+ seconds.', hint: 'Hold down focus in the Eye Contact room.', icon: '🤎' },
            { id: 'ach_slot', title: 'Jackpot Master', desc: 'Pulled the slot lever until the reels aligned.', hint: 'Spin the slots in the casino.', icon: '🎰' },
            { id: 'ach_cupcake', title: 'Master Baker', desc: 'Assembled a perfect customized cupcake creation.', hint: 'Decorate and Present in the Cozy Bakery.', icon: '🧁' },
            { id: 'ach_button_10', title: 'Paradox Seeker', desc: 'Pressed the suspicious Red Button 10 times.', hint: 'Click the Red Button repeatedly.', icon: '🛑' },
            { id: 'ach_button_50', title: 'Reality Glitcher', desc: 'Unlocked the massive Red Button event horizon.', hint: 'Keep pushing the red button to 50 clicks.', icon: '👾' },
            { id: 'ach_boss_win', title: 'Space Sentinel', desc: 'Caught 15+ coordinates in Retro Space Shield.', hint: 'Collect coordinates in the shield mini-game.', icon: '🚀' },
            { id: 'ach_cake_win', title: 'Cake Protector', desc: 'Protected cake layers to score over 40 in Cake Defense.', hint: 'Defend the cake grid.', icon: '🍰' },
            { id: 'ach_const_drawn', title: 'Cosmic Architect', desc: 'Connected a complete constellation pattern.', hint: 'Sketch coordinates in the Constellation Matcher.', icon: '✨' },
            { id: 'ach_harmony_fused', title: 'Aroma Alchemist', desc: 'Synthesized a custom cozy flavor profile.', hint: 'Combine items in the Cozy Harmony Lab.', icon: '🍵' },
            { id: 'ach_second_chance', title: 'Universal Grace', desc: 'Triggered a beautiful, life-saving free survival backup.', hint: 'Hold integrity to zero in the games.', icon: '💖' },
            { id: 'ach_sound', title: 'Cozy Soundscapes', desc: 'Balanced winds, oceans, and keyboard frequencies.', hint: 'Slide levels in Zen Soundscape.', icon: '🌿' },
            { id: 'ach_temple', title: 'Final Ascension', desc: 'Gathered enough energy to unlock the Cosmic Temple.', hint: 'Reach 80% progression.', icon: '🌟' },
            { id: 'ach_speedrun', title: 'Flash Master', desc: 'Logged 35+ cookies in the Birthday Speedrun.', hint: 'Catch cookies at high speeds.', icon: '⏱️' }
        ];

        class SynthEngine {
            constructor() { this.ctx = null; }
            init() {
                if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
                if (this.ctx.state === 'suspended') { this.ctx.resume(); }
            }

            createNoiseBuffer() {
                if (!this.ctx) return null;
                const bufferSize = this.ctx.sampleRate * 2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
                return buffer;
            }

            playTone(freq, type = 'sine', duration = 0.2, volume = 0.1) {
                if (!this.ctx) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gainNode = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                    osc.connect(gainNode);
                    gainNode.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch (e) { console.warn(e); }
            }

            playLevelUp() {
                this.playTone(261.63, 'sine', 0.15, 0.08); 
                setTimeout(() => this.playTone(329.63, 'sine', 0.15, 0.08), 100); 
                setTimeout(() => this.playTone(392.00, 'sine', 0.15, 0.08), 200); 
                setTimeout(() => this.playTone(523.25, 'triangle', 0.5, 0.12), 300); 
            }

            playAchievement() {
                this.playTone(587.33, 'triangle', 0.1, 0.08); 
                setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.08), 80); 
                setTimeout(() => this.playTone(783.99, 'sine', 0.1, 0.08), 160); 
                setTimeout(() => this.playTone(1046.50, 'sine', 0.6, 0.15), 240); 
            }

            setupWind() {
                if (!this.ctx) return null;
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                noise.loop = true;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass'; filter.Q.value = 8.0;
                filter.frequency.setValueAtTime(300, this.ctx.currentTime);
                const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0, this.ctx.currentTime);
                noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
                noise.start();
                const lfo = this.ctx.createOscillator(); lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
                const lfoGain = this.ctx.createGain(); lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
                lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
                return { gain, filter, noise, lfo };
            }

            setupOcean() {
                if (!this.ctx) return null;
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                noise.loop = true;
                const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass';
                filter.frequency.setValueAtTime(250, this.ctx.currentTime);
                const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0, this.ctx.currentTime);
                noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
                noise.start();
                return { gain, filter, noise };
            }

            setupThunder() {
                if (!this.ctx) return null;
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                noise.loop = true;
                const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass';
                filter.frequency.setValueAtTime(80, this.ctx.currentTime);
                const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0, this.ctx.currentTime);
                noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
                noise.start();
                return { gain, filter, noise };
            }
        }
        const synth = new SynthEngine();

        document.getElementById('btnUnlockAudio').addEventListener('click', () => {
            synth.init();
            state.hasSynthesizer = true;
            document.getElementById('audioUnlockBanner').classList.add('opacity-0', 'pointer-events-none');
            synth.playLevelUp();
            state.soundAmbiences.wind = synth.setupWind();
            state.soundAmbiences.ocean = synth.setupOcean();
            state.soundAmbiences.thunder = synth.setupThunder();
        });

        const bgCanvas = document.getElementById('bgCanvas');
        const bgCtx = bgCanvas.getContext('2d');
        let bgStars = [];
        
        function resizeBgCanvas() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeBgCanvas);
        resizeBgCanvas();

        // Create doodle twinks
        for (let i = 0; i < 40; i++) {
            bgStars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 2,
                alpha: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 0.05 + 0.01,
                type: Math.random() > 0.5 ? 'cross' : 'circle'
            });
        }

        function updateBackground() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgStars.forEach(s => {
                s.y -= s.speed;
                if (s.y < 0) s.y = bgCanvas.height;
                bgCtx.strokeStyle = `rgba(147, 51, 234, ${s.alpha})`;
                bgCtx.fillStyle = `rgba(147, 51, 234, ${s.alpha})`;
                
                // Draw hand-made style stars
                if (s.type === 'cross') {
                    bgCtx.beginPath();
                    bgCtx.moveTo(s.x - s.size, s.y);
                    bgCtx.lineTo(s.x + s.size, s.y);
                    bgCtx.moveTo(s.x, s.y - s.size);
                    bgCtx.lineTo(s.x, s.y + s.size);
                    bgCtx.stroke();
                } else {
                    bgCtx.beginPath();
                    bgCtx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
                    bgCtx.fill();
                }
            });
            requestAnimationFrame(updateBackground);
        }
        updateBackground();

        // Progressive Progression Tuning
        function earnReward(xpVal, heartVal, activityKey = null) {
            let actualXp = xpVal;
            let actualHearts = heartVal;

            if (activityKey && state.activitySaturations[activityKey] !== undefined) {
                const multiplier = Math.max(0.1, 1.0 - state.activitySaturations[activityKey]);
                actualXp = Math.round(xpVal * multiplier);
                actualHearts = Math.round(heartVal * multiplier);
                state.activitySaturations[activityKey] = Math.min(0.9, state.activitySaturations[activityKey] + 0.15);
                updateSaturationLabels();
            }

            state.xp += actualXp;
            state.hearts += actualHearts;

            const maxProgression = 1500; 
            state.celebrationPct = Math.min(Math.round((state.xp / maxProgression) * 100), 100);
            state.level = Math.floor(state.xp / 300) + 1;

            document.getElementById('valXP').innerText = state.xp;
            document.getElementById('valHearts').innerText = state.hearts;
            document.getElementById('hudLevelVal').innerText = state.level;
            document.getElementById('celebrationPercentage').innerText = `${state.celebrationPct}% Charged`;
            document.getElementById('celebrationProgressBar').style.width = `${state.celebrationPct}%`;

            // Open gates
            if (state.celebrationPct >= 40) {
                const vault = document.getElementById('cardCringeVault');
                if (vault) {
                    vault.classList.remove('opacity-60', 'cursor-not-allowed', 'border-stone-300');
                    vault.classList.add('border-stone-800', 'bg-white');
                    document.getElementById('vaultStatus').innerText = 'OPEN';
                    document.getElementById('vaultStatus').className = 'text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-sans font-bold ml-2';
                    document.getElementById('vaultDesc').innerText = 'Unlocked unhinged cringe files.';
                }
            }

            if (state.celebrationPct >= 80) {
                const templ = document.getElementById('cardTemple');
                if (templ) {
                    templ.classList.remove('opacity-60', 'cursor-not-allowed', 'border-stone-300');
                    templ.classList.add('border-stone-800', 'bg-white');
                    document.getElementById('templeStatus').innerText = 'READY';
                    document.getElementById('templeStatus').className = 'text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-sans font-bold ml-2 animate-pulse';
                    document.getElementById('templeDesc').innerText = 'The starry gateway is ready. Enter the sanctuary.';
                    triggerAchievement('ach_temple');
                }
            }
        }

        function updateSaturationLabels() {
            const formatSatur = (val) => {
                const pct = Math.round(val * 100);
                if (pct <= 0) return "Aura Saturation: 0% (Clean Sketch)";
                if (pct >= 80) return `Aura Saturation: ${pct}% (Saturated! Try other doodles!)`;
                return `Aura Saturation: ${pct}% (Yields decreasing)`;
            };

            const formatCol = (val) => {
                if (val >= 0.8) return "text-red-500 font-extrabold";
                if (val >= 0.4) return "text-yellow-600 font-bold";
                return "text-stone-400 font-semibold";
            };

            const z = document.getElementById('soundAuraSat'); if (z) { z.innerText = formatSatur(state.activitySaturations.zen); z.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.zen); }
            const p = document.getElementById('pickupAuraSat'); if (p) { p.innerText = formatSatur(state.activitySaturations.pickup); p.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.pickup); }
            const c = document.getElementById('cupcakeAuraSat'); if (c) { c.innerText = formatSatur(state.activitySaturations.cupcake); c.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.cupcake); }
            const st = document.getElementById('stareAuraSat'); if (st) { st.innerText = formatSatur(state.activitySaturations.stare); st.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.stare); }
            const sl = document.getElementById('slotAuraSat'); if (sl) { sl.innerText = formatSatur(state.activitySaturations.slots); sl.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.slots); }
            const sh = document.getElementById('shieldAuraSat'); if (sh) { sh.innerText = formatSatur(state.activitySaturations.starshield); sh.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.starshield); }
            const cd = document.getElementById('cakeAuraSat'); if (cd) { cd.innerText = formatSatur(state.activitySaturations.cakedefense); cd.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.cakedefense); }
            const co = document.getElementById('constAuraSat'); if (co) { co.innerText = formatSatur(state.activitySaturations.constellation); co.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.constellation); }
            const h = document.getElementById('harmonyAuraSat'); if (h) { h.innerText = formatSatur(state.activitySaturations.harmony); h.className = "text-[10px] uppercase tracking-wider font-sans " + formatCol(state.activitySaturations.harmony); }
        }

        function decaySaturationsGlobal() {
            for (let k in state.activitySaturations) {
                state.activitySaturations[k] = Math.max(0.0, state.activitySaturations[k] - 0.15);
            }
            updateSaturationLabels();
        }

        function showCustomToast(title, message, icon = '✨') {
            document.getElementById('toastIcon').innerText = icon;
            document.getElementById('toastTitle').innerText = title;
            document.getElementById('toastMessage').innerText = message;
            
            const toast = document.getElementById('toastNotification');
            toast.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
            toast.classList.add('scale-100', 'opacity-100');

            setTimeout(() => {
                toast.classList.remove('scale-100', 'opacity-100');
                toast.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
            }, 3500);
        }

        function spawnHearts(e, count = 3) {
            for (let i = 0; i < count; i++) {
                const heart = document.createElement('i');
                heart.className = 'fa-solid fa-heart floating-heart';
                heart.style.left = `${e.clientX + (Math.random() - 0.5) * 40}px`;
                heart.style.top = `${e.clientY + (Math.random() - 0.5) * 40}px`;
                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 1800);
            }
        }
        window.addEventListener('click', (e) => {
            if (Math.random() > 0.4) spawnHearts(e, 2);
        });

        function triggerAchievement(id) {
            if (state.achievements.includes(id)) return;
            state.achievements.push(id);
            const ach = achievementsList.find(a => a.id === id);
            if (!ach) return;

            document.getElementById('achievementCounter').innerText = `${state.achievements.length}/15`;
            if (state.hasSynthesizer) { synth.playAchievement(); }

            const toast = document.createElement('div');
            toast.className = 'bg-white border-3 border-stone-800 p-4 rounded-xl shadow-[4px_4px_0px_0px_#2d2d2d] flex items-center gap-3 pointer-events-auto transition-all duration-300 font-hand';
            toast.style.borderRadius = "20px 5px 20px 5px;";
            toast.innerHTML = `
                <div class="text-3xl">${ach.icon}</div>
                <div>
                    <h5 class="text-[10px] font-sketch font-bold text-purple-600 tracking-wider">CHALLENGE LOGPED</h5>
                    <h4 class="font-bold text-sm text-stone-900 uppercase">${ach.title}</h4>
                    <p class="text-xs text-stone-600 mt-0.5">${ach.desc}</p>
                </div>
            `;
            document.getElementById('achievementToastStack').appendChild(toast);

            if (id === 'ach_button_10') {
                const btn = document.getElementById('mysteryFlavorBtn');
                if (btn) {
                    btn.className = "px-2 py-1.5 bg-gradient-to-tr from-purple-500 to-cyan-400 text-white border-2 border-stone-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer";
                    btn.innerHTML = `<span class="w-3 h-3 rounded-full bg-indigo-500 border border-white inline-block"></span> Cosmic Stardust`;
                }
            }

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-12');
                setTimeout(() => toast.remove(), 400);
            }, 4500);
        }

        function toggleAchievementsModal() {
            if (state.hasSynthesizer) { synth.playTone(420, 'sine', 0.1, 0.05); }
            const modal = document.getElementById('modalAchievements');
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                const grid = document.getElementById('achievementsGrid');
                grid.innerHTML = '';
                achievementsList.forEach(ach => {
                    const unlocked = state.achievements.includes(ach.id);
                    if (unlocked) {
                        grid.innerHTML += `
                            <div class="p-3 bg-white border-2 border-stone-800 rounded-xl flex items-center gap-3 shadow-[2px_2px_0px_0px_#2d2d2d]" style="border-radius:15px 5px 15px 5px;">
                                <span class="text-3xl">${ach.icon}</span>
                                <div>
                                    <h4 class="text-sm font-bold text-stone-950 uppercase font-sketch">${ach.title}</h4>
                                    <p class="text-xs text-stone-500 font-medium mt-0.5">${ach.desc}</p>
                                </div>
                            </div>
                        `;
                    } else {
                        grid.innerHTML += `
                            <div class="p-3 bg-stone-50 border-2 border-dashed border-stone-400 rounded-xl flex items-center gap-3 opacity-75">
                                <span class="text-3xl grayscale">🔒</span>
                                <div>
                                    <h4 class="text-xs font-bold text-stone-500 uppercase font-sketch">Locked coordinate</h4>
                                    <p class="text-[10px] text-purple-600 font-bold mt-0.5 font-sans">Hint: ${ach.hint}</p>
                                </div>
                            </div>
                        `;
                    }
                });
            }
        }
        document.getElementById('btnAchievementsToggle').addEventListener('click', toggleAchievementsModal);

        function openZone(zoneId) {
            if (state.hasSynthesizer) { synth.playTone(450, 'sine', 0.06, 0.04); }
            decaySaturationsGlobal();

            // Clear all modal viewports to guarantee clean transition without overlays
            const modals = ['modalZen', 'modalPickup', 'modalCupcake', 'modalGojo', 'modalSlot', 'modalBoss', 'modalRedButton', 'modalCakeDefense', 'modalConstellation', 'modalHarmony', 'modalCringe', 'modalTemple', 'modalMuseum', 'modalSpeedrun', 'modalWish'];
            modals.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.classList.add('hidden');
            });

            const map = {
                'zoneZen': 'modalZen', 'zonePickup': 'modalPickup', 'zoneCupcake': 'modalCupcake',
                'zoneGojo': 'modalGojo', 'zoneSlot': 'modalSlot', 'zoneBoss': 'modalBoss',
                'zoneRedButton': 'modalRedButton', 'zoneCakeDefense': 'modalCakeDefense',
                'zoneConstellation': 'modalConstellation', 'zoneHarmony': 'modalHarmony',
                'zoneCringe': 'modalCringe', 'zoneTemple': 'modalTemple', 'zoneMuseum': 'modalMuseum',
                'zoneSpeedrun': 'modalSpeedrun', 'zoneWish': 'modalWish'
            };

            const target = map[zoneId];
            if (target) {
                document.getElementById(target).classList.remove('hidden');
                document.getElementById('dashboardHub').classList.add('hidden');
                
                if (zoneId === 'zoneGojo') initGojoGame();
                if (zoneId === 'zoneBoss') startBossGame();
                if (zoneId === 'zoneCakeDefense') initCakeDefense();
                if (zoneId === 'zoneConstellation') initConstellationGame();
                if (zoneId === 'zoneHarmony') initHarmonyInterface();
                if (zoneId === 'zoneZen') initZenVisualizer();
                if (zoneId === 'zoneSpeedrun') startSpeedrunGame();
                if (zoneId === 'zoneWish') initWishLamp();
            }
        }

        function closeZone(zoneId) {
            if (state.hasSynthesizer) { synth.playTone(280, 'sine', 0.06, 0.04); }
            document.getElementById('dashboardHub').classList.remove('hidden');
            
            const map = {
                'zoneZen': 'modalZen', 'zonePickup': 'modalPickup', 'zoneCupcake': 'modalCupcake',
                'zoneGojo': 'modalGojo', 'zoneSlot': 'modalSlot', 'zoneBoss': 'modalBoss',
                'zoneRedButton': 'modalRedButton', 'zoneCakeDefense': 'modalCakeDefense',
                'zoneConstellation': 'modalConstellation', 'zoneHarmony': 'modalHarmony',
                'zoneCringe': 'modalCringe', 'zoneTemple': 'modalTemple', 'zoneMuseum': 'modalMuseum',
                'zoneSpeedrun': 'modalSpeedrun', 'zoneWish': 'modalWish'
            };
            const target = map[zoneId];
            if (target) document.getElementById(target).classList.add('hidden');

            if (zoneId === 'zoneCakeDefense') {
                state.cakeGameActive = false;
                if (cakeInterval) clearInterval(cakeInterval);
            }
            if (zoneId === 'zoneBoss') { state.bossGameActive = false; }
            if (zoneId === 'zoneGojo') { stopStaring(); gojoGameActive = false; }
            if (zoneId === 'zoneConstellation') { state.constellationActive = false; }
            if (zoneId === 'zoneSpeedrun') { state.speedrunActive = false; }
        }

        function tryOpenVault() {
            if (state.celebrationPct >= 40) { openZone('zoneCringe'); }
            else { showCustomToast('Portal Sealed', 'The cringe records are encrypted. Reach 40% celebration energy!', '🔒'); }
        }

        function tryOpenTemple() {
            if (state.celebrationPct >= 80) { openZone('zoneTemple'); }
            else { showCustomToast('Temple Sealed', 'The path requires at least 80% progression coordinates.', '🔒'); }
        }

        // =========================================================================
        // MODULE 1: ZEN SOUNDSCAPE GARDEN
        // =========================================================================
        let zenVisualizerCtx, zenVisualizerCanvas;
        
        function initZenVisualizer() {
            zenVisualizerCanvas = document.getElementById('zenVisualizer');
            zenVisualizerCtx = zenVisualizerCanvas.getContext('2d');
            zenVisualizerCanvas.width = zenVisualizerCanvas.offsetWidth;
            zenVisualizerCanvas.height = 128;
            const hint = document.getElementById('zenAudioHint');
            if (hint) hint.classList.toggle('hidden', !!state.hasSynthesizer);
            drawZenFrame();
        }


        function drawZenFrame() {
            if (document.getElementById('modalZen').classList.contains('hidden')) return;
            zenVisualizerCtx.fillStyle = '#0f172a';
            zenVisualizerCtx.fillRect(0, 0, zenVisualizerCanvas.width, zenVisualizerCanvas.height);

            const wind = document.getElementById('slideWind').value / 100;
            const ocean = document.getElementById('slideOcean').value / 100;
            const cafe = document.getElementById('slideCafe').value / 100;
            const thunder = document.getElementById('slideThunder').value / 100;

            const time = Date.now() * 0.003;
            zenVisualizerCtx.lineWidth = 2.5;

            if (wind > 0) {
                zenVisualizerCtx.strokeStyle = `rgba(167, 139, 250, ${wind})`;
                zenVisualizerCtx.beginPath();
                for (let x = 0; x < zenVisualizerCanvas.width; x++) {
                    const y = zenVisualizerCanvas.height / 2 + Math.sin(x * 0.02 + time) * (20 * wind);
                    if (x === 0) zenVisualizerCtx.moveTo(x, y); else zenVisualizerCtx.lineTo(x, y);
                }
                zenVisualizerCtx.stroke();
            }

            if (ocean > 0) {
                zenVisualizerCtx.strokeStyle = `rgba(56, 189, 248, ${ocean})`;
                zenVisualizerCtx.beginPath();
                for (let x = 0; x < zenVisualizerCanvas.width; x++) {
                    const y = zenVisualizerCanvas.height / 2 + 15 + Math.sin(x * 0.01 - time * 0.5) * (25 * ocean);
                    if (x === 0) zenVisualizerCtx.moveTo(x, y); else zenVisualizerCtx.lineTo(x, y);
                }
                zenVisualizerCtx.stroke();
            }

            if (thunder > 0) {
                zenVisualizerCtx.strokeStyle = `rgba(234, 179, 8, ${thunder})`;
                if (Math.random() < 0.05 * thunder) {
                    zenVisualizerCtx.beginPath();
                    zenVisualizerCtx.moveTo(Math.random() * zenVisualizerCanvas.width, 0);
                    zenVisualizerCtx.lineTo(Math.random() * zenVisualizerCanvas.width, zenVisualizerCanvas.height);
                    zenVisualizerCtx.stroke();
                }
            }

            requestAnimationFrame(drawZenFrame);
        }

        // Trigger Rhodes Ambient Chords
        function triggerCafeChord() {
            if (!state.hasSynthesizer || !state.audioCtx || state.soundAmbiences.cafeVolume <= 0) return;
            try {
                const chords = [
                    [130.81, 164.81, 196.00, 246.94], // Cmaj7
                    [146.83, 174.61, 220.00, 261.63, 329.63], // Dmin9
                    [174.61, 220.00, 261.63, 329.63], // Fmaj7
                    [196.00, 233.08, 293.66, 349.23]  // G7
                ];
                const selectedChord = chords[Math.floor(Math.random() * chords.length)];
                selectedChord.forEach((freq, idx) => {
                    setTimeout(() => {
                        if (state.soundAmbiences.cafeVolume <= 0) return;
                        const osc = state.audioCtx.createOscillator();
                        const gain = state.audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
                        
                        gain.gain.setValueAtTime(0, state.audioCtx.currentTime);
                        gain.gain.linearRampToValueAtTime(state.soundAmbiences.cafeVolume * 0.04, state.audioCtx.currentTime + 0.5);
                        gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 3.0);
                        
                        osc.connect(gain);
                        gain.connect(state.audioCtx.destination);
                        osc.start();
                        osc.stop(state.audioCtx.currentTime + 3.5);
                    }, idx * 150); 
                });
            } catch(e) {}
        }

        function triggerChimes() {
            const chimesVolume = document.getElementById('slideChimes').value / 100;
            if (!state.hasSynthesizer || !state.audioCtx || chimesVolume <= 0) return;
            try {
                const pitch = 1500 + Math.random() * 1000;
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(pitch, state.audioCtx.currentTime);
                gain.gain.setValueAtTime(0, state.audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(chimesVolume * 0.05, state.audioCtx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 1.2);
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.start();
                osc.stop(state.audioCtx.currentTime + 1.5);
            } catch(e) {}
        }

        function updateAmbiences() {
            if (!state.hasSynthesizer) return;
            earnReward(2, 0, 'zen');
            triggerAchievement('ach_sound');
            
            const windVal = document.getElementById('slideWind').value / 100;
            const oceanVal = document.getElementById('slideOcean').value / 100;
            const cafeVal = document.getElementById('slideCafe').value / 100;
            const thunderVal = document.getElementById('slideThunder').value / 100;
            const chimesVal = document.getElementById('slideChimes').value / 100;

            document.getElementById('valWind').innerText = windVal > 0 ? `${Math.round(windVal*100)}%` : 'Off';
            document.getElementById('valOcean').innerText = oceanVal > 0 ? `${Math.round(oceanVal*100)}%` : 'Off';
            document.getElementById('valCafe').innerText = cafeVal > 0 ? `${Math.round(cafeVal*100)}%` : 'Off';
            document.getElementById('valThunder').innerText = thunderVal > 0 ? `${Math.round(thunderVal*100)}%` : 'Off';
            document.getElementById('valChimes').innerText = chimesVal > 0 ? `${Math.round(chimesVal*100)}%` : 'Off';

            if (state.soundAmbiences.wind) {
                state.soundAmbiences.wind.gain.gain.linearRampToValueAtTime(windVal * 0.12, synth.ctx.currentTime + 0.1);
            }
            if (state.soundAmbiences.ocean) {
                state.soundAmbiences.ocean.gain.gain.linearRampToValueAtTime(oceanVal * 0.15, synth.ctx.currentTime + 0.1);
            }
            if (state.soundAmbiences.thunder) {
                state.soundAmbiences.thunder.gain.gain.linearRampToValueAtTime(thunderVal * 0.18, synth.ctx.currentTime + 0.1);
            }
            
            state.soundAmbiences.cafeVolume = cafeVal;
            state.audioCtx = synth.ctx;

            if (cafeVal > 0 && !state.soundAmbiences.cafeInterval) {
                triggerCafeChord();
                state.soundAmbiences.cafeInterval = setInterval(triggerCafeChord, 5000);
            } else if (cafeVal <= 0 && state.soundAmbiences.cafeInterval) {
                clearInterval(state.soundAmbiences.cafeInterval);
                state.soundAmbiences.cafeInterval = null;
            }

            if (chimesVal > 0 && !state.soundAmbiences.chimeInterval) {
                triggerChimes();
                state.soundAmbiences.chimeInterval = setInterval(triggerChimes, 3000);
            } else if (chimesVal <= 0 && state.soundAmbiences.chimeInterval) {
                clearInterval(state.soundAmbiences.chimeInterval);
                state.soundAmbiences.chimeInterval = null;
            }
        }
        document.getElementById('slideWind').addEventListener('input', updateAmbiences);
        document.getElementById('slideOcean').addEventListener('input', updateAmbiences);
        document.getElementById('slideCafe').addEventListener('input', updateAmbiences);
        document.getElementById('slideThunder').addEventListener('input', updateAmbiences);
        document.getElementById('slideChimes').addEventListener('input', updateAmbiences);

        function applyZenPreset(type) {
            if (state.hasSynthesizer) { synth.playTone(350, 'sine', 0.1, 0.05); }
            if (type === 'storm') {
                document.getElementById('slideWind').value = 80;
                document.getElementById('slideOcean').value = 30;
                document.getElementById('slideCafe').value = 20;
                document.getElementById('slideThunder').value = 90;
                document.getElementById('slideChimes').value = 40;
            } else if (type === 'sunny') {
                document.getElementById('slideWind').value = 40;
                document.getElementById('slideOcean').value = 10;
                document.getElementById('slideCafe').value = 0;
                document.getElementById('slideThunder').value = 0;
                document.getElementById('slideChimes').value = 80;
            } else if (type === 'cafe') {
                document.getElementById('slideWind').value = 20;
                document.getElementById('slideOcean').value = 0;
                document.getElementById('slideCafe').value = 90;
                document.getElementById('slideThunder').value = 0;
                document.getElementById('slideChimes').value = 30;
            } else if (type === 'meditate') {
                document.getElementById('slideWind').value = 30;
                document.getElementById('slideOcean').value = 50;
                document.getElementById('slideCafe').value = 40;
                document.getElementById('slideThunder').value = 0;
                document.getElementById('slideChimes').value = 95;
            }
            updateAmbiences();
        }

        // =========================================================================
        // MODULE 2: POETIC LINES ARENA (Slightly Suggestive, Witty & Goofy)
        // =========================================================================
        const categoriesLines = {
            sweet: [
                { text: "If memory was a cozy physical book, I'd fold down the corner of every page documenting your smile.", r: "LITERARY CONSTANT" },
                { text: "There's an undeniable main-character frequency in how effortlessly you bring comfort to any room.", r: "AESTHETIC ENERGY" },
                { text: "My affection for you is like a recursive function with no base case... it just keeps going until my brain crashes.", r: "RECURSION HEURISTIC" },
                { text: "You're the soft golden hour my whole week keeps trying to schedule a meeting with.", r: "GOLDEN HOUR" },
                { text: "If kindness was a dialect, you'd be the accent everyone secretly tries to imitate.", r: "MOTHER TONGUE" },
                { text: "Every playlist I make eventually rearranges itself into a love letter addressed to you.", r: "ALGORITHMIC BIAS" },
                { text: "You have the exact energy of a handwritten note tucked inside a library book — quietly devastating.", r: "MARGINALIA" },
                { text: "I keep catching myself smiling like an idiot at nothing, and 'nothing' is always a thought about you.", r: "PASSIVE GLOW" },
                { text: "If softness was a currency, you'd have already bought out the entire emotional economy.", r: "INFLATION RISK" },
                { text: "You're the reason 'comfort' stopped being an adjective and became a person.", r: "PROPER NOUN" }
            ],
            astro: [
                { text: "Are we made of stardust? Because the universe spent 13.8 billion years expanding itself just so we could meet.", r: "UNIVERSAL DESIGN" },
                { text: "Are we a double-slit experiment? Because whenever I look at you, our possibilities collapse into something gorgeous.", r: "QUANTUM ENTANGLEMENT" },
                { text: "Like gravity, your presence is the quiet, unspoken force that keeps my chaotic world in safe orbits.", r: "STELLAR GRAVITY" },
                { text: "If the multiverse exists, I refuse to believe any version of me didn't fall for any version of you.", r: "MULTIVERSAL CONSENSUS" },
                { text: "You bend my spacetime so politely I didn't even notice I'd started orbiting you.", r: "GENERAL RELATIVITY" },
                { text: "Schrödinger left the box open and I checked — you're still the cutest possible outcome.", r: "OBSERVED STATE" },
                { text: "If dark matter is what holds galaxies together, I'm convinced it's just slightly compressed thoughts of you.", r: "DARK MATTER PROOF" },
                { text: "You're the only constant in my equations that I don't want to cancel out.", r: "COSMOLOGICAL CONSTANT" },
                { text: "Even the photons from your eyes take their sweet time arriving — they too like the view.", r: "LIGHT DELAY" },
                { text: "Astronomers keep looking for habitable worlds, but I already found one in the way you exist.", r: "GOLDILOCKS ZONE" }
            ],
            goofy: [
                { text: "If you were a software bug, I would never patch you because you make my life infinitely more interesting.", r: "EXCEPTION ERROR" },
                { text: "I'm not saying you're a magician, but every time you walk into the room, everyone else becomes background noise.", r: "MAGIC NOISE" },
                { text: "If we were variables in Python, I'd be global just so I could be accessed by your local functions.", r: "SCOPE RESOLUTION" },
                { text: "You're 404: Flaws Not Found. The server just shrugs and serves vibes instead.", r: "HTTP MOOD" },
                { text: "I'd marry the typo you'd send me at 2 AM. That's the bar. That's the whole bar.", r: "AUTOCORRECT VOW" },
                { text: "You're like a perfectly toasted slice of bread — statistically improbable, emotionally essential.", r: "BREAKFAST THEORY" },
                { text: "If overthinking burned calories, you'd have a six-pack from how much I think about texting you back coolly.", r: "CARDIO ROUTINE" },
                { text: "I tried to describe you in one word and my brain just buffered for three business days.", r: "LOADING SCREEN" },
                { text: "You're the only person whose 'lol' I trust to be a real, audible laugh.", r: "VERIFIED LOL" },
                { text: "If chaos had a customer service rep, it'd still get owned by your one raised eyebrow.", r: "CUSTOMER SUPPORT" }
            ],
            suggestive: [
                { text: "Are you my favorite blanket? Because I want to stay wrapped up in your cozy vibes for the next business week.", r: "COZY EMBRACE" },
                { text: "Are you a cozy winter fire? Because you are extremely hot and make my winter depression completely evaporate.", r: "THERMAL METRIC" },
                { text: "I must be a CSS overflow bug, because I completely lose my boundaries when you're nearby.", r: "CONTAINER OVERFLOW" },
                { text: "If kissing you was a key binding, I'd remap my entire keyboard just to reach it faster.", r: "HOTKEY CONFIG" },
                { text: "You're the only soft launch I'd commit to in production without a single test case.", r: "DEPLOYMENT RISK" },
                { text: "I don't need a love language — just a quiet room, your hoodie, and approximately zero rules.", r: "SOFT PROTOCOL" },
                { text: "If overthinking was foreplay, our first date would already be in season three.", r: "SLOW BURN" },
                { text: "You smell like the concept of 'home' decided to wear perfume.", r: "OLFACTORY BIAS" },
                { text: "I'd let you reorganize my apartment, my schedule, and my entire moral compass — respectfully.", r: "FULL PERMISSIONS" },
                { text: "Forehead kisses from you should be classified as a controlled substance.", r: "REGULATED IMPORT" }
            ]
        };
        let activeCategory = 'sweet';
        let currentLineIdx = 0;

        function setPickupCategory(cat) {
            if (state.hasSynthesizer) { synth.playTone(390, 'sine', 0.08, 0.04); }
            activeCategory = cat;
            currentLineIdx = 0;
            
            ['sweet', 'astro', 'goofy', 'suggestive'].forEach(c => {
                const b = document.getElementById(`btnCat_${c}`);
                if (c === cat) {
                    b.className = "px-3 py-1.5 bg-purple-200 border-2 border-stone-800 rounded-xl text-xs font-bold text-stone-950 shadow-[1px_1px_0px_0px_#2d2d2d]";
                } else {
                    b.className = "px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-stone-800 rounded-xl text-xs font-bold text-stone-950 shadow-[1px_1px_0px_0px_#2d2d2d]";
                }
            });
            updatePickupDisplay();
        }

        function updatePickupDisplay() {
            const list = categoriesLines[activeCategory];
            const line = list[currentLineIdx];
            document.getElementById('pickupText').innerText = `"${line.text}"`;
            document.getElementById('pickupRarity').innerText = `AURA LEVEL: ${line.r}`;
        }

        function reactToPickup(reaction) {
            if (state.hasSynthesizer) { synth.playTone(550, 'sine', 0.05, 0.04); }
            let points = 5;
            let responseMsg = "Compliment rated!";
            if (reaction === 'RIZZ') { points = 10; responseMsg = "Illegal Rizz recorded!"; }
            if (reaction === 'CINEMA') { points = 15; responseMsg = "Absolute Cinema! Pure masterpiece."; }
            
            earnReward(points, 1, 'pickup');
            triggerAchievement('ach_rizz');
            showCustomToast(reaction, responseMsg, '💖');
            nextPickup();
        }

        function nextPickup() {
            const list = categoriesLines[activeCategory];
            currentLineIdx = (currentLineIdx + 1) % list.length;
            updatePickupDisplay();
        }

        // =========================================================================
        // MODULE 3: COZY CUPCAKE BAKERY (Fleshed Out with Complex Logic & Topping combos)
        // =========================================================================
        function setCupcakeFrosting(color, name) {
            if (state.hasSynthesizer) { synth.playTone(450, 'sine', 0.08, 0.05); }
            state.cupcakeRecipe.frosting = color;
            state.cupcakeRecipe.frostingName = name;
            const core = document.getElementById('ccFrosting');
            core.setAttribute('fill', color);
        }

        function toggleCupcakeTopping(type) {
            if (state.hasSynthesizer) { synth.playTone(490, 'sine', 0.08, 0.05); }
            state.cupcakeRecipe.toppings[type] = !state.cupcakeRecipe.toppings[type];
            
            const checkbox = document.getElementById(`chk_${type}`);
            const button = document.getElementById(`t_${type}`);
            const svgElement = document.getElementById(`cc${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (state.cupcakeRecipe.toppings[type]) {
                if (checkbox) checkbox.checked = true;
                if (button) button.classList.add('border-purple-600', 'bg-purple-50');
                if (svgElement) svgElement.classList.remove('hidden');
            } else {
                if (checkbox) checkbox.checked = false;
                if (button) button.classList.remove('border-purple-600', 'bg-purple-50');
                if (svgElement) svgElement.classList.add('hidden');
            }
        }

        function resetCupcake() {
            if (state.hasSynthesizer) { synth.playTone(300, 'sine', 0.1, 0.05); }
            setCupcakeFrosting('#fbcfe8', 'Pink Strawberry Cream');
            for (let type in state.cupcakeRecipe.toppings) {
                state.cupcakeRecipe.toppings[type] = true; 
                toggleCupcakeTopping(type);
            }
            closePolaroid();
        }

        function tryUnlockMysteryFlavor() {
            const hasParadox = state.achievements.includes('ach_button_10');
            if (hasParadox) {
                setCupcakeFrosting('url(#gradStardust)', 'Sparkling Cosmic Stardust');
                let svg = document.querySelector('svg');
                let defs = svg.querySelector('defs');
                if (!defs) {
                    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                    defs.innerHTML = `
                        <linearGradient id="gradStardust" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                        </linearGradient>
                    `;
                    svg.insertBefore(defs, svg.firstChild);
                }
                setCupcakeFrosting('url(#gradStardust)', 'Sparkling Cosmic Stardust');
            } else {
                showCustomToast('Flavor Sealed', 'Unlock "Paradox Seeker" (Press suspicious button 10 times) to unlock!', '🔒');
            }
        }

        function finalizeCupcake() {
            if (state.hasSynthesizer) { synth.playLevelUp(); }
            triggerAchievement('ach_cupcake');
            earnReward(40, 3, 'cupcake');

            const activeToppingsList = [];
            for (let t in state.cupcakeRecipe.toppings) {
                if (state.cupcakeRecipe.toppings[t]) { activeToppingsList.push(t); }
            }

            let title = "A Marvel of Patisserie Science";
            let description = `This beautiful cupcake is crafted with a base of ${state.cupcakeRecipe.frostingName}. `;
            
            // Complex topping combinations check
            if (state.cupcakeRecipe.toppings.crown && state.cupcakeRecipe.toppings.blueberries) {
                title = "The Sovereign Blueberry Dynasty";
                description += "A magnificent alignment! The combination of the Sovereign Crown and Blueberries represents absolute culinary royalty. The blueberries form a moat of sweet defense under a golden peak.";
            } else if (state.cupcakeRecipe.toppings.cherry && state.cupcakeRecipe.toppings.candle) {
                title = "Flickering Cherry Beacon";
                description += "Evaluating the parameters... Placing a hot glowing Candle alongside a juicy Red Cherry creates a romantic, festive atmosphere that lights up the entire patisserie.";
            } else if (state.cupcakeRecipe.toppings.drizzle && state.cupcakeRecipe.toppings.cookieCrumbles) {
                title = "Aggressive Cocoa Storm";
                description += "Warning! The heavy cocoa drizzle combined with crunchy cookie crumbles forms a rich, dark mudslide of pure delight. Not recommended for those afraid of chocolate overload.";
            } else if (state.cupcakeRecipe.toppings.freshMint && state.cupcakeRecipe.toppings.magicStardust) {
                title = "Ethereal Herbal Sanctuary";
                description += "A delightful contrast of organic and magical. The fresh mint leaf combined with sparkling stardust creates a refreshing minty wind that clears visual congestion.";
            } else if (activeToppingsList.length === 0) {
                title = "Pure Minimalist Canvas";
                description += "Presented elegantly without toppings, it emphasizes clean layout parameters, perfect geometry, and absolute raw cream texture.";
            } else if (activeToppingsList.length >= 6) {
                title = "The Chaotic Overlord";
                description += `A structural hazard! Stacking ${activeToppingsList.length} different toppings onto one pastry creates an absolute explosion of flavor vectors. Extremely rich, beautiful, and slightly unhinged.`;
            } else {
                title = "Beautifully Coexisting Pastry";
                description += "Featuring a smart balance of selected toppings. Our gourmet judges agree this layout indicates deep, comforting patisserie expertise.";
            }

            document.getElementById('critiqueTitle').innerText = `"${title}"`;
            document.getElementById('critiqueDescription').innerText = description;
            
            const card = document.getElementById('polaroidReviewCard');
            card.classList.remove('hidden');
            card.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { try { playLeahVoiceLine(); } catch(e){} }, 450);
        }

        function closePolaroid() { document.getElementById('polaroidReviewCard').classList.add('hidden'); }

        function playLeahVoiceLine() {
            const a = document.getElementById('leahVoiceLine');
            if (!a) return;
            try { a.currentTime = 0; a.play().catch(() => showCustomToast('Tap again', 'Browser blocked autoplay — tap once more 💕', '🔊')); } catch (e) {}
        }

        function copyCupcakeReview() {
            const title = document.getElementById('critiqueTitle').innerText;
            const desc = document.getElementById('critiqueDescription').innerText;
            const textToCopy = `Review: ${title}\n${desc}\nMade in Leah's Birthday Bakery 🧁`;
            
            const el = document.createElement('textarea');
            el.value = textToCopy;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            showCustomToast('Review Copied', 'Gourmet description copied to clipboard!', '📋');
        }

        // =========================================================================
        // MODULE 4: EYE CONTACT WITH YOUR FAV (COZY ART STYLE IRIS SHADING)
        // =========================================================================
        let gojoCanvas, gojoCtx;
        let gojoTime = 0;
        let isStaring = false;
        let gojoInterval = null;
        let cursorX = 150, cursorY = 80;
        let gojoParticles = []; 
        let gojoGameActive = false;
        let eyeStyle = 'espresso';

        function changeEyePalette() {
            if (state.hasSynthesizer) { synth.playTone(390, 'sine', 0.05, 0.04); }
            eyeStyle = document.getElementById('eyePaletteSelector').value;
        }

        function expressEyeReaction() {
            if (state.hasSynthesizer) { synth.playTone(600, 'triangle', 0.15, 0.05); }
            showCustomToast('Wink Expressed', 'The hand-drawn eyes blink warmly, emitting little stars!', '😉');
            earnReward(5, 1, 'stare');
        }

        function initGojoGame() {
            gojoCanvas = document.getElementById('gojoCanvas');
            gojoCtx = gojoCanvas.getContext('2d');
            gojoCanvas.width = gojoCanvas.offsetWidth;
            gojoCanvas.height = 192;
            
            gojoGameActive = true;
            gojoParticles = [];
            cursorX = gojoCanvas.width / 2;
            cursorY = gojoCanvas.height / 2;

            gojoCanvas.onmousemove = (e) => {
                const rect = gojoCanvas.getBoundingClientRect();
                cursorX = e.clientX - rect.left;
                cursorY = e.clientY - rect.top;
            };
            gojoCanvas.ontouchmove = (e) => {
                const rect = gojoCanvas.getBoundingClientRect();
                cursorX = e.touches[0].clientX - rect.left;
                cursorY = e.touches[0].clientY - rect.top;
            };

            for (let i = 0; i < 4; i++) { spawnGojoDistraction(); }

            const btn = document.getElementById('btnGojoStare');
            btn.onmousedown = startStaring;
            btn.onmouseup = stopStaring;
            btn.onmouseleave = stopStaring;
            btn.ontouchstart = (e) => { e.preventDefault(); startStaring(); };
            btn.ontouchend = (e) => { e.preventDefault(); stopStaring(); };

            runGojoFrame();
        }

        function spawnGojoDistraction() {
            gojoParticles.push({
                x: Math.random() * gojoCanvas.width,
                y: Math.random() * gojoCanvas.height,
                radius: Math.random() * 12 + 10,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                text: ['Doubt', 'Chores', 'Stress', 'Clouds', 'Noises'][Math.floor(Math.random() * 5)]
            });
        }

        function startStaring() {
            if (isStaring) return;
            isStaring = true;
            gojoInterval = setInterval(() => {
                gojoTime += 0.05;
                document.getElementById('gojoTimeVal').innerText = `${gojoTime.toFixed(2)}s`;
                const progress = Math.min((gojoTime / 5) * 100, 100);
                document.getElementById('gojoTimerBar').style.width = `${progress}%`;
                
                if (Math.round(gojoTime * 10) % 5 === 0 && state.hasSynthesizer) {
                    synth.playTone(280 + gojoTime * 20, 'sine', 0.1, 0.03);
                }
                if (gojoTime >= 5) {
                    triggerAchievement('ach_stare');
                    earnReward(10, 1, 'stare');
                }
            }, 50);
        }

        function stopStaring() {
            if (!isStaring) return;
            isStaring = false;
            clearInterval(gojoInterval);
            gojoTime = 0;
            document.getElementById('gojoTimerBar').style.width = '0%';
            document.getElementById('gojoTimeVal').innerText = `0.00s`;
        }

        function runGojoFrame() {
            if (!gojoGameActive || document.getElementById('modalGojo').classList.contains('hidden')) {
                gojoGameActive = false;
                return;
            }

            gojoCtx.fillStyle = '#1e293b'; 
            gojoCtx.fillRect(0, 0, gojoCanvas.width, gojoCanvas.height);

            const w = gojoCanvas.width;
            const h = gojoCanvas.height;

            drawSingleBrownEye(w * 0.3, h * 0.5);
            drawSingleBrownEye(w * 0.7, h * 0.5);

            if (isStaring) {
                gojoCtx.fillStyle = '#fde047'; 
                gojoCtx.font = '14px Patrick Hand';
                gojoCtx.textAlign = 'center';
                gojoCtx.fillText("Expressing absolute fascination... 🤎", w / 2, h - 20);
            }

            gojoParticles.forEach((p, idx) => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0 || p.x > w) p.speedX *= -1;
                if (p.y < 0 || p.y > h) p.speedY *= -1;

                gojoCtx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                gojoCtx.beginPath();
                gojoCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                gojoCtx.fill();
                gojoCtx.strokeStyle = '#ef4444';
                gojoCtx.lineWidth = 1.5;
                gojoCtx.stroke();

                gojoCtx.fillStyle = '#ffffff';
                gojoCtx.font = '12px Patrick Hand';
                gojoCtx.textAlign = 'center';
                gojoCtx.fillText(p.text, p.x, p.y + 4);

                const distToCursor = Math.hypot(p.x - cursorX, p.y - cursorY);
                if (distToCursor < p.radius + 5) {
                    gojoParticles.splice(idx, 1);
                    if (state.hasSynthesizer) { synth.playTone(700, 'sine', 0.05, 0.03); }
                    spawnGojoDistraction();
                    earnReward(4, 1, 'stare');
                }
            });

            requestAnimationFrame(runGojoFrame);
        }

        function drawSingleBrownEye(cx, cy) {
            gojoCtx.fillStyle = '#f8fafc';
            gojoCtx.beginPath();
            gojoCtx.ellipse(cx, cy, 38, 19, 0, 0, Math.PI * 2);
            gojoCtx.fill();
            gojoCtx.strokeStyle = '#475569'; 
            gojoCtx.lineWidth = 3;
            gojoCtx.stroke();

            const dx = cursorX - cx;
            const dy = cursorY - cy;
            const dist = Math.hypot(dx, dy);
            const maxTrack = 10;
            const trackX = dist > 0 ? (dx / dist) * Math.min(dist, maxTrack) : 0;
            const trackY = dist > 0 ? (dy / dist) * Math.min(dist, maxTrack) : 0;

            const pulse = isStaring ? 4 + Math.sin(Date.now() * 0.015) * 3 : 0;
            let grad = gojoCtx.createRadialGradient(cx + trackX, cy + trackY, 2, cx + trackX, cy + trackY, 16 + pulse);
            
            if (eyeStyle === 'espresso') {
                grad.addColorStop(0, '#fef08a'); 
                grad.addColorStop(0.35, '#78350f'); 
                grad.addColorStop(0.85, '#451a03'); 
            } else if (eyeStyle === 'starry') {
                grad.addColorStop(0, '#fde047');
                grad.addColorStop(0.4, '#ca8a04');
                grad.addColorStop(0.85, '#854d0e');
            } else if (eyeStyle === 'electric') {
                grad.addColorStop(0, '#67e8f9');
                grad.addColorStop(0.4, '#06b6d4');
                grad.addColorStop(0.85, '#0891b2');
            }
            grad.addColorStop(1, 'transparent');

            gojoCtx.fillStyle = grad;
            gojoCtx.beginPath();
            gojoCtx.arc(cx + trackX, cy + trackY, 18, 0, Math.PI * 2);
            gojoCtx.fill();

            gojoCtx.strokeStyle = '#27272a';
            gojoCtx.lineWidth = 1.5;
            gojoCtx.stroke();

            const pupilSize = isStaring ? 9 : 6;
            gojoCtx.fillStyle = '#1e293b';
            gojoCtx.beginPath();
            gojoCtx.arc(cx + trackX, cy + trackY, pupilSize, 0, Math.PI * 2);
            gojoCtx.fill();

            gojoCtx.fillStyle = '#ffffff';
            gojoCtx.beginPath();
            gojoCtx.arc(cx + trackX - 4, cy + trackY - 4, 3.5, 0, Math.PI * 2);
            gojoCtx.arc(cx + trackX + 5, cy + trackY + 4, 1.8, 0, Math.PI * 2);
            gojoCtx.fill();
        }

        // =========================================================================
        // MODULE 5: COMPLIMENT SLOT MACHINE
        // =========================================================================
        const slotRolls = [
            ["Leah's smile", "Her kind presence", "The cosmic focus", "Quiet stargazing", "A comfy laugh", "Her direct energy", "The atomic alignment", "A clever critique", "A cozy kitchen wave", "Her absolute aura", "Her sleepy yawn", "Leah's playlist", "A 2am voicenote", "Her hoodie hugs", "That tilted head smirk", "Leah's handwriting", "Her midnight rant", "Her caffeine arc", "A single Leah giggle", "Her shower-thought theorem"],
            ["spontaneously clears", "comfortably brightens", "instantly orbits", "restructures the local", "perfectly aligns", "beautifully matches", "naturally establishes", "effortlessly stabilizes", "decisively guides", "pleasantly warms", "quietly rewires", "tenderly softens", "casually outshines", "lovingly redecorates", "secretly fuels", "magnetically pulls", "delicately untangles", "absurdly improves", "ridiculously beautifies", "criminally upgrades"],
            ["any storm vector.", "every busy room.", "all chaotic thoughts.", "into happy records.", "with gentle light.", "with cozy velvet layers.", "the surrounding galaxy.", "the complete matrix.", "our quantum entanglement.", "beyond stellar limits.", "the entire timeline.", "Ishaan's whole week.", "the laws of vibes.", "every Monday morning.", "this dumb little planet.", "the airport queue.", "the group chat.", "the spotify algorithm.", "my serotonin levels.", "the concept of bedtime."]
        ];
        let slotRolling = false;

        function pullSlotLever() {
            if (slotRolling) return;
            slotRolling = true;
            if (state.hasSynthesizer) { synth.playTone(180, 'triangle', 0.4, 0.1); }

            let steps = 0;
            const interval = setInterval(() => {
                steps++;
                const r1 = slotRolls[0][Math.floor(Math.random() * slotRolls[0].length)];
                const r2 = slotRolls[1][Math.floor(Math.random() * slotRolls[1].length)];
                const r3 = slotRolls[2][Math.floor(Math.random() * slotRolls[2].length)];

                document.getElementById('slotWheel1').innerText = r1;
                document.getElementById('slotWheel2').innerText = r2;
                document.getElementById('slotWheel3').innerText = r3;
                if (state.hasSynthesizer) { synth.playTone(550, 'sine', 0.05, 0.02); }

                if (steps >= 15) {
                    clearInterval(interval);
                    slotRolling = false;
                    const tierEl = document.getElementById('slotTierText');

                    if (r1 === "Leah's smile" && r2 === "comfortably brightens" && r3 === "every busy room.") {
                        tierEl.innerText = `Tier: SPECIAL AURA JACKPOT!`;
                        tierEl.className = `text-xs font-bold uppercase tracking-wide bg-yellow-100 border-2 border-yellow-500 px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#2d2d2d] animate-bounce`;
                        earnReward(100, 10, 'slots');
                        if (state.hasSynthesizer) { synth.playLevelUp(); }
                    } else if (r1 === "Her absolute aura" && r2 === "perfectly aligns" && r3 === "the complete matrix.") {
                        tierEl.innerText = `Tier: ✨ STELLAR ALIGNMENT ✨`;
                        tierEl.className = `text-xs font-bold uppercase tracking-wide bg-purple-100 border-2 border-purple-600 text-purple-800 px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#2d2d2d] animate-bounce`;
                        earnReward(150, 15, 'slots');
                        if (state.hasSynthesizer) { synth.playLevelUp(); }
                        showCustomToast("STELLAR ALIGNMENT", "I'm the Gift you ungrateful idiot 🎁", '💢');
                        setTimeout(() => {
                            showCustomToast("...okay okay", "jk text me and receive your grant 💌", '😘');
                        }, 3200);
                    } else {
                        const tiers = ["COMMON", "RARE", "MYTHIC", "GOLDEN COZY CONSTANT"];
                        const tierColors = ["text-stone-500", "text-blue-600 font-bold", "text-purple-600 font-extrabold", "text-yellow-600 font-black animate-pulse"];
                        const rollIdx = Math.floor(Math.random() * tiers.length);

                        tierEl.innerText = `Tier: ${tiers[rollIdx]} ASSEMBLED`;
                        tierEl.className = `text-xs font-bold uppercase tracking-wide bg-white border border-stone-300 px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#2d2d2d] ${tierColors[rollIdx]}`;

                        triggerAchievement('ach_slot');
                        earnReward(30, 2, 'slots');
                    }
                }
            }, 80);
        }

        // =========================================================================
        // MODULE 6: RETRO SHIELD ARCADE (Doodle Blueprint Grid)
        // =========================================================================
        let bossCanvas, bossCtx;
        let playerX = 150;
        let bossHP = 100;
        let bossScore = 0;
        let bossProjectiles = []; 
        let sparklesPool = [];    
        let shieldMissiles = [];  
        let activeShipSkin = 'cyber';

        function changeShipSkin() {
            activeShipSkin = document.getElementById('shipSkinSelector').value;
            if (state.hasSynthesizer) { synth.playTone(400, 'sine', 0.05, 0.03); }
        }

        function startBossGame() {
            bossCanvas = document.getElementById('bossCanvas');
            bossCtx = bossCanvas.getContext('2d');
            bossCanvas.width = bossCanvas.offsetWidth;
            bossCanvas.height = 256;
            
            state.bossGameActive = true;
            bossHP = 100;
            bossScore = 0;
            bossProjectiles = [];
            sparklesPool = [];
            shieldMissiles = [];
            
            document.getElementById('bossHPVal').innerText = `${bossHP}%`;
            document.getElementById('bossScoreVal').innerText = bossScore;

            bossCanvas.onmousedown = () => {
                shieldMissiles.push({ x: playerX, y: bossCanvas.height - 40, s: 4 });
                if (state.hasSynthesizer) { synth.playTone(600, 'sine', 0.08, 0.04); }
            };

            bossCanvas.onmousemove = (e) => {
                const rect = bossCanvas.getBoundingClientRect();
                playerX = e.clientX - rect.left;
            };
            bossCanvas.ontouchmove = (e) => {
                const rect = bossCanvas.getBoundingClientRect();
                playerX = e.touches[0].clientX - rect.left;
            };

            runBossFrame();
        }

        function runBossFrame() {
            if (!state.bossGameActive || document.getElementById('modalBoss').classList.contains('hidden')) {
                state.bossGameActive = false;
                return;
            }

            bossCtx.fillStyle = '#0f172a'; 
            bossCtx.fillRect(0, 0, bossCanvas.width, bossCanvas.height);

            // Draw grid guidelines
            bossCtx.strokeStyle = 'rgba(147, 197, 253, 0.07)';
            bossCtx.lineWidth = 1;
            for (let i = 0; i < bossCanvas.width; i += 20) {
                bossCtx.beginPath(); bossCtx.moveTo(i, 0); bossCtx.lineTo(i, bossCanvas.height); bossCtx.stroke();
            }

            // Draw player ship skin
            if (activeShipSkin === 'choco') { bossCtx.fillStyle = '#78350f'; } 
            else if (activeShipSkin === 'berry') { bossCtx.fillStyle = '#ec4899'; } 
            else { bossCtx.fillStyle = '#38bdf8'; }

            // Hand-sketched rocket drawing
            bossCtx.beginPath();
            bossCtx.moveTo(playerX, bossCanvas.height - 38);
            bossCtx.lineTo(playerX - 12, bossCanvas.height - 18);
            bossCtx.lineTo(playerX + 12, bossCanvas.height - 18);
            bossCtx.closePath();
            bossCtx.fill();
            bossCtx.strokeStyle = '#ffffff';
            bossCtx.lineWidth = 2;
            bossCtx.stroke();

            // Automatic missiles
            if (Math.random() < 0.02) {
                shieldMissiles.push({ x: playerX, y: bossCanvas.height - 40, s: 4 });
            }

            shieldMissiles.forEach((m, mIdx) => {
                m.y -= m.s;
                bossCtx.fillStyle = '#fde047';
                bossCtx.fillRect(m.x - 2, m.y - 6, 4, 12);

                bossProjectiles.forEach((p, pIdx) => {
                    if (Math.hypot(p.x - m.x, p.y - m.y) < 15) {
                        bossProjectiles.splice(pIdx, 1);
                        shieldMissiles.splice(mIdx, 1);
                        if (state.hasSynthesizer) { synth.playTone(200, 'sawtooth', 0.1, 0.03); }
                    }
                });
            });

            if (Math.random() < 0.03) {
                bossProjectiles.push({ x: Math.random() * bossCanvas.width, y: 0, s: Math.random() * 1.5 + 1.2 });
            }
            if (Math.random() < 0.04) {
                sparklesPool.push({ x: Math.random() * bossCanvas.width, y: 0, s: Math.random() * 1.5 + 1.0 });
            }

            // Draw obstacles
            bossProjectiles.forEach((p, idx) => {
                p.y += p.s;
                bossCtx.fillStyle = '#64748b'; 
                bossCtx.fillRect(p.x - 7, p.y - 7, 14, 14);

                if (p.y > bossCanvas.height - 38 && p.y < bossCanvas.height - 15 && Math.abs(p.x - playerX) < 18) {
                    bossProjectiles.splice(idx, 1);
                    bossHP -= 20;
                    if (state.hasSynthesizer) { synth.playTone(130, 'sawtooth', 0.2, 0.06); }

                    if (bossHP <= 0) {
                        if (state.bossHasSecondChance) {
                            state.bossHasSecondChance = false;
                            bossHP = 100;
                            showCustomToast('Love Shield Active! 💖', 'The stars refuse to let your ship fall! Free revival enabled.', '✨');
                            if (state.hasSynthesizer) { synth.playLevelUp(); }
                            triggerAchievement('ach_second_chance');
                        } else {
                            bossHP = 0;
                            state.bossGameActive = false;
                            showCustomToast('Shield Offline', 'Restart the game coordinates!', '👾');
                        }
                    }
                    document.getElementById('bossHPVal').innerText = `${bossHP}%`;
                }
            });

            bossProjectiles = bossProjectiles.filter(p => p.y <= bossCanvas.height + 10);

            // Draw gold stars (sketched cross coordinates)
            sparklesPool.forEach((s, idx) => {
                s.y += s.s;
                bossCtx.fillStyle = '#facc15'; 
                
                // Draw hand sketched cross sparkle
                bossCtx.beginPath();
                bossCtx.arc(s.x, s.y, 6, 0, Math.PI * 2);
                bossCtx.fill();

                if (s.y > bossCanvas.height - 38 && s.y < bossCanvas.height - 15 && Math.abs(s.x - playerX) < 18) {
                    sparklesPool.splice(idx, 1);
                    bossScore += 1;
                    if (state.hasSynthesizer) { synth.playTone(780, 'sine', 0.05, 0.05); }
                    earnReward(3, 1, 'starshield');

                    if (bossScore >= 15) { triggerAchievement('ach_boss_win'); }
                    document.getElementById('bossScoreVal').innerText = bossScore;
                }
            });

            sparklesPool = sparklesPool.filter(s => s.y <= bossCanvas.height + 10);
            requestAnimationFrame(runBossFrame);
        }

        // =========================================================================
        // MODULE 7: THE SUSPICIOUS RED BUTTON (14+ HIGH COGNITIVE CHAOS MILESTONES)
        // =========================================================================
        function pressRedButton() {
            state.redButtonClicks++;
            
            if (state.redButtonClicks >= 1000) {
                state.redButtonClicks = 0;
                document.getElementById('redClicksVal').innerText = `0 PARADOX CLICKS`;

                // Fully revert the site to normal — no curses
                document.body.style.transform = "none";
                document.body.style.filter = "none";
                document.body.style.backgroundColor = "";
                document.body.classList.remove('chaotic-shake', 'zoom-pulse');
                document.documentElement.classList.remove('invert');
                document.body.style.fontFamily = "'Patrick Hand', cursive";
                bgStars.forEach(s => { if (s.baseSpeed) s.speed = s.baseSpeed; });

                document.getElementById('theActualRedButton').className = "w-28 h-28 rounded-full bg-red-500 border-4 border-stone-800 hover:bg-red-400 active:scale-90 transition-all flex items-center justify-center text-white text-4xl shadow-[4px_4px_0px_0px_#2d2d2d] select-none";
                document.getElementById('redStatusText').innerText = "Reality restored. Clicks reset. 💞";

                showLoveYouPage();
                if (state.hasSynthesizer) { synth.playLevelUp(); }
                return;
            }

            document.getElementById('redClicksVal').innerText = `${state.redButtonClicks} PARADOX CLICKS`;
            const status = document.getElementById('redStatusText');
            if (state.hasSynthesizer) { synth.playTone(120 + state.redButtonClicks * 3, 'triangle', 0.18, 0.06); }

            // 14 distinct structural chaos milestones
            if (state.redButtonClicks === 1) { status.innerText = "A tiny ripple sweeps the scrapbook page."; } 
            else if (state.redButtonClicks === 5) {
                status.innerText = "Layout tilts slightly clockwise.";
                document.body.style.transform = "rotate(0.5deg)";
            } else if (state.redButtonClicks === 10) {
                status.innerText = "Cosmic Stardust cupcake flavor unlocked! Check your bakery!";
                triggerAchievement('ach_button_10');
            } else if (state.redButtonClicks === 15) {
                status.innerText = "Background twinks velocity increased by 300%!";
                bgStars.forEach(s => s.speed *= 3);
            } else if (state.redButtonClicks === 20) {
                status.innerText = "Warning: Visual coordinates are beginning to vibrate.";
                document.body.classList.add('chaotic-shake');
            } else if (state.redButtonClicks === 30) {
                status.innerText = "Fonts are mutating to Architects Daughter blueprint style!";
                document.body.style.fontFamily = "'Architects Daughter', cursive";
            } else if (state.redButtonClicks === 40) {
                status.innerText = "A soft pink wave washes over the notebook backdrop.";
                document.body.style.backgroundColor = "#fff1f2";
            } else if (state.redButtonClicks === 50) {
                status.innerText = "Inversion of color spectra initiated! Reality is flipped.";
                document.documentElement.classList.add('invert');
                triggerAchievement('ach_button_50');
            } else if (state.redButtonClicks === 75) {
                status.innerText = "The entire scrapbook begins to pulse like a heartbeat.";
                document.body.classList.add('zoom-pulse');
            } else if (state.redButtonClicks === 100) {
                status.innerText = "Extreme layout blur parameters applied.";
                document.body.style.filter = "contrast(140%) saturate(150%) hue-rotate(30deg) blur(0.4px)";
            } else if (state.redButtonClicks === 130) {
                status.innerText = "Page coordinates tilting further counter-clockwise!";
                document.body.style.transform = "rotate(-3deg) scale(0.97)";
            } else if (state.redButtonClicks === 160) {
                status.innerText = "Scribble textures are warping wildly! High frequency energy!";
                document.body.style.filter = "blur(0.8px) invert(0.8) hue-rotate(90deg)";
            } else if (state.redButtonClicks === 200) {
                status.innerText = "The chaos has plateaued. Keep going — something tender lives at 1000.";
            } else if (state.redButtonClicks === 500) {
                status.innerText = "Halfway. The universe is humming a love song under its breath.";
            } else if (state.redButtonClicks === 900) {
                status.innerText = "100 clicks left. The curse is lifting…";
            } else if (state.redButtonClicks === 990) {
                status.innerText = "10 more. Close your eyes a little.";
            }
        }

        function showLoveYouPage() {
            // remove any existing
            const existing = document.getElementById('loveYouOverlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'loveYouOverlay';
            overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:radial-gradient(circle at 50% 40%, #fff1f5 0%, #ffe4ec 45%, #fbcfe8 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:'Patrick Hand', cursive;animation:loveFadeIn 0.8s ease-out;overflow:hidden;";
            overlay.innerHTML = `
                <style>
                    @keyframes loveFadeIn { from { opacity:0; transform:scale(1.04); } to { opacity:1; transform:scale(1); } }
                    @keyframes loveHeartFloat { 0% { transform: translateY(100vh) scale(0.6); opacity:0; } 10% { opacity:1; } 100% { transform: translateY(-20vh) scale(1.1); opacity:0; } }
                    @keyframes loveBeat { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
                    .love-heart { position:absolute; font-size:28px; animation: loveHeartFloat 7s linear infinite; }
                </style>
                <div style="position:absolute;inset:0;pointer-events:none;" id="loveHearts"></div>
                <div style="text-align:center;padding:40px;max-width:640px;position:relative;z-index:2;">
                    <div style="font-size:96px;animation:loveBeat 1.4s ease-in-out infinite;">💖</div>
                    <h1 style="font-family:'Caveat', 'Patrick Hand', cursive; font-size:84px; color:#be185d; margin:12px 0 8px; line-height:1;">I love you, Leah.</h1>
                    <p style="font-size:22px;color:#9d174d;margin:0 0 8px;">— Ishaan 💌</p>
                    <p style="font-size:18px;color:#831843;margin:18px auto;max-width:480px;line-height:1.5;">No curses. No glitches. Just this little page, quietly telling you the truth: every version of you, on every day, is my favourite. 🌸</p>
                    <button onclick="closeLoveYouPage()" style="margin-top:24px;padding:12px 28px;background:#fff;border:3px solid #831843;border-radius:14px;font-family:inherit;font-size:18px;font-weight:bold;color:#831843;cursor:pointer;box-shadow:4px 4px 0 #831843;">back to the scrapbook 💞</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const heartsLayer = overlay.querySelector('#loveHearts');
            const emojis = ['💖','💗','💞','💕','🌸','✨','💌'];
            for (let i = 0; i < 24; i++) {
                const h = document.createElement('div');
                h.className = 'love-heart';
                h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                h.style.left = Math.random() * 100 + 'vw';
                h.style.animationDelay = (Math.random() * 7) + 's';
                h.style.animationDuration = (5 + Math.random() * 5) + 's';
                h.style.fontSize = (18 + Math.random() * 26) + 'px';
                heartsLayer.appendChild(h);
            }
        }

        function closeLoveYouPage() {
            const ov = document.getElementById('loveYouOverlay');
            if (ov) ov.remove();
        }
        window.closeLoveYouPage = closeLoveYouPage;

        // =========================================================================
        // MODULE 8: CAKE PROTECTION GRID
        // =========================================================================
        let cakeCanvas, cakeCtx;
        let cakeHP = 100;
        let cakeScore = 0;
        let cakeEnemies = [];
        let cakeInterval = null;
        let securityCash = 0;
        let automaticLighter = false;
        let confettiMines = [];

        function buyCakeUpgrade(type) {
            if (type === 'laser' && securityCash >= 20) {
                securityCash -= 20;
                automaticLighter = true;
                if (state.hasSynthesizer) { synth.playLevelUp(); }
                showCustomToast('Upgrade Installed', 'Automatic laser is zapping crawling bugs!', '⚡');
            } else if (type === 'mine' && securityCash >= 15) {
                securityCash -= 15;
                confettiMines.push({ x: Math.random() * cakeCanvas.width, y: Math.random() * cakeCanvas.height, r: 15 });
                if (state.hasSynthesizer) { synth.playTone(450, 'sine', 0.1, 0.05); }
                showCustomToast('Mine Set', 'Confetti popcorn mine planted on targets!', '💥');
            } else {
                showCustomToast('Insufficient Funds', 'Defeat ant crawlers to accumulate secure funds.', '❌');
            }
            document.getElementById('securityFunds').innerText = `${securityCash} Funds`;
        }

        function initCakeDefense() {
            cakeCanvas = document.getElementById('cakeCanvas');
            cakeCtx = cakeCanvas.getContext('2d');
            cakeCanvas.width = cakeCanvas.offsetWidth;
            cakeCanvas.height = 256;
            
            state.cakeGameActive = true;
            cakeHP = 100;
            cakeScore = 0;
            cakeEnemies = [];
            confettiMines = [];
            automaticLighter = false;
            securityCash = 0;

            document.getElementById('cakeScore').innerText = cakeScore;
            document.getElementById('cakeHP').innerText = `${cakeHP}%`;
            document.getElementById('securityFunds').innerText = `${securityCash} Funds`;

            cakeCanvas.onmousedown = (e) => {
                const rect = cakeCanvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                cakeEnemies.forEach((bug, idx) => {
                    const dist = Math.hypot(bug.x - clickX, bug.y - clickY);
                    if (dist < 22) {
                        cakeEnemies.splice(idx, 1);
                        cakeScore += 5;
                        securityCash += 5;
                        if (state.hasSynthesizer) { synth.playTone(650, 'sine', 0.04, 0.03); }
                        earnReward(3, 1, 'cakedefense');

                        if (cakeScore >= 40) { triggerAchievement('ach_cake_win'); }
                    }
                });
            };

            if (cakeInterval) clearInterval(cakeInterval);
            cakeInterval = setInterval(() => {
                if (!state.cakeGameActive || document.getElementById('modalCakeDefense').classList.contains('hidden')) return;
                cakeEnemies.push({
                    x: Math.random() < 0.5 ? 0 : cakeCanvas.width,
                    y: Math.random() * (cakeCanvas.height - 60) + 30,
                    speed: Math.random() * 0.4 + 0.3 
                });
            }, 2000);

            runCakeDefenseFrame();
        }

        function runCakeDefenseFrame() {
            if (!state.cakeGameActive || document.getElementById('modalCakeDefense').classList.contains('hidden')) {
                state.cakeGameActive = false;
                return;
            }

            cakeCtx.fillStyle = '#0f172a';
            cakeCtx.fillRect(0, 0, cakeCanvas.width, cakeCanvas.height);

            const cx = cakeCanvas.width / 2;
            const cy = cakeCanvas.height / 2;

            // Draw hand sketched tier cake
            cakeCtx.fillStyle = '#fbcfe8';
            cakeCtx.beginPath();
            cakeCtx.arc(cx, cy, 32, 0, Math.PI * 2);
            cakeCtx.fill();
            cakeCtx.strokeStyle = '#db2777';
            cakeCtx.lineWidth = 3.5;
            cakeCtx.stroke();

            // Draw candle
            cakeCtx.fillStyle = '#38bdf8';
            cakeCtx.fillRect(cx - 2, cy - 18, 4, 12);
            cakeCtx.fillStyle = '#f97316';
            cakeCtx.beginPath();
            cakeCtx.arc(cx, cy - 22, 3.5, 0, Math.PI * 2);
            cakeCtx.fill();

            confettiMines.forEach((mine, mIdx) => {
                cakeCtx.fillStyle = '#ef4444';
                cakeCtx.beginPath();
                cakeCtx.arc(mine.x, mine.y, 6, 0, Math.PI * 2);
                cakeCtx.fill();

                cakeEnemies.forEach((bug, bIdx) => {
                    if (Math.hypot(bug.x - mine.x, bug.y - mine.y) < mine.r) {
                        cakeEnemies.splice(bIdx, 1);
                        confettiMines.splice(mIdx, 1);
                        if (state.hasSynthesizer) { synth.playTone(300, 'triangle', 0.2, 0.05); }
                        cakeScore += 10;
                    }
                });
            });

            if (automaticLighter && cakeEnemies.length > 0) {
                if (Math.random() < 0.03) {
                    const target = cakeEnemies[0];
                    cakeCtx.strokeStyle = '#38bdf8';
                    cakeCtx.lineWidth = 2;
                    cakeCtx.beginPath();
                    cakeCtx.moveTo(cx, cy - 22);
                    cakeCtx.lineTo(target.x, target.y);
                    cakeCtx.stroke();

                    cakeEnemies.splice(0, 1);
                    cakeScore += 5;
                    if (state.hasSynthesizer) { synth.playTone(800, 'sine', 0.05, 0.02); }
                }
            }

            // Draw doodle ant bugs with sketchy crawling lines
            cakeEnemies.forEach((bug, idx) => {
                const dx = cx - bug.x;
                const dy = cy - bug.y;
                const dist = Math.hypot(dx, dy);

                bug.x += (dx / dist) * bug.speed;
                bug.y += (dy / dist) * bug.speed;

                // Doodle bug body
                cakeCtx.fillStyle = '#ffffff';
                cakeCtx.fillRect(bug.x - 8, bug.y - 10, 16, 20);
                cakeCtx.strokeStyle = '#475569';
                cakeCtx.lineWidth = 2;
                cakeCtx.strokeRect(bug.x - 8, bug.y - 10, 16, 20);

                // Sketchy legs
                cakeCtx.strokeStyle = '#f87171';
                cakeCtx.beginPath();
                cakeCtx.moveTo(bug.x - 12, bug.y - 4);
                cakeCtx.lineTo(bug.x + 12, bug.y + 4);
                cakeCtx.moveTo(bug.x - 12, bug.y + 4);
                cakeCtx.lineTo(bug.x + 12, bug.y - 4);
                cakeCtx.stroke();

                if (dist < 36) {
                    cakeEnemies.splice(idx, 1);
                    cakeHP -= 20;
                    if (state.hasSynthesizer) { synth.playTone(110, 'sawtooth', 0.25, 0.05); }

                    if (cakeHP <= 0) {
                        if (state.cakeHasSecondChance) {
                            state.cakeHasSecondChance = false;
                            cakeHP = 100;
                            showCustomToast('Cake Shield Activated! 🧁', 'Magical barriers rebuilt the layers instantly!', '✨');
                            if (state.hasSynthesizer) { synth.playLevelUp(); }
                            triggerAchievement('ach_second_chance');
                        } else {
                            cakeHP = 0;
                            state.cakeGameActive = false;
                            showCustomToast('Cake Compromised', 'Wanderers reached the bakery!', '🍰');
                        }
                    }
                    document.getElementById('cakeHP').innerText = `${cakeHP}%`;
                }
            });

            document.getElementById('cakeScore').innerText = cakeScore;
            document.getElementById('securityFunds').innerText = `${securityCash} Funds`;
            requestAnimationFrame(runCakeDefenseFrame);
        }

        // =========================================================================
        // MODULE 9: CONSTELLATION SKETCHER
        // =========================================================================
        let constCanvas, constCtx;
        let currentConstIdx = 0;
        let constConnectedPoints = [];
        
        const constellationPatterns = [
            {
                name: "Star-heart",
                points: [
                    { x: 100, y: 120, label: "Point 1" },
                    { x: 130, y: 70, label: "Point 2" },
                    { x: 180, y: 70, label: "Point 3" },
                    { x: 200, y: 120, label: "Point 4" },
                    { x: 150, y: 180, label: "Point 5" },
                    { x: 100, y: 120, label: "Point 6" }
                ],
                secretMessage: "💖 \"You are the brightest cosmic node in my daily orbit, Leah.\""
            },
            {
                name: "Matcha Mug",
                points: [
                    { x: 100, y: 100, label: "Point 1" },
                    { x: 200, y: 100, label: "Point 2" },
                    { x: 180, y: 170, label: "Point 3" },
                    { x: 120, y: 170, label: "Point 4" },
                    { x: 100, y: 100, label: "Point 5" }
                ],
                secretMessage: "🍵 \"Warm coffee sips, thick paper pages, and soft ambient chimes aligned just for you.\""
            },
            {
                name: "Sleepy Kitten",
                points: [
                    { x: 90, y: 150, label: "Point 1" },
                    { x: 120, y: 100, label: "Point 2" },
                    { x: 150, y: 130, label: "Point 3" },
                    { x: 180, y: 100, label: "Point 4" },
                    { x: 210, y: 150, label: "Point 5" },
                    { x: 90, y: 150, label: "Point 6" }
                ],
                secretMessage: "🐱 \"Sovereign Ruler of quiet notebook mornings and gentle cozy purrs.\""
            }
        ];

        function toggleConstellationDrawMode() {
            if (state.hasSynthesizer) { synth.playTone(500, 'sine', 0.08, 0.04); }
            state.constellationDrawMode = !state.constellationDrawMode;
            constConnectedPoints = [];
            
            const btn = document.getElementById('btnConstDrawToggle');
            if (state.constellationDrawMode) {
                btn.innerText = "Exit Free Draw Mode ✏️";
                document.getElementById('constTypeLabel').innerText = "Free Draw Designer";
                document.getElementById('constProgressLabel').innerText = "Drawing Enabled";
                document.getElementById('constellationMessage').innerText = "Draw anything by dragging on the starry canvas sky!";
            } else {
                btn.innerText = "Enter Free Draw Mode ✏️";
                updateConstellationUI();
            }
        }

        function initConstellationGame() {
            constCanvas = document.getElementById('constellationCanvas');
            constCtx = constCanvas.getContext('2d');
            constCanvas.width = constCanvas.offsetWidth;
            constCanvas.height = 256;
            
            state.constellationActive = true;
            constConnectedPoints = [];
            state.constellationDrawMode = false;
            updateConstellationUI();

            constCanvas.onmousedown = (e) => {
                const rect = constCanvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                if (state.constellationDrawMode) {
                    constConnectedPoints.push({ x: clickX, y: clickY });
                    if (state.hasSynthesizer) { synth.playTone(300 + Math.random() * 400, 'sine', 0.05, 0.02); }
                } else {
                    const pattern = constellationPatterns[currentConstIdx];
                    const nextIndexRequired = constConnectedPoints.length;
                    
                    if (nextIndexRequired < pattern.points.length) {
                        const targetPoint = pattern.points[nextIndexRequired];
                        const dist = Math.hypot(targetPoint.x - clickX, targetPoint.y - clickY);
                        
                        if (dist < 15) {
                            constConnectedPoints.push(targetPoint);
                            if (state.hasSynthesizer) { synth.playTone(400 + constConnectedPoints.length * 80, 'sine', 0.2, 0.05); }
                            earnReward(5, 1, 'constellation');
                            
                            if (constConnectedPoints.length === pattern.points.length) {
                                document.getElementById('constellationMessage').innerText = pattern.secretMessage;
                                triggerAchievement('ach_const_drawn');
                                earnReward(20, 2);
                            }
                        }
                    }
                }
                updateConstellationUI();
            };

            drawConstellationFrame();
        }

        function changeConstellationPattern() {
            state.constellationDrawMode = false;
            document.getElementById('btnConstDrawToggle').innerText = "Enter Free Draw Mode ✏️";
            currentConstIdx = (currentConstIdx + 1) % constellationPatterns.length;
            constConnectedPoints = [];
            document.getElementById('constellationMessage').innerText = "Connect coordinates...";
            updateConstellationUI();
        }

        function updateConstellationUI() {
            if (state.constellationDrawMode) return;
            const pattern = constellationPatterns[currentConstIdx];
            document.getElementById('constTypeLabel').innerText = pattern.name;
            document.getElementById('constProgressLabel').innerText = `${constConnectedPoints.length}/${pattern.points.length}`;
        }

        function drawConstellationFrame() {
            if (!state.constellationActive || document.getElementById('modalConstellation').classList.contains('hidden')) {
                state.constellationActive = false;
                return;
            }

            constCtx.fillStyle = '#0f172a'; 
            constCtx.fillRect(0, 0, constCanvas.width, constCanvas.height);

            // Draw graph paper overlay in blueprint constellation canvas
            constCtx.strokeStyle = 'rgba(147, 197, 253, 0.05)';
            constCtx.lineWidth = 1;
            for (let i = 0; i < constCanvas.width; i += 20) {
                constCtx.beginPath(); constCtx.moveTo(i, 0); constCtx.lineTo(i, constCanvas.height); constCtx.stroke();
            }

            if (state.constellationDrawMode) {
                if (constConnectedPoints.length > 1) {
                    constCtx.beginPath();
                    constCtx.moveTo(constConnectedPoints[0].x, constConnectedPoints[0].y);
                    for (let i = 1; i < constConnectedPoints.length; i++) {
                        constCtx.lineTo(constConnectedPoints[i].x, constConnectedPoints[i].y);
                    }
                    constCtx.strokeStyle = '#38bdf8';
                    constCtx.lineWidth = 3;
                    constCtx.stroke();
                }
                constConnectedPoints.forEach(p => {
                    constCtx.fillStyle = '#e2e8f0';
                    constCtx.beginPath();
                    constCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    constCtx.fill();
                });
            } else {
                const pattern = constellationPatterns[currentConstIdx];
                pattern.points.forEach((pt, idx) => {
                    const isConnected = idx < constConnectedPoints.length;
                    
                    constCtx.beginPath();
                    constCtx.arc(pt.x, pt.y, isConnected ? 6 : 4, 0, Math.PI * 2);
                    constCtx.fillStyle = isConnected ? '#c084fc' : '#475569';
                    constCtx.fill();

                    if (!isConnected && idx === constConnectedPoints.length) {
                        const pulsate = 4 + Math.sin(Date.now() * 0.01) * 3;
                        constCtx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
                        constCtx.lineWidth = 1.5;
                        constCtx.beginPath();
                        constCtx.arc(pt.x, pt.y, pulsate + 4, 0, Math.PI * 2);
                        constCtx.stroke();
                    }

                    constCtx.fillStyle = '#94a3b8';
                    constCtx.font = '11px Patrick Hand';
                    constCtx.fillText(pt.label, pt.x - 12, pt.y - 8);
                });

                if (constConnectedPoints.length > 1) {
                    constCtx.beginPath();
                    constCtx.moveTo(constConnectedPoints[0].x, constConnectedPoints[0].y);
                    for (let i = 1; i < constConnectedPoints.length; i++) {
                        constCtx.lineTo(constConnectedPoints[i].x, constConnectedPoints[i].y);
                    }
                    constCtx.strokeStyle = '#c084fc';
                    constCtx.lineWidth = 2.5;
                    constCtx.stroke();
                }
            }

            requestAnimationFrame(drawConstellationFrame);
        }

        // =========================================================================
        // MODULE 10: COZY HARMONY SYNTHESIZER
        // =========================================================================
        const harmonyIngredients = [
            { id: "matcha", name: "🍵 Matcha Latte", tag: "Warmth" },
            { id: "rain", name: "🌧️ Rainy Evening", tag: "Nature" },
            { id: "lofi", name: "🎹 Soft Lofi Keys", tag: "Acoustics" },
            { id: "cats", name: "🐱 Purring Kitten", tag: "Affection" },
            { id: "novel", name: "📖 Thick Novel", tag: "Focus" },
            { id: "blanket", name: "🧦 Wool Blanket", tag: "Comfort" }
        ];

        function initHarmonyInterface() {
            const grid = document.getElementById('harmonyIngredientsGrid');
            grid.innerHTML = '';
            harmonyIngredients.forEach(item => {
                const isSelected = state.selectedHarmonyIngredients.includes(item.id);
                grid.innerHTML += `
                    <button onclick="toggleHarmonyIngredient('${item.id}')" class="p-4 rounded-xl border-2 border-stone-800 transition-all ${isSelected ? 'bg-amber-100 scale-95 font-bold' : 'bg-white hover:bg-stone-50'} flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_0px_#2d2d2d]" style="border-radius:12px 5px 12px 5px;">
                        <span class="text-sm text-stone-900 font-hand font-bold">${item.name}</span>
                        <span class="text-[9px] bg-stone-100 px-2 py-0.5 rounded border border-stone-200 mt-2 font-sans uppercase text-stone-600">${item.tag}</span>
                    </button>
                `;
            });
        }

        function toggleHarmonyIngredient(id) {
            if (state.hasSynthesizer) { synth.playTone(320, 'sine', 0.08, 0.04); }
            const idx = state.selectedHarmonyIngredients.indexOf(id);
            if (idx > -1) { state.selectedHarmonyIngredients.splice(idx, 1); } 
            else {
                if (state.selectedHarmonyIngredients.length < 3) { state.selectedHarmonyIngredients.push(id); } 
                else { showCustomToast("Aroma Full", "Select exactly three ingredients to fuse!", "🍵"); }
            }
            initHarmonyInterface();
        }

        function resetHarmonyChoices() {
            if (state.hasSynthesizer) { synth.playTone(200, 'sine', 0.1, 0.05); }
            state.selectedHarmonyIngredients = [];
            document.getElementById('harmonyOutputBox').classList.add('hidden');
            initHarmonyInterface();
        }

        function fuseHarmonyIngredients() {
            if (state.selectedHarmonyIngredients.length !== 3) {
                showCustomToast("Formula Error", "Please select exactly three ingredients to compile!", "❌");
                return;
            }

            if (state.hasSynthesizer) { synth.playLevelUp(); }
            triggerAchievement('ach_harmony_fused');
            earnReward(30, 2, 'harmony');

            const sel = [...state.selectedHarmonyIngredients].sort();
            let title = "Cozy Atmosphere Matrix";
            let desc = "A wonderfully warm arrangement settling quietly over your coordinates.";

            const comboKey = sel.join('-');
            const combinationMap = {
                'blanket-cats-lofi': {
                    t: "The Velvet Purr Haven",
                    d: "Blending wool blankets with soft lofi keys and the rhythmic purrs of a cozy kitten. This creates a state of deep, absolute comfort tailored perfectly to your quiet winter mornings."
                },
                'blanket-cats-novel': {
                    t: "The Cozy Study Hearth",
                    d: "Combining thick pages of a mystery book with soft cat paws and a cozy throw blanket. This formula yields maximum peaceful sanctuary vibes."
                },
                'blanket-cats-rain': {
                    t: "The Rain-streaked Hideaway",
                    d: "Raindrops tapping on window glass combined with blankets and warm purrs. Leah's presence in this formula naturally clears any surrounding cold weather."
                },
                'blanket-cats-matcha': {
                    t: "The Green Cocoon",
                    d: "A warm matcha sip coupled with blankets and purring kitten cuddles. High levels of absolute coziness detected."
                },
                'blanket-lofi-novel': {
                    t: "Midnight Jazz Library",
                    d: "Thick book pages flipping softly alongside slow lofi arpeggios and comfortable wool layers. Settles any busy mind instantly."
                },
                'blanket-lofi-rain': {
                    t: "Pitter-Patter Cabin",
                    d: "Soft raindrops, acoustic jazz chords, and cozy blankets. A perfect winter weather sanctuary."
                },
                'blanket-lofi-matcha': {
                    t: "Matcha Room Chords",
                    d: "Hot matcha steam rising gently as slow keyboard tones mix with a wool throw blanket. Settles coordinates."
                },
                'blanket-novel-rain': {
                    t: "The Attic Reading Nook",
                    d: "Rain showers, comforting blanket wool, and a thick mystery novel. Encourages comfortable thoughts."
                },
                'blanket-novel-matcha': {
                    t: "The Green Book Lounge",
                    d: "Hot matcha latte and thick books wrapped tightly in a cozy blanket. Maximum tranquility achieved."
                },
                'blanket-matcha-rain': {
                    t: "Rainforest Herb Retreat",
                    d: "Matcha latte combined with a forest rain shower and comfortable blankets. Exceptional comfort parameters."
                },
                'cats-lofi-novel': {
                    t: "The Studious Feline",
                    d: "A purring kitten sitting on a thick mystery novel while jazz piano waves swirl. A high-quality creative aura."
                },
                'cats-lofi-rain': {
                    t: "Cat-nap Chords in Rain",
                    d: "Soft lofi chords, windowpane raindrops, and a purring kitten. The perfect restorative space."
                },
                'cats-lofi-matcha': {
                    t: "Sweet Green Whiskers",
                    d: "Matcha green tea swirled beautifully as kitten purrs and lofi music align. Cosmic comfort parameters."
                },
                'cats-novel-rain': {
                    t: "The Rainy Parlor",
                    d: "Soft purring, window raindrops, and a thick book. Extremely cozy aura compatibility."
                },
                'cats-novel-matcha': {
                    t: "The Whisker Tea Room",
                    d: "Hot matcha sips, a cozy kitten, and a thick page-turner. Settles local storms."
                },
                'cats-matcha-rain': {
                    t: "The Greenhouse Purr",
                    d: "Warm matcha tea, green raindrops, and a purring cat. Unlocks absolute relaxation."
                },
                'lofi-novel-rain': {
                    t: "The Stormy Writer Studio",
                    d: "Heavy rainstorm showers, slow lofi chords, and an antique book. Promotes high focus."
                },
                'lofi-novel-matcha': {
                    t: "The Golden Leaf Lounge",
                    d: "Thick historical pages, hot matcha tea, and quiet lofi cords. Peaceful and beautiful."
                },
                'lofi-matcha-rain': {
                    t: "Matcha Cloud Frequencies",
                    d: "Rain showers over the garden as hot matcha mixes with slow acoustic keys. Radiates soothing energy."
                },
                'novel-matcha-rain': {
                    t: "The Botanical Archives",
                    d: "A thick book, rainfall, and matcha latte. Leah's ultimate recipe for an elegant, warm afternoon."
                }
            };

            const result = combinationMap[comboKey];
            if (result) {
                title = result.t;
                desc = result.d;
            }

            document.getElementById('harmonyTitle').innerText = `"${title}"`;
            document.getElementById('harmonyDescription').innerText = desc;
            document.getElementById('harmonyOutputBox').classList.remove('hidden');
        }

        // =========================================================================
        // MODULE 11: THE CRINGE VAULT
        // =========================================================================
        const mildCringe = [
            "Are you my appendix? Because I don't know what you do, but this feeling in my stomach makes me want to take you out.",
            "Are you a sharpie? Because you are ultra-fine... and smell slightly concerning.",
            "Are you made of copper and tellurium? Because you are Cu-Te!"
        ];
        const cosmicCringe = [
            "Are you a toaster? Because I really want to take a bath with you.",
            "My love for you is like diarrhea, I just can't hold it in.",
            "Are you a garbage collector? Because I really want you to take out my trash."
        ];

        function filterCringe(type) {
            if (state.hasSynthesizer) { synth.playTone(300, 'sine', 0.05, 0.03); }
            state.cringeCategory = type;
            const list = document.getElementById('cringeLinesList');
            list.innerHTML = '';
            
            const pool = type === 'mild' ? mildCringe : cosmicCringe;
            pool.forEach(line => { list.innerHTML += `<li>"${line}"</li>`; });
        }
        filterCringe('mild');

        function generateCustomCringeLine() {
            if (state.hasSynthesizer) { synth.playTone(220, 'sawtooth', 0.2, 0.06); }
            const setups = ["Are you a router?", "Is your name Wi-Fi?", "Are you made of copper?", "Is your dad a boxer?"];
            const punchlines = ["Because you provide outstanding connection limits.", "Because I feel an immediate wave of signal.", "Because you are a sovereign conductor of warmth.", "Because you are a sweet cupcake."];
            
            const randomSetup = setups[Math.floor(Math.random() * setups.length)];
            const randomPunch = punchlines[Math.floor(Math.random() * punchlines.length)];
            
            const container = document.getElementById('customCringeBox');
            container.innerText = `"${randomSetup} ${randomPunch}"`;
            container.classList.remove('hidden');
            earnReward(10, 1);
        }

        // =========================================================================
        // MODULE 12: HISTORICAL RECORDS MUSEUM EXHIBITS & DYNAMIC PARADOX
        // =========================================================================
        function triggerAuraScan() {
            if (state.hasSynthesizer) { synth.playTone(600, 'triangle', 0.1, 0.04); }
            const status = document.getElementById('auraScanStatus');
            status.innerText = "Analyzing aura metrics...";
            
            setTimeout(() => {
                if (state.hasSynthesizer) { synth.playLevelUp(); }
                status.innerText = "9,999,999+ Aura Points (Sovereign Tier) ✨";
                earnReward(15, 2, 'museum');
            }, 1500);
        }

        function playChessAgainstThunder() {
            if (state.hasSynthesizer) { synth.playTone(180, 'sawtooth', 0.15, 0.04); }
            showCustomToast('Chess Move', 'Leah moves Pawn to E4. Thunder responds with a lightning bolt onto D5!', '♟️');
            earnReward(10, 1, 'museum');
        }

        function spinParadoxGauge() {
            if (state.hasSynthesizer) { synth.playTone(320, 'triangle', 0.3, 0.08); }
            const label = document.getElementById('paradoxGaugeVal');
            label.innerText = "Spinning Timeline...";
            
            setTimeout(() => {
                const paradoxPct = Math.floor(Math.random() * 100) + 1;
                let desc = "Stable (0%)";
                if (paradoxPct > 80) {
                    desc = `CRITICAL DETECTED (${paradoxPct}%): Leah gaslit gravity!`;
                } else if (paradoxPct > 40) {
                    desc = `UNSTABLE (${paradoxPct}%): A dinosaur is singing sonnets.`;
                } else {
                    desc = `MILD (${paradoxPct}%): Sourdough rises 2x speed.`;
                }
                label.innerText = `Gauge: ${desc}`;
                earnReward(8, 1, 'museum');
            }, 1000);
        }

        // =========================================================================
        // MODULE 13: BIRTHDAY SPEEDRUN CHALLENGE REFLEX GAME
        // =========================================================================
        let speedrunCanvas, speedrunCtx;
        let speedrunScore = 0;
        let speedrunTime = 15;
        let speedrunItems = [];
        let speedrunPlayerX = 150;
        let speedrunInterval = null;

        function startSpeedrunGame() {
            speedrunCanvas = document.getElementById('speedrunCanvas');
            speedrunCtx = speedrunCanvas.getContext('2d');
            speedrunCanvas.width = speedrunCanvas.offsetWidth;
            speedrunCanvas.height = 256;
            
            state.speedrunActive = true;
            speedrunScore = 0;
            speedrunTime = 15;
            speedrunItems = [];
            speedrunPlayerX = speedrunCanvas.width / 2;

            document.getElementById('speedrunScore').innerText = speedrunScore;
            document.getElementById('speedrunTime').innerText = `${speedrunTime}s`;

            speedrunCanvas.onmousemove = (e) => {
                const rect = speedrunCanvas.getBoundingClientRect();
                speedrunPlayerX = e.clientX - rect.left;
            };

            if (speedrunInterval) clearInterval(speedrunInterval);
            speedrunInterval = setInterval(() => {
                if (!state.speedrunActive) {
                    clearInterval(speedrunInterval); return;
                }
                speedrunTime--;
                document.getElementById('speedrunTime').innerText = `${speedrunTime}s`;
                if (speedrunTime <= 0) {
                    clearInterval(speedrunInterval);
                    state.speedrunActive = false;
                    showCustomToast('Speedrun Finished!', `Leah caught ${speedrunScore} cookies!`, '⏱️');
                    
                    if (speedrunScore >= 35) { triggerAchievement('ach_speedrun'); }
                }
            }, 1000);

            runSpeedrunFrame();
        }

        function runSpeedrunFrame() {
            if (!state.speedrunActive || document.getElementById('modalSpeedrun').classList.contains('hidden')) {
                state.speedrunActive = false; return;
            }

            speedrunCtx.fillStyle = '#0f172a';
            speedrunCtx.fillRect(0, 0, speedrunCanvas.width, speedrunCanvas.height);

            // Draw plate
            speedrunCtx.fillStyle = '#fbcfe8';
            speedrunCtx.fillRect(speedrunPlayerX - 25, speedrunCanvas.height - 20, 50, 10);
            speedrunCtx.strokeStyle = '#ffffff';
            speedrunCtx.lineWidth = 1.5;
            speedrunCtx.strokeRect(speedrunPlayerX - 25, speedrunCanvas.height - 20, 50, 10);

            if (Math.random() < 0.08) {
                speedrunItems.push({
                    x: Math.random() * speedrunCanvas.width, y: 0,
                    type: Math.random() < 0.75 ? 'cookie' : 'tax',
                    speed: Math.random() * 2 + 2
                });
            }

            speedrunItems.forEach((item, idx) => {
                item.y += item.speed;

                if (item.type === 'cookie') {
                    speedrunCtx.fillStyle = '#facc15';
                    speedrunCtx.beginPath();
                    speedrunCtx.arc(item.x, item.y, 7, 0, Math.PI * 2);
                    speedrunCtx.fill();
                } else {
                    speedrunCtx.fillStyle = '#ef4444';
                    speedrunCtx.fillRect(item.x - 5, item.y - 5, 10, 10);
                }

                if (item.y > speedrunCanvas.height - 25 && item.y < speedrunCanvas.height - 10 && Math.abs(item.x - speedrunPlayerX) < 30) {
                    speedrunItems.splice(idx, 1);
                    if (item.type === 'cookie') {
                        speedrunScore++;
                        if (state.hasSynthesizer) { synth.playTone(800, 'sine', 0.05, 0.04); }
                        earnReward(2, 1, 'speedrun');
                    } else {
                        speedrunScore = Math.max(0, speedrunScore - 5);
                        if (state.hasSynthesizer) { synth.playTone(150, 'sawtooth', 0.15, 0.05); }
                    }
                    document.getElementById('speedrunScore').innerText = speedrunScore;
                }
            });

            speedrunItems = speedrunItems.filter(item => item.y <= speedrunCanvas.height + 10);
            requestAnimationFrame(runSpeedrunFrame);
        }

        // =========================================================================
        // FINALE ENDING SEQUENCER
        // =========================================================================
        function initiateEndingCinematic() {
            const cinema = document.getElementById('endingCinematic');
            cinema.classList.remove('pointer-events-none');
            cinema.classList.add('opacity-100');
            initEndingCanvas();

            const crown = document.getElementById('endingCrown');
            const rays  = document.getElementById('finaleRays');
            const title = document.getElementById('endingTitle');
            const letter= document.getElementById('endingLetter');
            const seal  = document.getElementById('endingSeal');

            // Stage 0 — soft chime sweep
            if (state.hasSynthesizer && synth.ctx) {
                const chimes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                chimes.forEach((f, i) => setTimeout(() => synth.playTone(f, 'sine', 0.35, 0.06), i * 180));
            }

            // Stage 1 — crown bloom
            setTimeout(() => { crown && crown.classList.add('bloom'); }, 400);
            setTimeout(() => { rays  && rays.classList.add('on'); }, 700);

            // Stage 2 — title shimmer in
            setTimeout(() => {
                title && title.classList.remove('scale-75', 'opacity-0');
                burstSparkles(40);
                if (state.hasSynthesizer) synth.playLevelUp && synth.playLevelUp();
            }, 1100);

            // Stage 3 — fireworks
            for (let i = 0; i < 6; i++) {
                setTimeout(() => spawnFirework(), 1500 + i * 450);
            }

            // Stage 4 — letter rises, seal cracks
            setTimeout(() => {
                letter && letter.classList.remove('translate-y-8', 'opacity-0');
            }, 2300);
            setTimeout(() => {
                seal && seal.classList.add('broken');
                if (state.hasSynthesizer) synth.playTone(196, 'triangle', 0.25, 0.09);
                burstSparkles(24);
            }, 3300);

            // Stage 5 — continuous gentle sparkle drizzle
            if (cinema._sparkleTimer) clearInterval(cinema._sparkleTimer);
            cinema._sparkleTimer = setInterval(() => burstSparkles(3), 900);
        }

        function closeEndingCinematic() {
            if (state.hasSynthesizer) { synth.playTone(280, 'sine', 0.05, 0.03); }
            const cinema = document.getElementById('endingCinematic');
            cinema.classList.add('pointer-events-none');
            cinema.classList.remove('opacity-100');
            if (cinema._sparkleTimer) { clearInterval(cinema._sparkleTimer); cinema._sparkleTimer = null; }
            // Reset for replay
            const crown = document.getElementById('endingCrown');
            const rays  = document.getElementById('finaleRays');
            const title = document.getElementById('endingTitle');
            const letter= document.getElementById('endingLetter');
            const seal  = document.getElementById('endingSeal');
            crown && crown.classList.remove('bloom');
            rays  && rays.classList.remove('on');
            title && title.classList.add('scale-75', 'opacity-0');
            letter&& letter.classList.add('translate-y-8', 'opacity-0');
            seal  && seal.classList.remove('broken');
            endingFireworks = [];
        }

        // Hand-doodled sparkle glyphs that puff around the crown / letter
        const SPARKLE_GLYPHS = ['✦','✧','★','✺','✹','✶','✷','·'];
        function burstSparkles(n) {
            const layer = document.getElementById('finaleSparkleLayer');
            if (!layer) return;
            const rect = layer.getBoundingClientRect();
            for (let i = 0; i < n; i++) {
                const s = document.createElement('span');
                s.className = 'finale-sparkle';
                s.textContent = SPARKLE_GLYPHS[Math.floor(Math.random() * SPARKLE_GLYPHS.length)];
                const cx = rect.width * (0.15 + Math.random() * 0.7);
                const cy = rect.height * (0.15 + Math.random() * 0.55);
                s.style.left = cx + 'px';
                s.style.top  = cy + 'px';
                s.style.fontSize = (16 + Math.random() * 22) + 'px';
                s.style.color = ['#fbbf24','#f472b6','#a78bfa','#60a5fa','#f87171'][Math.floor(Math.random()*5)];
                layer.appendChild(s);
                setTimeout(() => s.remove(), 1700);
            }
        }

        let endingCanvas, endingCtx, endingStars = [], endingFireworks = [];

        function initEndingCanvas() {
            endingCanvas = document.getElementById('endingCanvas');
            endingCtx = endingCanvas.getContext('2d');
            endingCanvas.width = window.innerWidth;
            endingCanvas.height = window.innerHeight;
            endingStars = [];
            for (let i = 0; i < 70; i++) {
                endingStars.push({
                    x: Math.random() * endingCanvas.width,
                    y: Math.random() * endingCanvas.height,
                    radius: Math.random() * 1.8 + 0.6,
                    alpha: Math.random() * 0.7 + 0.3,
                    speed: Math.random() * 0.35 + 0.08,
                    hue: Math.random() < 0.5 ? '251,191,36' : (Math.random() < 0.5 ? '244,114,182' : '167,139,250')
                });
            }
            runEndingFrame();
        }

        function spawnFirework() {
            if (!endingCanvas) return;
            const x = endingCanvas.width * (0.2 + Math.random() * 0.6);
            const y = endingCanvas.height * (0.2 + Math.random() * 0.4);
            const hue = ['251,191,36','244,114,182','167,139,250','96,165,250','248,113,113'][Math.floor(Math.random()*5)];
            const count = 36;
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 * i) / count;
                const speed = 2 + Math.random() * 2.4;
                endingFireworks.push({
                    x, y,
                    vx: Math.cos(a) * speed,
                    vy: Math.sin(a) * speed,
                    life: 1, hue
                });
            }
            if (state.hasSynthesizer) synth.playTone(880 + Math.random()*220, 'triangle', 0.18, 0.05);
        }

        function runEndingFrame() {
            if (!document.getElementById('endingCinematic').classList.contains('opacity-100')) return;

            endingCtx.fillStyle = 'rgba(254, 252, 248, 0.18)';
            endingCtx.fillRect(0, 0, endingCanvas.width, endingCanvas.height);

            endingStars.forEach(s => {
                s.y -= s.speed;
                if (s.y < 0) { s.y = endingCanvas.height; s.x = Math.random() * endingCanvas.width; }
                endingCtx.fillStyle = `rgba(${s.hue}, ${s.alpha})`;
                endingCtx.beginPath();
                endingCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                endingCtx.fill();
            });

            endingFireworks = endingFireworks.filter(p => p.life > 0.02);
            endingFireworks.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.04; p.vx *= 0.985; p.vy *= 0.985;
                p.life *= 0.955;
                endingCtx.fillStyle = `rgba(${p.hue}, ${p.life})`;
                endingCtx.beginPath();
                endingCtx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
                endingCtx.fill();
            });

            requestAnimationFrame(runEndingFrame);
        }

        // =========================================================================
        // MODULE 11: HARMONY ARPEGGIO PLAYER (turns selected ingredients into a soothing loop)
        // =========================================================================
        // Pentatonic notes (A minor pentatonic) — every combination sounds consonant.
        const harmonyNoteMap = {
            matcha:  329.63, // E4
            rain:    220.00, // A3
            lofi:    261.63, // C4
            cats:    392.00, // G4
            novel:   293.66, // D4
            blanket: 440.00  // A4
        };
        let harmonyLoopTimer = null;

        function stopHarmonyArpeggio() {
            if (harmonyLoopTimer) { clearInterval(harmonyLoopTimer); harmonyLoopTimer = null; }
            const padRow = document.getElementById('harmonyPadRow');
            if (padRow) { padRow.classList.add('hidden'); padRow.innerHTML = ''; }
            const btn = document.getElementById('btnHarmonyPlay');
            if (btn) btn.innerHTML = '▶ PLAY SOOTHING LOOP';
        }

        function playHarmonyTone(freq, padDot) {
            if (!state.hasSynthesizer || !synth.ctx) return;
            try {
                const ctx = synth.ctx;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.25);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);
                // Soft octave-below for warmth
                const sub = ctx.createOscillator();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(freq / 2, ctx.currentTime);
                const subGain = ctx.createGain();
                subGain.gain.setValueAtTime(0, ctx.currentTime);
                subGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.35);
                subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.6);
                osc.connect(gain); gain.connect(ctx.destination);
                sub.connect(subGain); subGain.connect(ctx.destination);
                osc.start(); sub.start();
                osc.stop(ctx.currentTime + 2.7); sub.stop(ctx.currentTime + 2.8);
                if (padDot) {
                    padDot.style.transform = 'scale(1.4)';
                    padDot.style.boxShadow = '0 0 18px rgba(251,191,36,0.7)';
                    setTimeout(() => {
                        padDot.style.transform = 'scale(1)';
                        padDot.style.boxShadow = '';
                    }, 500);
                }
            } catch (e) {}
        }

        function toggleHarmonyArpeggio() {
            if (harmonyLoopTimer) { stopHarmonyArpeggio(); return; }
            if (state.selectedHarmonyIngredients.length !== 3) {
                showCustomToast('Pick three first', 'Choose three ingredients to weave a melody.', '🎶');
                return;
            }
            if (!state.hasSynthesizer) {
                showCustomToast('Audio locked', 'Tap "Enable Cozy Audio" in the top banner first.', '🔈');
                return;
            }
            const padRow = document.getElementById('harmonyPadRow');
            padRow.classList.remove('hidden');
            padRow.innerHTML = '';
            const dots = [];
            state.selectedHarmonyIngredients.forEach(id => {
                const ing = harmonyIngredients.find(i => i.id === id);
                const dot = document.createElement('div');
                dot.className = 'px-4 py-3 border-2 border-stone-800 rounded-xl bg-white font-hand text-sm text-stone-900 shadow-[2px_2px_0px_0px_#2d2d2d] transition-transform duration-300';
                dot.style.borderRadius = '14px 6px 14px 6px';
                dot.textContent = ing ? ing.name : id;
                padRow.appendChild(dot);
                dots.push(dot);
            });

            document.getElementById('btnHarmonyPlay').innerHTML = '■ STOP LOOP';
            const notes = state.selectedHarmonyIngredients.map(id => harmonyNoteMap[id] || 261.63);

            let step = 0;
            const tick = () => {
                const idx = step % notes.length;
                playHarmonyTone(notes[idx], dots[idx]);
                step++;
            };
            tick();
            harmonyLoopTimer = setInterval(tick, 850);
        }
        window.toggleHarmonyArpeggio = toggleHarmonyArpeggio;

        // Stop arpeggio when the Harmony modal is closed
        (function wrapCloseForHarmony() {
            const originalClose = window.closeZone || closeZone;
            window.closeZone = function (zoneId) {
                if (zoneId === 'zoneHarmony') stopHarmonyArpeggio();
                return originalClose.call(this, zoneId);
            };
        })();

        // =========================================================================
        // MODULE 12: THE WISHING LAMP (Leah types wishes → Ishaan's inbox)
        // =========================================================================
        // Delivery runs through the /api/wish server route. The Web3Forms access
        // key and recipient email live in server env vars (WEB3FORMS_KEY,
        // WISH_RECIPIENT_EMAIL) so nothing secret ships to the client bundle
        // or to GitHub. Set them in .env.local locally and in Vercel project
        // settings for production.
        const WISH_CONFIG = {
            endpoint: '/api/wish',
            recipientEmail: 'ishaan210611@gmail.com',  // shown in fallback mailto only
            subjectPrefix: '🪔 Leah wished:'
        };
        const WISH_STORAGE_KEY = 'leah_wish_history_v1';
        const WISH_PREFILLS = {
            travel: 'I want to travel to ',
            learn:  'I want to learn ',
            cozy:   'For a perfect cozy day with you, I want to ',
            us:     'I wish that we could '
        };

        function loadWishHistory() {
            try { return JSON.parse(localStorage.getItem(WISH_STORAGE_KEY) || '[]'); }
            catch (e) { return []; }
        }
        function saveWishHistory(list) {
            try { localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(list.slice(0, 20))); } catch (e) {}
        }
        function renderWishHistory() {
            const ul = document.getElementById('wishHistoryList');
            if (!ul) return;
            const list = loadWishHistory();
            if (!list.length) {
                ul.innerHTML = '<li class="text-stone-400 italic text-xs">No wishes whispered yet.</li>';
                return;
            }
            ul.innerHTML = list.map(w => {
                const safe = String(w.text).replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c]));
                const date = new Date(w.at).toLocaleString();
                const status = w.sent ? '✨ sent' : '📭 saved (offline)';
                return `<li class="border-b border-dashed border-stone-300 pb-1"><span class="text-[10px] font-sans text-stone-500">${date} · ${status}</span><br>${safe}</li>`;
            }).join('');
        }

        function initWishLamp() {
            renderWishHistory();
            const ta = document.getElementById('wishText');
            const counter = document.getElementById('wishCounter');
            if (ta && counter && !ta._wired) {
                ta._wired = true;
                ta.addEventListener('input', () => {
                    counter.textContent = `${ta.value.length} / 600`;
                });
            }
            const lamp = document.getElementById('wishLamp');
            if (lamp) lamp.style.transform = 'scale(1)';
        }

        function addWishPrefill(kind) {
            const ta = document.getElementById('wishText');
            if (!ta) return;
            const prefix = WISH_PREFILLS[kind] || '';
            ta.value = (ta.value ? ta.value.replace(/\s+$/, '') + '\n' : '') + prefix;
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
            document.getElementById('wishCounter').textContent = `${ta.value.length} / 600`;
        }
        window.addWishPrefill = addWishPrefill;

        async function sendWish() {
            const ta = document.getElementById('wishText');
            const status = document.getElementById('wishStatus');
            const lamp = document.getElementById('wishLamp');
            const text = (ta?.value || '').trim();
            if (!text) {
                showCustomToast('Empty wish', 'Type a wish first — even tiny ones count.', '🪔');
                return;
            }

            // Lamp shimmer
            if (lamp) {
                lamp.style.transform = 'scale(1.25) rotate(-6deg)';
                setTimeout(() => { lamp.style.transform = 'scale(1) rotate(0deg)'; }, 600);
            }
            if (state.hasSynthesizer) {
                synth.playTone(659.25, 'sine', 0.18, 0.07);
                setTimeout(() => synth.playTone(987.77, 'triangle', 0.45, 0.08), 140);
            }

            let sent = false;
            if (status) status.textContent = 'sending…';
            try {
                const res = await fetch(WISH_CONFIG.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json().catch(() => ({}));
                sent = !!data.success;
                if (sent) {
                    if (status) status.textContent = '✨ delivered to Ishaan';
                } else if (data.error === 'not_configured') {
                    // Server env vars missing — fall back to mailto so the wish isn't lost.
                    const subject = encodeURIComponent(`${WISH_CONFIG.subjectPrefix} ${text.slice(0, 60)}`);
                    const body = encodeURIComponent(text + '\n\n— sent from Leah\'s birthday site 🪔');
                    window.location.href = `mailto:${WISH_CONFIG.recipientEmail}?subject=${subject}&body=${body}`;
                    if (status) status.textContent = '📨 opened mail app — hit Send!';
                    sent = true;
                } else {
                    if (status) status.textContent = '⚠️ delivery failed';
                }
            } catch (e) {
                if (status) status.textContent = '⚠️ network error';
            }

            const history = loadWishHistory();
            history.unshift({ text, at: Date.now(), sent });
            saveWishHistory(history);
            renderWishHistory();

            if (sent) {
                showCustomToast('Wish lit ✨', 'Your wish is on its way to Ishaan.', '🪔');
                ta.value = '';
                document.getElementById('wishCounter').textContent = '0 / 600';
                // Floating hearts above the lamp
                if (lamp) {
                    const rect = lamp.getBoundingClientRect();
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            const h = document.createElement('div');
                            h.className = 'floating-heart';
                            h.textContent = '✨';
                            h.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
                            h.style.top = (rect.top + window.scrollY) + 'px';
                            h.style.position = 'absolute';
                            document.body.appendChild(h);
                            setTimeout(() => h.remove(), 2100);
                        }, i * 80);
                    }
                }
            }
        }
        window.sendWish = sendWish;
        window.initWishLamp = initWishLamp;

        window.onload = function() {
            earnReward(0, 0);
            triggerAchievement('ach_join');
        };

