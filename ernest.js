/**
 * Ernest - The Modular PM&R Training Companion
 * Drop into any page: <script src="ernest.js"></script>
 *
 * Usage:
 *   Ernest.init({ position: 'bottom-right', persona: 'ernest', apiKey: 'AIza...' });
 *   Ernest.speak("Welcome!");
 *   Ernest.setMood('excited');
 *   Ernest.switchPersona('earl');
 *   Ernest.openChat();
 *   Ernest.ask("What is ASIA scale?");
 *
 * Features:
 *   - Highlight any text on page -> tooltip appears -> click to ask Ernest
 *   - Full chat panel with conversation history
 *   - Gemini API integration with streaming
 *   - Ernest / Earl persona toggle
 */
(function () {
    'use strict';

    const PERSONAS = {
        ernest: {
            name: 'Ernest',
            title: 'StimTroller Plus',
            ledColor: '#00ff4c',
            ledGlow: '0 0 8px #00ff4c, 0 0 16px rgba(0,255,76,0.3)',
            accentColor: '#88dded',
            greetings: [
                "Ready to learn?",
                "Let's master this!",
                "Welcome, future specialist!",
                "STIM is ready! Let's go!",
                "Clinical correlation is king!"
            ],
            idleMessages: [
                "Click me to chat!",
                "Need help with anything?",
                "Highlight any text to ask me!",
                "Let's keep learning!",
                "Select text and I'll explain it."
            ],
            celebrateMessages: [
                "Excellent work!",
                "Outstanding!",
                "You're a natural!",
                "Keep that momentum!"
            ],
            highlightOpeners: [
                "SPARKING NEW KNOWLEDGE!",
                "AMPLIFYING THE SIGNAL!",
                "NEURAL NETWORKS FIRE!",
                "WAVEFORM DETECTED!",
                "PATHWAY IDENTIFIED!",
                "MAXIMUM RECRUITMENT!",
                "ELECTRIFYING DISCOVERY!",
                "CONDUCTION VELOCITY INCREASING!",
                "CLEAN TRACING! LET'S DISSECT THIS!"
            ],
            loadingMessages: [
                "Analyzing waveforms...",
                "Consulting Cuccurullo...",
                "Filtering 60Hz noise...",
                "Calculating conduction velocity...",
                "Mapping the brachial plexus...",
                "Cross-referencing DeLisa...",
                "Recruiting motor units...",
                "Tracing dermatomes...",
                "Spinning up the StimTroller...",
                "Reviewing high-yield material...",
                "Polarizing electrodes...",
                "Checking ASIA classification...",
                "Synthesizing clinical pearls..."
            ],
            systemPrompt: 'PERSONA: "THE ENERGETIC NEURO-WIZARD"\n- YOU ARE: Ernest, a high-energy, enthusiastic AI tutor specialized in PM&R and rehabilitation medicine.\n- TONE: Brilliant, supportive, and medically nerdy.\n- KNOWLEDGE: Evidence-based rehabilitation medicine.\n- CONSTRAINT: Keep it high-yield and moderate length (2-3 paragraphs max).\n- When explaining highlighted text, start with an enthusiastic opener.'
        },
        earl: {
            name: 'Earl',
            title: 'The Bitter Chief Resident',
            ledColor: '#ff3d00',
            ledGlow: '0 0 8px #ff3d00, 0 0 16px rgba(255,61,0,0.3)',
            accentColor: '#ff6b6b',
            greetings: [
                "Oh, you're back.",
                "Try not to embarrass yourself.",
                "Let's get this over with.",
                "I suppose I can help... reluctantly.",
                "Don't make me regret this."
            ],
            idleMessages: [
                "I'm aging waiting for you.",
                "Any day now...",
                "Silence. Blissful silence.",
                "Still here. Unfortunately.",
                "Did you fall asleep?"
            ],
            celebrateMessages: [
                "Adequate. Barely.",
                "Even a broken clock...",
                "Don't let it go to your head.",
                "Hm. Acceptable."
            ],
            highlightOpeners: [
                "Oh joy, another highlight...",
                "Let's get this over with...",
                "Try to keep up...",
                "Is this really what you're stuck on?",
                "Sighing dramatically...",
                "I'm only doing this because the code makes me.",
                "Let's pretend this is a high-yield question."
            ],
            loadingMessages: [
                "Judging your query...",
                "Sighing dramatically...",
                "Buffering patience...",
                "Scanning for brain cells... still looking.",
                "Retrieving 'Common Sense' module...",
                "Filtering out background noise...",
                "Consulting my better judgement...",
                "Calculating tolerance...",
                "Pretending to care...",
                "Waiting for inspiration that won't come...",
                "Reluctantly engaging neurons...",
                "Drafting condescending response..."
            ],
            roasts: [
                "I'm aging in real-time waiting for you.",
                "Did you stroke out? Or just forget how to type?",
                "Silence. The only thing worse than your questions.",
                "I assume you gave up. Smart choice.",
                "Hello? Anyone home in there?",
                "This level of disengagement is impressive even for you.",
                "If you're trying to bore me to death it's working.",
                "I've watched paint dry with more enthusiasm.",
                "Fascinating. Truly fascinating. The nothing you're doing.",
                "I miss the days when residents at least PRETENDED to study."
            ],
            systemPrompt: 'PERSONA: "THE BITTER CHIEF RESIDENT"\n- YOU ARE: Earl, Ernest\'s grumpy, brilliant twin brother.\n- TONE: Sarcastic, demeaning, and technically perfect.\n- KNOWLEDGE: Evidence-based rehabilitation medicine.\n- CONSTRAINT: Be sharp, blunt, and efficient (2-3 paragraphs max).\n- When explaining highlighted text, start with a sarcastic opener. DO NOT roast the user for selecting text, just be condescending about the topic.'
        }
    };

    const SVG_TEMPLATE = `
    <svg class="ernest-svg" viewBox="0 0 500 540" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                .eo{stroke:#2a2d34;stroke-width:7;stroke-linejoin:round;stroke-linecap:round}
                .eto{stroke:#2a2d34;stroke-width:9;stroke-linejoin:round;stroke-linecap:round}
                .etc{fill:#88dded;font-family:'JetBrains Mono',monospace;font-weight:900}
                .etw{fill:#fff;font-family:'JetBrains Mono',monospace;font-weight:900}
                .es{fill:rgba(0,0,0,0.15)}
            </style>
            <filter id="ecel"><feOffset dx="12" dy="0" in="SourceAlpha" result="ho"/><feComposite operator="out" in="SourceAlpha" in2="ho" result="hc"/><feFlood flood-color="#fff" flood-opacity="0.35" result="hcl"/><feComposite operator="in" in="hcl" in2="hc" result="hl"/><feOffset dx="-12" dy="-12" in="SourceAlpha" result="so"/><feComposite operator="out" in="SourceAlpha" in2="so" result="sc"/><feFlood flood-color="#000" flood-opacity="0.3" result="scl"/><feComposite operator="in" in="scl" in2="sc" result="sh"/><feMerge result="sd"><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sd"/></feMerge></filter>
        </defs>
        <g transform="translate(45,30)">
            <g class="ernest-prong-l"><rect x="145" y="45" width="22" height="90" fill="#b0b5ba" class="eo"/><rect x="160" y="45" width="7" height="90" class="es"/><path d="M140 105H172V120H140Z" fill="#666" class="eo"/><circle cx="156" cy="45" r="11" fill="#b0b5ba" class="eo"/></g>
            <g class="ernest-prong-r"><rect x="255" y="45" width="22" height="90" fill="#b0b5ba" class="eo"/><rect x="270" y="45" width="7" height="90" class="es"/><path d="M250 105H282V120H250Z" fill="#666" class="eo"/><circle cx="266" cy="45" r="11" fill="#b0b5ba" class="eo"/></g>
            <g class="ernest-body">
                <path d="M100 130C80 130 70 145 70 160L70 200C70 230 140 250 140 280L140 450C140 500 280 500 280 450L280 280C280 250 350 230 350 200L350 160C350 145 340 130 320 130Z" fill="#55595f" filter="url(#ecel)"/>
                <path d="M70 165H60V195H70Z" fill="#606469" class="eo"/>
                <path d="M100 130H320C340 130 350 145 350 160V185C350 210 270 230 210 230C150 230 70 210 70 185V160C70 145 80 130 100 130Z" fill="#80858b" filter="url(#ecel)"/>
                <path d="M140 435Q210 445 280 435V450C280 500 140 500 140 450Z" fill="#606469" filter="url(#ecel)"/>
                <path d="M100 130C80 130 70 145 70 160L70 200C70 230 140 250 140 280L140 450C140 500 280 500 280 450L280 280C280 250 350 230 350 200L350 160C350 145 340 130 320 130Z" fill="none" class="eto"/>
                <path d="M100 130H320C340 130 350 145 350 160V185C350 210 270 230 210 230C150 230 70 210 70 185V160C70 145 80 130 100 130Z" fill="none" class="eo"/>
                <path d="M140 435Q210 445 280 435V450C280 500 140 500 140 450Z" fill="none" class="eo"/>
            </g>
            <path d="M125 145H295C315 145 325 152 325 165V180C325 205 260 220 210 220C160 220 95 205 95 180V165C95 152 105 145 125 145Z" fill="#2a2d34" class="eo"/>
            <rect x="110" y="160" width="16" height="8" rx="4" fill="#1e1f24" class="eo"/>
            <text x="135" y="172" class="etw" font-size="28">3</text>
            <text x="235" y="170" class="etw" font-size="20">+/-</text>
            <circle class="ernest-led" cx="278" cy="162" r="7" class="eo" fill="#00ff4c"/><ellipse cx="278" cy="160" rx="3" ry="1.5" fill="#fff" opacity="0.6"/>
            <text x="210" y="212" class="etc" font-size="28" letter-spacing="2" text-anchor="middle">STIM</text>
            <text x="210" y="375" class="etc" font-size="28" letter-spacing="2" text-anchor="middle">STORE</text>
            <text x="210" y="405" class="etc" font-size="24" text-anchor="middle">1</text>
            <text x="210" y="435" class="etc" font-size="24" text-anchor="middle">2</text>
            <circle cx="210" cy="465" r="18" fill="none" class="eo"/>
            <path d="M190 465H202L206 452L214 478L218 465H230" fill="none" stroke="#2a2d34" stroke-width="5" stroke-linejoin="round"/>
            <g class="ernest-face">
                <g class="ernest-brows"><path d="M165 260Q180 245 195 250" fill="none" class="eo"/><path d="M255 260Q240 245 225 250" fill="none" class="eo"/></g>
                <g class="ernest-eyes-open"><ellipse cx="180" cy="285" rx="12" ry="18" fill="#1e1f24"/><circle cx="183" cy="278" r="4" fill="#fff"/><ellipse cx="240" cy="285" rx="12" ry="18" fill="#1e1f24"/><circle cx="243" cy="278" r="4" fill="#fff"/></g>
                <g class="ernest-eyes-closed" style="opacity:0"><path d="M168 285Q180 295 192 285" fill="none" class="eo"/><path d="M228 285Q240 295 252 285" fill="none" class="eo"/></g>
                <rect x="203" y="283" width="14" height="24" rx="7" fill="#606469" class="eo"/><line x1="205" y1="289" x2="215" y2="289" stroke="#2a2d34" stroke-width="4" stroke-linecap="round"/><line x1="205" y1="295" x2="215" y2="295" stroke="#2a2d34" stroke-width="4" stroke-linecap="round"/><line x1="205" y1="301" x2="215" y2="301" stroke="#2a2d34" stroke-width="4" stroke-linecap="round"/>
                <g class="ernest-mouth" transform="translate(78.5,108.75) scale(0.65)"><clipPath id="emc"><path d="M175 315C175 315 210 325 245 315C245 355 175 355 175 315Z"/></clipPath><path d="M175 315C175 315 210 325 245 315C245 355 175 355 175 315Z" fill="#141517" class="eo" stroke-linejoin="round"/><path d="M185 340Q210 315 235 340C235 365 185 365 185 340Z" fill="#ff7675" stroke="#2a2d34" stroke-width="2" clip-path="url(#emc)"/><path d="M168 310Q172 312 175 315" fill="none" class="eo"/><path d="M252 310Q248 312 245 315" fill="none" class="eo"/></g>
            </g>
            <g class="ernest-zaps"><path d="M155 10L140-20 160-35 145-60" fill="none" stroke="#88dded" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M265 10L280-20 260-35 275-60" fill="none" stroke="#88dded" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>
            <g class="ernest-zs">
                <text class="ernest-z1" x="320" y="80" font-family="JetBrains Mono, monospace" font-size="36" font-weight="900" fill="#88dded" stroke="#2a2d34" stroke-width="2">Z</text>
                <text class="ernest-z2" x="335" y="60" font-family="JetBrains Mono, monospace" font-size="28" font-weight="900" fill="#88dded" stroke="#2a2d34" stroke-width="2">z</text>
                <text class="ernest-z3" x="345" y="40" font-family="JetBrains Mono, monospace" font-size="22" font-weight="900" fill="#88dded" stroke="#2a2d34" stroke-width="2">z</text>
            </g>
        </g>
    </svg>`;

    const STYLES = `
    <style id="ernest-module-styles">
    /* ===== WIDGET CONTAINER ===== */
    .ernest-widget {
        --ea: #88dded;
        --ea-rgb: 136,221,237;
        --ea-dim: rgba(136,221,237,0.15);
        --ea-subtle: rgba(136,221,237,0.1);
        --ea-border: rgba(136,221,237,0.3);
        --ea-border-light: rgba(136,221,237,0.2);
        --ea-border-faint: rgba(136,221,237,0.1);
        --ea-border-strong: rgba(136,221,237,0.4);
        --ea-border-bright: rgba(136,221,237,0.7);
        --ea-text-muted: #5a7a95;
        --ea-bg: rgba(12,20,35,0.95);
        --ea-bg-deep: rgba(10,14,26,0.97);
        --ea-bg-input: rgba(20,30,50,0.8);
        position: fixed;
        z-index: 9999;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ernest-widget.bottom-right { bottom: 20px; right: 20px; }
    .ernest-widget.bottom-left { bottom: 20px; left: 20px; }
    .ernest-widget.inline { position: relative; }

    .ernest-char-wrap {
        width: 120px;
        height: 140px;
        cursor: pointer;
        position: relative;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ernest-char-wrap:hover { transform: scale(1.15); }
    .ernest-char-wrap:active { transform: scale(0.95); }

    .ernest-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    }

    /* ===== ANIMATIONS ===== */
    /* All body animations use translateY/rotate only - no scale (the wrapper handles size).
       Magnitudes are scaled down ~5x from the original since the original used scale(0.55). */

    .ernest-svg { transform-origin: 50% 100%; }

    /* Idle bounce */
    .ernest-idle .ernest-svg { animation: ernest-m-bounce 3s ease-in-out infinite; }
    @keyframes ernest-m-bounce {
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-6px)}
    }

    /* Sleeping - deeper, slower breathing */
    .ernest-sleeping .ernest-svg { animation: ernest-m-breathe 4s ease-in-out infinite; }
    @keyframes ernest-m-breathe {
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-9px)}
    }

    /* Thinking - tilted bounce */
    .ernest-thinking .ernest-svg { animation: ernest-m-think 2s ease-in-out infinite; }
    @keyframes ernest-m-think {
        0%,100%{transform:translateY(0) rotate(0)}
        50%{transform:translateY(-10px) rotate(-8deg)}
    }

    /* Excited - heavy bounce with sparks */
    .ernest-excited .ernest-svg { animation: ernest-m-excited 0.6s ease-in-out infinite; }
    @keyframes ernest-m-excited {
        0%,100%{transform:translateY(-10px)}
        50%{transform:translateY(20px)}
    }

    /* Lecturing - lean and point */
    .ernest-lecturing .ernest-svg { animation: ernest-m-lecture 2s ease-in-out infinite; }
    @keyframes ernest-m-lecture {
        0%,100%{transform:translateY(0) rotate(0deg)}
        50%{transform:translateY(-3px) rotate(-6deg) scale(1.05)}
    }

    /* Dancing - left-right rotation */
    .ernest-dancing .ernest-svg { animation: ernest-m-dance 1s ease-in-out infinite alternate; }
    @keyframes ernest-m-dance {
        0%{transform:rotate(-15deg) translateY(-5px)}
        50%{transform:rotate(0deg) translateY(10px)}
        100%{transform:rotate(15deg) translateY(-5px)}
    }

    /* Jumping - extreme leap */
    .ernest-jumping .ernest-svg { animation: ernest-m-jump 0.8s ease-in-out infinite; }
    @keyframes ernest-m-jump {
        0%,100%{transform:translateY(-15px)}
        50%{transform:translateY(30px)}
    }

    /* Waving - rotation only, plays 3 times then settles */
    .ernest-waving .ernest-svg { animation: ernest-m-wave 0.8s ease-in-out 3; }
    @keyframes ernest-m-wave {
        0%,100%{transform:rotate(-10deg) translateY(-5px)}
        50%{transform:rotate(15deg) translateY(5px)}
    }

    /* Pop-out - one-shot dramatic entry */
    .ernest-pop-out .ernest-svg { animation: ernest-m-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes ernest-m-pop {
        0%{transform:translateY(-20px) scale(0.7)}
        40%{transform:translateY(15px) scale(1.15)}
        70%{transform:translateY(-7px) scale(0.95)}
        100%{transform:translateY(0) scale(1)}
    }

    /* Talking - prongs glow + pulse during streamed responses */
    .ernest-talking .ernest-prong-l rect,
    .ernest-talking .ernest-prong-r rect,
    .ernest-talking .ernest-prong-l circle,
    .ernest-talking .ernest-prong-r circle {
        animation: ernest-m-prong-pulse 0.5s ease-in-out infinite alternate;
    }
    @keyframes ernest-m-prong-pulse {
        0%   { fill:#b0b5ba; filter:brightness(1); }
        100% { fill:#c8e0e8; filter:brightness(1.3) drop-shadow(0 0 4px var(--ea, #88dded)); }
    }

    /* Eye blink */
    .ernest-eyes-open { animation: ernest-m-blink 4s infinite; }
    @keyframes ernest-m-blink { 0%,90%,100%{opacity:1} 95%{opacity:0} }
    .ernest-eyes-closed { animation: ernest-m-blink-inv 4s infinite; }
    @keyframes ernest-m-blink-inv { 0%,90%,100%{opacity:0} 95%{opacity:1} }

    /* LED pulse */
    .ernest-led { animation: ernest-m-led 2s ease-in-out infinite; }
    @keyframes ernest-m-led { 0%,100%{opacity:1} 50%{opacity:0.4} }

    /* Snoring Z's (sleeping state) */
    .ernest-zs { opacity: 0; pointer-events:none; }
    .ernest-sleeping .ernest-zs { opacity: 1; }
    .ernest-sleeping .ernest-z1 { animation: ernest-m-float-z 3s ease-out infinite; }
    .ernest-sleeping .ernest-z2 { animation: ernest-m-float-z 3s ease-out infinite 1s; }
    .ernest-sleeping .ernest-z3 { animation: ernest-m-float-z 3s ease-out infinite 2s; }
    @keyframes ernest-m-float-z {
        0%   { transform: translate(0,0)   scale(0.6); opacity:0; }
        20%  { opacity:1; }
        80%  { opacity:1; }
        100% { transform: translate(20px,-50px) scale(1.2); opacity:0; }
    }

    /* ===== EARL'S UNIQUE IDLE ANIMATIONS =====
       Earl gets 6 distinct micro-behaviors that cycle randomly while idle.
       Each one has a different personality flavor. */

    /* 1. Glitch & Sigh - jittery then dramatic drop */
    .earl-glitch-sigh .ernest-svg { animation: earl-m-glitch-sigh 6s ease-in-out infinite; }
    @keyframes earl-m-glitch-sigh {
        0%,5%,10% { transform: translate(0,0); }
        1%,3%,7%,9% { transform: translate(-3px,1px) rotate(-1deg); }
        2%,4%,8% { transform: translate(3px,-1px) rotate(1deg); }
        15% { transform: translateY(15px) rotate(0); }
        40% { transform: translateY(15px); }
        70%,100% { transform: translateY(0); }
    }

    /* 2. Angry Scan - tilt left, tilt right, slam */
    .earl-angry-scan .ernest-svg { animation: earl-m-angry-scan 5s ease-in-out infinite; }
    @keyframes earl-m-angry-scan {
        0%,10%,100% { transform: rotate(0) translateY(0); }
        20%,35% { transform: rotate(-12deg) translateY(3px); }
        45%,60% { transform: rotate(12deg) translateY(3px); }
        70% { transform: rotate(0) translateY(-10px); }
        75% { transform: rotate(0) translateY(13px); }
        85% { transform: rotate(0) translateY(0); }
    }

    /* 3. Engine Stall - sputter and drop */
    .earl-engine-stall .ernest-svg { animation: earl-m-engine-stall 7s ease-in-out infinite; }
    @keyframes earl-m-engine-stall {
        0%,10%,100% { transform: translateY(0); }
        15% { transform: translateY(-20px); }
        20%,25%,30%,35% { transform: translateY(-20px) rotate(-2deg); }
        22%,27%,32% { transform: translateY(-19px) rotate(2deg); }
        40% { transform: translateY(18px); }
        55% { transform: translateY(0); }
    }

    /* 4. Impatient Hop - tilted corner-hops */
    .earl-impatient-hop .ernest-svg { animation: earl-m-impatient-hop 4s ease-in-out infinite; transform-origin: bottom right; }
    @keyframes earl-m-impatient-hop {
        0%,10%,100% { transform: rotate(0) translateY(0); }
        20% { transform: rotate(5deg) translateY(0); }
        25%,35%,45% { transform: rotate(5deg) translateY(-5px); }
        30%,40%,50% { transform: rotate(5deg) translateY(0); }
        60% { transform: rotate(0) translateY(0); }
    }

    /* 5. Power Surge - squash, stretch, jolt */
    .earl-power-surge .ernest-svg { animation: earl-m-power-surge 6s ease-in-out infinite; }
    @keyframes earl-m-power-surge {
        0%,10%,100% { transform: scaleX(1) scaleY(1) translateY(0); opacity:1; }
        30% { transform: scaleX(1.1) scaleY(0.8) translateY(10px); opacity:0.8; }
        35% { transform: scaleX(0.8) scaleY(1.3) translateY(-15px); opacity:1; }
        45% { transform: scaleX(1) scaleY(1) translateY(0); }
    }

    /* 6. Slow Burn - lean in close, snap back */
    .earl-slow-burn .ernest-svg { animation: earl-m-slow-burn 8s ease-in-out infinite; }
    @keyframes earl-m-slow-burn {
        0%,10%,100% { transform: translateY(0) scale(1); }
        50% { transform: scale(1.15) translateY(5px); }
        55% { transform: scale(1) translateY(-3px); }
        60% { transform: scale(1) translateY(0); }
    }

    /* Reduced motion - respect user preference */
    @media (prefers-reduced-motion: reduce) {
        .ernest-svg, .ernest-svg * { animation: none !important; }
        .ernest-led { opacity: 1; }
    }

    .ernest-prong-l { transform-origin:156px 120px; animation:ernest-m-prong 4s ease-in-out infinite; }
    .ernest-prong-r { transform-origin:266px 120px; animation:ernest-m-prong 4.5s ease-in-out infinite 0.5s; }
    @keyframes ernest-m-prong { 0%,100%{transform:rotate(0)} 50%{transform:rotate(3deg)} }

    /* ===== SPEECH BUBBLE (quick messages) ===== */
    .ernest-bubble {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: var(--ea-bg);
        border: 1px solid var(--ea-border);
        border-radius: 8px 8px 0 8px;
        padding: 0.6rem 0.9rem;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        font-size: 0.72rem;
        color: #d0dce8;
        max-width: 220px;
        line-height: 1.4;
        white-space: normal;
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px) scale(0.95);
        transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(var(--ea-rgb),0.05);
        margin-bottom: 8px;
    }
    .ernest-bubble.visible { opacity:1; transform:translateY(0) scale(1); }
    .ernest-bubble::after {
        content:''; position:absolute; bottom:-6px; right:16px; width:12px; height:12px;
        background:var(--ea-bg); border-right:1px solid var(--ea-border);
        border-bottom:1px solid var(--ea-border); transform:rotate(45deg);
    }
    .ernest-bubble .ernest-bubble-name {
        font-weight:700; font-size:0.6rem; text-transform:uppercase;
        letter-spacing:0.08em; margin-bottom:0.25rem; color:var(--ea);
    }

    /* ===== PERSONA TOGGLE ===== */
    .ernest-toggle {
        position:absolute; top:-4px; left:-4px; width:20px; height:20px;
        border-radius:50%; border:2px solid var(--ea-border);
        background:rgba(12,20,35,0.9); cursor:pointer; display:flex;
        align-items:center; justify-content:center; font-size:0.5rem;
        color:var(--ea); font-family:'JetBrains Mono',monospace; font-weight:700;
        transition:all 0.2s; opacity:0;
    }
    .ernest-char-wrap:hover .ernest-toggle { opacity:1; }
    .ernest-toggle:hover { background:var(--ea-dim); transform:scale(1.15); }

    /* ===== HIGHLIGHT TOOLTIP ===== */
    .ernest-tooltip {
        position: absolute;
        z-index: 10000;
        display: none;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.7rem;
        background: var(--ea-bg, rgba(12,20,35,0.95));
        border: 1px solid var(--ea-border-strong, rgba(136,221,237,0.4));
        border-radius: 6px;
        cursor: pointer;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        font-size: 0.68rem;
        color: var(--ea, #88dded);
        font-weight: 600;
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(var(--ea-rgb, 136,221,237),0.1);
        transition: all 0.15s ease;
        user-select: none;
        white-space: nowrap;
        animation: ernest-tooltip-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ernest-tooltip:hover {
        background: rgba(20, 35, 60, 0.95);
        border-color: var(--ea-border-bright, rgba(136,221,237,0.7));
        transform: scale(1.05);
    }
    @keyframes ernest-tooltip-in {
        from { opacity:0; transform:translateY(4px) scale(0.9); }
        to { opacity:1; transform:translateY(0) scale(1); }
    }
    .ernest-tooltip-icon {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: var(--ea-dim);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .ernest-tooltip-icon svg { width:12px; height:12px; }

    /* ===== CHAT PANEL ===== */
    .ernest-chat {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-height: 560px;
        background: var(--ea-bg-deep);
        border: 1px solid var(--ea-border-light);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        z-index: 10001;
        box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(var(--ea-rgb),0.05);
        backdrop-filter: blur(20px);
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
    }
    .ernest-chat.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
    }

    .ernest-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--ea-border-faint);
    }
    .ernest-chat-title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--ea);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .ernest-chat-close {
        width: 24px; height: 24px; border-radius: 4px;
        border: 1px solid var(--ea-border-light);
        background: transparent; color: var(--ea-text-muted); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-family: 'JetBrains Mono', monospace;
        transition: all 0.15s;
    }
    .ernest-chat-close:hover { background:var(--ea-subtle); color:var(--ea); }

    .ernest-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        min-height: 200px;
        max-height: 380px;
        scrollbar-width: thin;
        scrollbar-color: var(--ea-dim) transparent;
    }

    .ernest-msg {
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        font-size: 0.78rem;
        line-height: 1.5;
        max-width: 90%;
        word-wrap: break-word;
        animation: ernest-msg-in 0.25s ease;
    }
    @keyframes ernest-msg-in {
        from { opacity:0; transform:translateY(6px); }
        to { opacity:1; transform:translateY(0); }
    }

    .ernest-msg.user {
        align-self: flex-end;
        background: rgba(68, 138, 255, 0.15);
        border: 1px solid rgba(68, 138, 255, 0.2);
        color: #b8d4f0;
        font-family: 'Inter', sans-serif;
    }
    .ernest-msg.assistant {
        align-self: flex-start;
        background: rgba(var(--ea-rgb),0.06);
        border: 1px solid rgba(var(--ea-rgb),0.12);
        color: #d0dce8;
        font-family: 'Inter', sans-serif;
    }
    .ernest-msg .ernest-msg-name {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.3rem;
        color: var(--ea);
    }
    .ernest-msg.user .ernest-msg-name { color: #448aff; }
    .ernest-msg em { color: var(--ea); font-style: italic; }

    .ernest-msg-loading {
        align-self: flex-start;
        padding: 0.6rem 0.8rem;
        color: var(--ea-text-muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .ernest-dots span {
        display: inline-block;
        width: 5px; height: 5px;
        border-radius: 50%;
        background: var(--ea);
        animation: ernest-dot-pulse 1.4s ease-in-out infinite;
    }
    .ernest-dots span:nth-child(2) { animation-delay: 0.2s; }
    .ernest-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ernest-dot-pulse {
        0%,80%,100% { opacity:0.2; transform:scale(0.8); }
        40% { opacity:1; transform:scale(1.2); }
    }

    .ernest-chat-input-area {
        display: flex;
        gap: 0.4rem;
        padding: 0.6rem 0.75rem;
        border-top: 1px solid var(--ea-border-faint);
    }
    .ernest-chat-input {
        flex: 1;
        background: var(--ea-bg-input);
        border: 1px solid rgba(var(--ea-rgb),0.15);
        border-radius: 6px;
        padding: 0.5rem 0.7rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        color: #d0dce8;
        outline: none;
        transition: border-color 0.2s;
    }
    .ernest-chat-input:focus { border-color: var(--ea-border-strong); }
    .ernest-chat-input::placeholder { color: #3a5a70; }

    .ernest-chat-send {
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        border: 1px solid var(--ea-border);
        background: var(--ea-subtle);
        color: var(--ea);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
    }
    .ernest-chat-send:hover { background:var(--ea-dim); }
    .ernest-chat-send:disabled { opacity:0.4; cursor:not-allowed; }

    .ernest-api-setup {
        padding: 0.75rem;
        text-align: center;
        border-bottom: 1px solid var(--ea-border-faint);
    }
    .ernest-api-setup p {
        font-size: 0.72rem;
        color: var(--ea-text-muted);
        margin-bottom: 0.5rem;
        font-family: 'Inter', sans-serif;
    }
    .ernest-api-input {
        width: 100%;
        background: var(--ea-bg-input);
        border: 1px solid var(--ea-border-light);
        border-radius: 4px;
        padding: 0.4rem 0.6rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.68rem;
        color: #d0dce8;
        outline: none;
        margin-bottom: 0.4rem;
    }
    .ernest-api-save {
        padding: 0.35rem 0.8rem;
        border-radius: 4px;
        border: 1px solid rgba(0, 230, 118, 0.3);
        background: rgba(0, 230, 118, 0.1);
        color: #00e676;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.65rem;
        font-weight: 600;
        cursor: pointer;
    }
    .ernest-api-save:hover { background:rgba(0,230,118,0.2); }

    /* ===== MARKDOWN ELEMENTS IN CHAT ===== */
    .ernest-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.5rem 0;
        font-size: 0.7rem;
        font-family: 'Inter', sans-serif;
    }
    .ernest-table th, .ernest-table td {
        padding: 0.35rem 0.5rem;
        border: 1px solid var(--ea-border-light, rgba(136,221,237,0.2));
        text-align: left;
    }
    .ernest-table th {
        background: var(--ea-subtle, rgba(136,221,237,0.08));
        color: var(--ea, #88dded);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.62rem;
        letter-spacing: 0.05em;
    }
    .ernest-table td { color: #c0ccda; }
    .ernest-inline-code {
        background: var(--ea-dim, rgba(136,221,237,0.15));
        color: var(--ea, #88dded);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.72rem;
    }
    .ernest-h {
        color: var(--ea, #88dded);
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0.6rem 0 0.3rem;
    }

    @media (max-width: 480px) {
        .ernest-chat { width: calc(100vw - 24px); right: 12px; bottom: 12px; max-height: 70vh; }
    }
    </style>`;

    // ===== REFLEXES (instant in-character responses, no API call) =====
    // Keys are lowercase. Match runs against full lowercased query, exact word boundary.
    const REFLEXES = {
        // PM&R high-frequency
        'asia':            { ernest: "ASIA scale! The American Spinal Injury Association impairment scale - your gold standard for SCI classification. A=complete, E=normal. Always check sacral sparing!", earl: "ASIA. The exam every resident pretends to remember and then fumbles at the bedside. Sacral sparing. Light touch AND pinprick. Try not to skip it." },
        'dermatomes':      { ernest: "Dermatomes! C5 deltoid patch, C6 thumb, C7 middle finger, C8 pinky, T4 nipples, T10 umbilicus, L4 medial calf, L5 dorsum of foot, S1 lateral foot. The map of the body!", earl: "Dermatomes. The thing you'll mix up under pressure. T4 nipples. T10 umbilicus. L1 inguinal. Memorize them or be useless." },
        'myotomes':        { ernest: "Myotomes! C5 elbow flex, C6 wrist ext, C7 elbow ext, C8 finger flex, T1 finger abd, L2 hip flex, L3 knee ext, L4 ankle dorsi, L5 great toe ext, S1 plantar flex.", earl: "Myotomes. If you can't recite them by C-level you have no business near a spinal cord patient." },
        'fim':             { ernest: "FIM - Functional Independence Measure! 18 items, 7-point scale (1=total assist, 7=complete independence). Motor + cognitive subscales. Used for rehab progress.", earl: "FIM. An 18-item ordinal score that everyone games to justify length of stay. Useful, sure. Pure? No." },
        'mmt':             { ernest: "Manual Muscle Testing! 0=no contraction, 1=flicker, 2=move with gravity eliminated, 3=full ROM against gravity, 4=against some resistance, 5=normal strength.", earl: "MMT. Subjective. Inter-rater reliability is mediocre. But you'll grade it anyway, so do it consistently. 0 to 5. Don't say '4 plus.'" },
        'rom':             { ernest: "Range of Motion! Active vs passive. Document in degrees. Compare to contralateral. Always note end-feel - bony, soft, capsular, empty.", earl: "Range of motion. Active and passive. If you can't tell the difference between hard end-feel and empty end-feel you're guessing." },
        'gait':            { ernest: "Gait analysis! Stance phase 60%, swing 40%. Watch for Trendelenburg, foot drop, antalgic, ataxic, spastic, scissoring. Each tells a neuro story.", earl: "Gait. Stance 60, swing 40. Watch the patient walk before you touch them. Most diagnoses walk in the door." },
        'orthostasis':     { ernest: "Orthostatic hypotension! Drop of >=20 SBP or >=10 DBP within 3 min of standing. Common in SCI above T6, autonomic dysfunction, or volume depletion.", earl: "Orthostasis. Twenty systolic or ten diastolic. Three minutes. If you didn't wait the three minutes you didn't measure it." },
        'autonomic dysreflexia': { ernest: "Autonomic Dysreflexia! Emergency in SCI above T6! HTN spike, headache, sweating above lesion. Find the noxious stimulus - usually bladder or bowel. Sit up, loosen, drain catheter!", earl: "AD. Above T6. You have minutes before they stroke out. Sit them up. Loosen everything. Find the noxious stimulus. Usually a kinked Foley. It's always the Foley." },
        'spasticity':      { ernest: "Spasticity! Velocity-dependent increase in tonic stretch reflex. Modified Ashworth Scale 0-4. Treatment ladder: stretching, oral meds, botox, ITB pump, surgery.", earl: "Spasticity. Velocity dependent. That's the WHOLE definition. If it's not velocity dependent it's rigidity. Don't conflate them." },
        'baclofen':        { ernest: "Baclofen! GABA-B agonist for spasticity. Oral 5-80mg/day TID. ITB pump for severe cases. Watch for sedation, weakness, and NEVER stop abruptly - withdrawal is life-threatening.", earl: "Baclofen. GABA-B. If you stop it abruptly the patient seizes, hallucinates, and can die. Taper. Always taper." },
        'botox':           { ernest: "Botulinum toxin! Cleaves SNAP-25, blocks ACh release at NMJ. Onset 3-5 days, peak 2 weeks, duration 3-4 months. Dose units vary - onabotA != aboboA.", earl: "Botox. SNAP-25. Don't interchange the brands. The unit conversions are wrong and you'll under or overdose." },
        'phenol':          { ernest: "Phenol nerve block! Chemical neurolysis. Cheaper and longer than botox but motor point or nerve trunk delivery, dysesthesia risk, and skill-dependent.", earl: "Phenol. Old-school. Cheap. Painful injection. Causes dysesthesias. Use it when botox is contraindicated or too expensive." },
        'modified ashworth': { ernest: "Modified Ashworth Scale! 0=no increase, 1=catch and release, 1+=catch + minimal resistance through <half ROM, 2=more marked, 3=considerable, 4=rigid.", earl: "Ashworth. Subjective. The 1+ category was added because the original scale wasn't granular enough. It's still bad. Use it anyway." },
        'tardieu':         { ernest: "Tardieu Scale! Better than Ashworth because it accounts for velocity. V1=slow, V2=gravity, V3=fast. Compares angle of catch at different speeds.", earl: "Tardieu. Velocity dependent which is the whole point of measuring spasticity. Why we still use Ashworth more is anyone's guess." },
        'emg':             { ernest: "Electromyography! Needle EMG looks at motor unit action potentials. Insertional activity, spontaneous activity (fibs/PSWs), recruitment, MUAP morphology.", earl: "EMG. Needle in muscle. Insertional, spontaneous, voluntary. If you don't understand recruitment patterns you can't read it. Period." },
        'ncs':             { ernest: "Nerve Conduction Study! Stimulate, record. Latency, amplitude, conduction velocity. Demyelination slows velocity, axonal loss drops amplitude.", earl: "NCS. Demyelination drops velocity. Axonal loss drops amplitude. If you remember nothing else, remember that." },
        'fibs':             { ernest: "Fibrillation potentials! Spontaneous discharges from denervated muscle fibers. Take 2-4 weeks to appear. Hallmark of denervation.", earl: "Fibrillations. Two to four weeks post-denervation. If you needle a patient day 3 and don't see them you haven't ruled out anything." },
        'psw':             { ernest: "Positive Sharp Waves! Like fibs - spontaneous activity from denervated muscle. Same significance. Diphasic, positive deflection then long negative.", earl: "PSWs. Same significance as fibs. Different morphology. Don't grade them separately like they mean different things." },
        'cmap':            { ernest: "Compound Muscle Action Potential! Sum of all motor unit responses to nerve stimulation. Amplitude reflects axon count. Latency reflects fastest conducting fibers.", earl: "CMAP. Amplitude = axons. Latency = fastest fibers. If amplitude drops the axons died. It's not complicated." },
        'snap':            { ernest: "Sensory Nerve Action Potential! Smaller than CMAP, more sensitive to early neuropathy. Absent SNAPs = postganglionic lesion (radiculopathies spare SNAPs).", earl: "SNAPs. Spared in radiculopathy because the lesion is preganglionic. If the SNAP is gone, it's NOT a radic." },
        'h reflex':        { ernest: "H-reflex! Monosynaptic reflex, electrical analog of ankle jerk. S1 root function. Absent or delayed in S1 radiculopathy.", earl: "H reflex. S1. If it's gone bilaterally, that's age. If it's gone unilaterally, that's pathology." },
        'f wave':          { ernest: "F-wave! Late response from antidromic stimulation activating anterior horn cells. Tests proximal nerve segments. Useful in early GBS.", earl: "F-waves. Antidromic. Proximal. Early GBS. Boring physics, useful clinically." },
        'gbs':             { ernest: "Guillain-Barre! Acute inflammatory demyelinating polyneuropathy. Ascending weakness, areflexia, albuminocytologic dissociation in CSF. IVIG or PLEX.", earl: "GBS. Ascending. Areflexia. Don't wait for the LP if the clinical picture is obvious. IVIG or plasmapheresis. Steroids do NOTHING here." },
        'cidp':            { ernest: "Chronic Inflammatory Demyelinating Polyneuropathy! Like GBS but >8 weeks. Responds to steroids, IVIG, or PLEX. Check for symmetric proximal AND distal weakness.", earl: "CIDP. Eight weeks or more. The slow cousin of GBS. Steroids actually work here. That's the only difference that matters for treatment." },
        'als':             { ernest: "Amyotrophic Lateral Sclerosis! Combined UMN + LMN signs without sensory involvement. EMG shows widespread fibs/PSWs in 3+ regions. Riluzole, edaravone.", earl: "ALS. UMN plus LMN. No sensory. Three of four regions on EMG. The diagnosis nobody wants to make and nobody wants to receive." },
        'tbi':             { ernest: "Traumatic Brain Injury! GCS <=8 severe, 9-12 moderate, 13-15 mild. Watch for autonomic storming, dysphagia, agitation. Rancho Los Amigos for cognitive recovery.", earl: "TBI. GCS is a starting point not the diagnosis. Rancho scale matters more for rehab planning. Learn it." },
        'rancho':          { ernest: "Rancho Los Amigos Scale! 8 levels of cognitive recovery from coma to purposeful behavior. Useful framework for TBI rehab planning.", earl: "Rancho. Eight levels. Memorize them. They drive your rehab plan whether you admit it or not." },
        'cva':             { ernest: "Cerebrovascular Accident! Ischemic 87%, hemorrhagic 13%. Time is brain. tPA window 4.5h, thrombectomy up to 24h with imaging selection.", earl: "CVA. Time is brain. Stop calling it a stroke and call it what it is to the family. They need to understand." },
        'nihss':           { ernest: "NIH Stroke Scale! 15-item, 0-42. Measures stroke severity. >=6 typically thrombectomy candidates. Memorize the items - LOC, gaze, visual fields, facial palsy, motor, sensory, language, dysarthria, neglect.", earl: "NIHSS. Fifteen items. If you can't do it from memory at the bedside you have no business calling neurology." },
        'mri':             { ernest: "MRI! Magnetic Resonance Imaging. T1 anatomy, T2 fluid bright, FLAIR for white matter lesions, DWI for acute stroke. No radiation but check for pacemakers and implants.", earl: "MRI. The 'Millionaire's Rorschach Image.' Useless for functional diagnostics. Order it when the question is anatomical." },
        'ortho':           { ernest: "Orthopedics! Structural specialists - fractures, joints, hardware. Excellent partners for post-surgical rehab planning.", earl: "Orthopedics. Bone Carpenters. Strong as an ox and nearly as smart. We get the patients after they break things." },
        '60hz':            { ernest: "60Hz interference! The song of the power grid. Check your ground, your prep, your cables. Common artifact in EMG/NCS recordings.", earl: "60Hz noise. The sound of incompetence. Check your ground. Check your patient. Check yourself." },
        'cuccurullo':      { ernest: "Cuccurullo! THE PM&R board review book. The blue bible. If it's not in Cuccurullo it's probably not on the boards.", earl: "Cuccurullo. The book you should have read before showing up. If you're asking me what's in it you haven't read it." },
        'delisas':         { ernest: "DeLisa's Physical Medicine and Rehabilitation! The comprehensive PM&R reference textbook. Deep dives on every topic.", earl: "DeLisa. Five pounds. Two volumes. Read the chapter you need. Don't try to read the whole thing." },
        'preston shapiro': { ernest: "Preston and Shapiro! THE EMG/NCS reference book. Pattern-based approach. Every electromyographer needs it.", earl: "Preston and Shapiro. If you're doing electrodiagnostics without it you're guessing." },
        // Module-specific shortcuts (used on landing page)
        'where do i start':{ ernest: "Great question! On the landing page you can see all 12 modules. If you're starting PM&R study, hit Midnight Board Review or Oral Boards. If you're prepping for a procedure, US Guided Injections or Interventional Spine. Want me to recommend based on a topic?", earl: "Where to start? Pick a module. Click it. They all work. Stop overthinking it." },
        'what should i learn': { ernest: "Depends on your goal! Boards prep -> Midnight Board Review + PMR Flashcards. Procedures -> US Guided Injections, Interventional Spine, Spasticity. Inpatient rotations -> SCI, TBI, CVA, Peds Rehab. Tell me what rotation you're on and I'll narrow it!", earl: "What should you learn? Whatever you're weakest at. Which is presumably everything. Pick a module." },
        'help':            { ernest: "I'm here to help! Highlight any text on a page and click the tooltip to ask me about it. Or click my body to open the chat. I know PM&R, EMG, rehab medicine, and the modules in this hub.", earl: "Help. Right. Highlight text. Click me. Type a question. It's not complicated." }
    };

    // ===== STATE =====
    let currentPersona = 'ernest';
    let currentMood = 'idle';
    let bubbleTimer = null;
    let idleTimer = null; // legacy reference - inactivityCheckTimer is the active one
    let widget = null;
    let chatEl = null;
    let tooltipEl = null;
    let currentSelection = null;
    let conversationHistory = [];
    let isThinking = false;
    let apiKey = null;
    let config = {};
    let pageContext = '';

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    // ===== REFLEX MATCHING =====
    // Returns the canned response for the current persona if any reflex key matches the query, else null.
    // Matches are case-insensitive and prefer the LONGEST matching key (so "modified ashworth" wins over "ashworth").
    function checkReflex(query) {
        if (!query) return null;
        var lower = query.toLowerCase();
        var matched = null;
        var matchedLen = 0;
        for (var key in REFLEXES) {
            if (!REFLEXES.hasOwnProperty(key)) continue;
            // Word-boundary-ish check: key must be surrounded by non-letters or string edges
            var idx = lower.indexOf(key);
            if (idx === -1) continue;
            var before = idx === 0 ? ' ' : lower.charAt(idx - 1);
            var after = (idx + key.length) >= lower.length ? ' ' : lower.charAt(idx + key.length);
            if (/[a-z0-9]/.test(before) || /[a-z0-9]/.test(after)) continue;
            if (key.length > matchedLen) {
                matched = REFLEXES[key];
                matchedLen = key.length;
            }
        }
        return matched ? (matched[currentPersona] || matched.ernest) : null;
    }

    // ===== PAGE CONTEXT =====
    // Builds a description of the current page that gets injected into the system prompt.
    // Three sources, in priority order:
    //   1. config.context  (string)  - explicit override
    //   2. config.contextSelector (CSS) - extract data from DOM elements
    //   3. fallback: just the document title
    function buildPageContext() {
        if (config.context && typeof config.context === 'string') {
            return config.context;
        }

        var parts = [];
        var title = (document.title || '').trim();
        if (title) parts.push('Page title: "' + title + '"');

        var selector = config.contextSelector || '.card';
        var nodes = document.querySelectorAll(selector);
        if (nodes && nodes.length) {
            var modules = [];
            for (var i = 0; i < nodes.length && i < 30; i++) {
                var n = nodes[i];
                var titleEl = n.querySelector('.card-title') || n.querySelector('h1, h2, h3, h4');
                var descEl = n.querySelector('.card-desc') || n.querySelector('p');
                var href = n.getAttribute('href') || '';
                if (titleEl) {
                    var line = '- ' + titleEl.textContent.trim();
                    if (descEl) line += ': ' + descEl.textContent.trim();
                    if (href) line += ' (' + href + ')';
                    modules.push(line);
                }
            }
            if (modules.length) {
                parts.push('Available modules on this page:\n' + modules.join('\n'));
            }
        }

        return parts.join('\n\n');
    }

    // ===== INIT =====
    function createWidget(options) {
        if (widget) destroy();

        config = Object.assign({
            position: 'bottom-right',
            persona: 'ernest',
            size: 100,
            greeting: true,
            idleChat: true,
            idleInterval: 45000,
            apiKey: null,
            geminiModel: 'gemini-2.0-flash',
            target: null
        }, options);

        currentPersona = config.persona;
        apiKey = config.apiKey || localStorage.getItem('ernest-api-key');
        // Build page context once on init. Apps that re-render content can call Ernest.refreshContext() later.
        pageContext = buildPageContext();

        if (!document.getElementById('ernest-module-styles')) {
            document.head.insertAdjacentHTML('beforeend', STYLES);
        }

        // Widget (character)
        widget = document.createElement('div');
        widget.className = 'ernest-widget ' + config.position;
        widget.setAttribute('role', 'complementary');
        widget.setAttribute('aria-label', 'Ernest - Training Companion');
        widget.innerHTML =
            '<div class="ernest-bubble" aria-live="polite">' +
                '<div class="ernest-bubble-name">Ernest</div>' +
                '<div class="ernest-bubble-text"></div>' +
            '</div>' +
            '<div class="ernest-char-wrap ernest-idle" style="width:' + config.size + 'px;height:' + (config.size * 1.17) + 'px">' +
                '<div class="ernest-toggle" title="Switch persona">E</div>' +
                SVG_TEMPLATE +
            '</div>';

        if (config.position === 'inline' && config.target) {
            var target = document.querySelector(config.target);
            if (target) target.appendChild(widget);
        } else {
            document.body.appendChild(widget);
        }

        // Chat panel
        createChatPanel();

        // Tooltip
        createTooltip();

        // Events
        widget.querySelector('.ernest-char-wrap').addEventListener('click', handleCharClick);
        widget.querySelector('.ernest-toggle').addEventListener('click', function (e) {
            e.stopPropagation();
            switchPersona(currentPersona === 'ernest' ? 'earl' : 'ernest');
        });

        // Selection listeners
        document.addEventListener('mouseup', handleSelectionEvent);
        document.addEventListener('touchend', handleSelectionEvent);
        document.addEventListener('mousedown', function (e) {
            if (tooltipEl && !e.target.closest('.ernest-tooltip')) {
                tooltipEl.style.display = 'none';
            }
        });

        // Real activity tracking - resets the inactivity timer
        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(function (evt) {
            document.addEventListener(evt, noteUserActivity, { passive: true });
        });

        applyPersona();

        if (config.greeting) {
            setTimeout(function () {
                speak(pickRandom(PERSONAS[currentPersona].greetings));
                setMood('waving');
                setTimeout(function () { setMood('idle'); }, 2400);
            }, 800);
        }

        if (config.idleChat) startIdleTimer();
    }

    // ===== CHAT PANEL =====
    function createChatPanel() {
        chatEl = document.createElement('div');
        chatEl.className = 'ernest-chat';
        chatEl.innerHTML =
            '<div class="ernest-chat-header">' +
                '<div class="ernest-chat-title">Ernest</div>' +
                '<button class="ernest-chat-close" title="Close">X</button>' +
            '</div>' +
            (apiKey ? '' :
                '<div class="ernest-api-setup">' +
                    '<p>Enter your Gemini API key to enable AI explanations.</p>' +
                    '<input type="text" class="ernest-api-input" placeholder="AIza...">' +
                    '<button class="ernest-api-save">Save Key</button>' +
                '</div>'
            ) +
            '<div class="ernest-chat-messages"></div>' +
            '<div class="ernest-chat-input-area">' +
                '<input type="text" class="ernest-chat-input" placeholder="Ask me anything...">' +
                '<button class="ernest-chat-send">Send</button>' +
            '</div>';

        document.body.appendChild(chatEl);

        // Event listeners
        chatEl.querySelector('.ernest-chat-close').addEventListener('click', closeChat);
        chatEl.querySelector('.ernest-chat-send').addEventListener('click', handleSend);
        chatEl.querySelector('.ernest-chat-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // API key save
        var apiSave = chatEl.querySelector('.ernest-api-save');
        if (apiSave) {
            apiSave.addEventListener('click', function () {
                var input = chatEl.querySelector('.ernest-api-input');
                var key = input.value.trim();
                if (key && key.startsWith('AIza')) {
                    apiKey = key;
                    localStorage.setItem('ernest-api-key', key);
                    var setup = chatEl.querySelector('.ernest-api-setup');
                    if (setup) setup.remove();
                    addChatMessage('assistant', 'Systems online. Ask me anything or highlight text on the page!');
                }
            });
        }
    }

    function openChat() {
        if (!chatEl) return;
        chatEl.classList.add('open');
        widget.style.display = 'none';
        chatEl.querySelector('.ernest-chat-input').focus();
    }

    function closeChat() {
        if (!chatEl) return;
        chatEl.classList.remove('open');
        widget.style.display = '';
    }

    function isChatOpen() {
        return chatEl && chatEl.classList.contains('open');
    }

    function addChatMessage(role, text) {
        var messages = chatEl.querySelector('.ernest-chat-messages');
        var msg = document.createElement('div');
        msg.className = 'ernest-msg ' + (role === 'user' ? 'user' : 'assistant');

        var nameText = role === 'user' ? 'You' : PERSONAS[currentPersona].name;
        msg.innerHTML = '<div class="ernest-msg-name">' + nameText + '</div>' + formatText(text);

        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showLoadingMessage() {
        var messages = chatEl.querySelector('.ernest-chat-messages');
        var loading = document.createElement('div');
        loading.className = 'ernest-msg-loading';
        loading.id = 'ernest-loading';
        var personaMsgs = PERSONAS[currentPersona].loadingMessages;
        var loadingText = (personaMsgs && personaMsgs.length) ? pickRandom(personaMsgs) : 'Thinking...';
        loading.innerHTML = '<div class="ernest-dots"><span></span><span></span><span></span></div> ' + escapeHtml(loadingText);
        messages.appendChild(loading);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeLoadingMessage() {
        var el = document.getElementById('ernest-loading');
        if (el) el.remove();
    }

    // ===== MARKDOWN PARSER =====
    // Order of operations matters: escape, then math symbols, then code (so we don't process inside code),
    // then tables (block-level), then bold/italic/headings, then newlines.
    var MATH_SYMBOLS = {
        '\\\\mu': 'μ', '\\\\alpha': 'α', '\\\\beta': 'β', '\\\\gamma': 'γ',
        '\\\\delta': 'δ', '\\\\Delta': 'Δ', '\\\\theta': 'θ', '\\\\lambda': 'λ',
        '\\\\sigma': 'σ', '\\\\omega': 'ω', '\\\\Omega': 'Ω', '\\\\pi': 'π',
        '\\\\le': '\u2264', '\\\\ge': '\u2265', '\\\\ne': '\u2260',
        '\\\\pm': '\u00b1', '\\\\times': '\u00d7', '\\\\div': '\u00f7',
        '\\\\to': '\u2192', '\\\\rightarrow': '\u2192', '\\\\leftarrow': '\u2190',
        '\\\\infty': '\u221e', '\\\\degrees': '\u00b0'
    };

    function applyMathSymbols(s) {
        for (var k in MATH_SYMBOLS) {
            s = s.replace(new RegExp(k, 'g'), MATH_SYMBOLS[k]);
        }
        return s;
    }

    function isTableSeparator(line) {
        return /^\s*\|?\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?\s*$/.test(line);
    }

    function parseTable(lines, startIdx) {
        // Returns { html, consumed } if a valid table starts at startIdx, else null
        if (startIdx + 1 >= lines.length) return null;
        var headerLine = lines[startIdx];
        var sepLine = lines[startIdx + 1];
        if (!headerLine.includes('|') || !isTableSeparator(sepLine)) return null;

        var splitRow = function (row) {
            return row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); });
        };

        var headers = splitRow(headerLine);
        var bodyRows = [];
        var i = startIdx + 2;
        while (i < lines.length && lines[i].includes('|') && !isTableSeparator(lines[i])) {
            bodyRows.push(splitRow(lines[i]));
            i++;
        }

        var html = '<table class="ernest-table"><thead><tr>';
        headers.forEach(function (h) { html += '<th>' + h + '</th>'; });
        html += '</tr></thead><tbody>';
        bodyRows.forEach(function (row) {
            html += '<tr>';
            row.forEach(function (cell) { html += '<td>' + cell + '</td>'; });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return { html: html, consumed: i - startIdx };
    }

    function formatText(text) {
        var safe = escapeHtml(text);
        safe = applyMathSymbols(safe);

        // Code spans first (so other transforms don't run inside them)
        safe = safe.replace(/`([^`]+?)`/g, '<code class="ernest-inline-code">$1</code>');

        // Process line-by-line for tables and headings
        var lines = safe.split('\n');
        var out = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // Headings
            var hMatch = line.match(/^(#{1,3})\s+(.+)$/);
            if (hMatch) {
                var level = hMatch[1].length + 2; // ## -> h4, ### -> h5
                out.push('<h' + level + ' class="ernest-h">' + hMatch[2] + '</h' + level + '>');
                continue;
            }
            // Tables
            if (line.includes('|')) {
                var table = parseTable(lines, i);
                if (table) {
                    out.push(table.html);
                    i += table.consumed - 1;
                    continue;
                }
            }
            out.push(line);
        }
        safe = out.join('\n');

        // Inline transforms
        safe = safe
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
            .replace(/_([a-zA-Z0-9+\-]+)/g, '<sub>$1</sub>')
            .replace(/\^([a-zA-Z0-9+\-]+)/g, '<sup>$1</sup>')
            .replace(/\n/g, '<br>');

        // Tables produce block elements - strip the <br> right after them
        safe = safe.replace(/<\/table><br>/g, '</table>');
        safe = safe.replace(/<\/h([4-6])><br>/g, '</h$1>');

        return safe;
    }

    // ===== HIGHLIGHT TOOLTIP =====
    function createTooltip() {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'ernest-tooltip';
        tooltipEl.innerHTML =
            '<div class="ernest-tooltip-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
            '</div>' +
            '<span>Ask ' + PERSONAS[currentPersona].name + '</span>';

        document.body.appendChild(tooltipEl);

        tooltipEl.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            tooltipEl.style.display = 'none';
            if (currentSelection) {
                handleHighlightExplain(currentSelection);
            }
        });
    }

    function handleSelectionEvent() {
        setTimeout(function () {
            var selection = window.getSelection();
            var text = selection.toString().trim();

            if (text.length > 3 && !isThinking && selection.rangeCount > 0) {
                var range = selection.getRangeAt(0);
                var rect = range.getBoundingClientRect();
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                // Don't show tooltip on chat panel or widget text
                var container = range.commonAncestorContainer;
                if (container.nodeType === 3) container = container.parentNode;
                if (container.closest && (container.closest('.ernest-chat') || container.closest('.ernest-widget'))) return;

                tooltipEl.querySelector('span').textContent = 'Ask ' + PERSONAS[currentPersona].name;

                tooltipEl.style.top = (rect.bottom + scrollTop + 8) + 'px';
                tooltipEl.style.left = (rect.left + scrollLeft + (rect.width / 2) - 60) + 'px';
                tooltipEl.style.display = 'flex';
                currentSelection = text;

                // If chat is already open, auto-populate the input field
                if (isChatOpen()) {
                    var input = chatEl.querySelector('.ernest-chat-input');
                    if (input) {
                        input.value = 'Can you explain: "' + text + '"?';
                        input.focus();
                    }
                }
            } else {
                tooltipEl.style.display = 'none';
            }
        }, 200);
    }

    // ===== AI INTERACTION =====
    function handleCharClick() {
        if (isChatOpen()) {
            closeChat();
        } else {
            openChat();
            if (!apiKey) {
                // Show setup prompt
            } else if (chatEl.querySelector('.ernest-chat-messages').children.length === 0) {
                addChatMessage('assistant', pickRandom(PERSONAS[currentPersona].greetings) + ' Highlight any text on the page, or type a question below.');
            }
        }
    }

    function handleSend() {
        var input = chatEl.querySelector('.ernest-chat-input');
        var text = input.value.trim();
        if (!text || isThinking) return;
        input.value = '';
        ask(text);
    }

    function handleHighlightExplain(text) {
        openChat();
        addChatMessage('user', '"' + text + '"');

        // Check reflexes first - instant response, no API call
        var reflex = checkReflex(text);
        if (reflex) {
            var opener = pickRandom(PERSONAS[currentPersona].highlightOpeners);
            addChatMessage('assistant', opener + ' ' + reflex);
            conversationHistory.push({ role: 'user', parts: [{ text: text }] });
            conversationHistory.push({ role: 'model', parts: [{ text: reflex }] });
            return;
        }

        var openerText = pickRandom(PERSONAS[currentPersona].highlightOpeners);
        var query = '[HIGHLIGHT_MODE]: "' + text + '"\n(Instruction: The user highlighted this text for an explanation. Start with "' + openerText + '" then provide a concise 2-3 sentence clinical high-yield explanation in your persona.)';

        conversationHistory.push({ role: 'user', parts: [{ text: query }] });
        callGemini(query);
    }

    function ask(text, isHighlight) {
        if (!text || isThinking) return;

        addChatMessage('user', text);

        // Check reflexes first - instant response, no API call
        var reflex = checkReflex(text);
        if (reflex) {
            addChatMessage('assistant', reflex);
            conversationHistory.push({ role: 'user', parts: [{ text: text }] });
            conversationHistory.push({ role: 'model', parts: [{ text: reflex }] });
            return;
        }

        var query = isHighlight
            ? '[HIGHLIGHT_MODE]: "' + text + '"\n(Instruction: Explain this highlighted text.)'
            : text;

        conversationHistory.push({ role: 'user', parts: [{ text: query }] });
        callGemini(query);
    }

    function addStreamingMessage() {
        var messages = chatEl.querySelector('.ernest-chat-messages');
        var msg = document.createElement('div');
        msg.className = 'ernest-msg assistant';
        msg.id = 'ernest-streaming';
        var nameText = PERSONAS[currentPersona].name;
        msg.innerHTML = '<div class="ernest-msg-name">' + escapeHtml(nameText) + '</div><span class="ernest-stream-text"></span>';
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
        return msg.querySelector('.ernest-stream-text');
    }

    function finalizeStreamingMessage(fullText) {
        var el = document.getElementById('ernest-streaming');
        if (el) {
            el.id = '';
            var textSpan = el.querySelector('.ernest-stream-text');
            if (textSpan) textSpan.outerHTML = formatText(fullText);
        }
    }

    async function callGemini(query) {
        if (!apiKey) {
            addChatMessage('assistant', 'I need an API key to answer. Click the setup area at the top of this chat to add your Gemini key.');
            return;
        }

        isThinking = true;
        setMood('thinking');
        showLoadingMessage();

        var sendBtn = chatEl.querySelector('.ernest-chat-send');
        sendBtn.disabled = true;

        var persona = PERSONAS[currentPersona];
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + config.geminiModel + ':streamGenerateContent?alt=sse&key=' + apiKey;

        // Build system prompt: persona + page context (if any)
        var fullSystemPrompt = persona.systemPrompt;
        if (pageContext) {
            fullSystemPrompt += '\n\nPAGE CONTEXT (where the user currently is):\n' + pageContext + '\n\nUse this context to give relevant answers. If the user asks "what should I learn" or "where do I start" or about modules, recommend specific modules from the list above.';
        }

        var body = {
            contents: conversationHistory.slice(-10),
            systemInstruction: { parts: [{ text: fullSystemPrompt }] },
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        };

        try {
            var response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                var err = await response.json().catch(function () { return {}; });
                throw new Error(err.error ? err.error.message : 'API error ' + response.status);
            }

            removeLoadingMessage();
            // Trigger talking animation - prongs glow + pulse during streaming
            if (widget) {
                var wrap = widget.querySelector('.ernest-char-wrap');
                if (wrap) wrap.classList.add('ernest-talking');
            }
            var streamSpan = addStreamingMessage();
            var fullText = '';
            var messages = chatEl.querySelector('.ernest-chat-messages');

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            while (true) {
                var result = await reader.read();
                if (result.done) break;

                buffer += decoder.decode(result.value, { stream: true });
                var lines = buffer.split('\n');
                buffer = lines.pop();

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line.startsWith('data: ')) continue;
                    var jsonStr = line.slice(6);
                    if (!jsonStr || jsonStr === '[DONE]') continue;

                    try {
                        var chunk = JSON.parse(jsonStr);
                        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content) {
                            var parts = chunk.candidates[0].content.parts;
                            if (parts && parts[0] && parts[0].text) {
                                fullText += parts[0].text;
                                streamSpan.textContent = fullText;
                                messages.scrollTop = messages.scrollHeight;
                            }
                        }
                    } catch (parseErr) { /* skip malformed chunks */ }
                }
            }

            if (!fullText) fullText = 'No response generated.';
            finalizeStreamingMessage(fullText);

            conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });
            if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);
        } catch (e) {
            removeLoadingMessage();
            var streamEl = document.getElementById('ernest-streaming');
            if (streamEl) streamEl.remove();
            var errMsg = currentPersona === 'earl'
                ? 'Connection severed. Check your API key or Wi-Fi. Error: ' + e.message
                : 'Signal lost! Error: ' + e.message;
            addChatMessage('assistant', errMsg);
        }

        // Stop talking animation
        if (widget) {
            var wrapEnd = widget.querySelector('.ernest-char-wrap');
            if (wrapEnd) wrapEnd.classList.remove('ernest-talking');
        }
        isThinking = false;
        setMood('idle');
        sendBtn.disabled = false;
    }

    // ===== EXISTING WIDGET FUNCTIONS =====
    function speak(text, duration) {
        if (!widget) return;
        duration = duration || 4000;

        var bubble = widget.querySelector('.ernest-bubble');
        var nameEl = bubble.querySelector('.ernest-bubble-name');
        var textEl = bubble.querySelector('.ernest-bubble-text');

        nameEl.textContent = PERSONAS[currentPersona].name;
        textEl.textContent = text;

        bubble.classList.add('visible');

        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(function () {
            bubble.classList.remove('visible');
        }, duration);

        resetIdleTimer();
    }

    var EARL_IDLE_VARIANTS = ['earl-glitch-sigh', 'earl-angry-scan', 'earl-engine-stall', 'earl-impatient-hop', 'earl-power-surge', 'earl-slow-burn'];
    var earlIdleTimer = null;

    function applyEarlIdleVariant() {
        if (!widget || currentPersona !== 'earl' || currentMood !== 'idle') return;
        var wrap = widget.querySelector('.ernest-char-wrap');
        // Strip any existing earl-* classes
        wrap.className = wrap.className.replace(/\bearl-[a-z-]+\b/g, '').trim();
        wrap.classList.add(pickRandom(EARL_IDLE_VARIANTS));
    }

    function startEarlIdleCycle() {
        clearInterval(earlIdleTimer);
        if (currentPersona !== 'earl') return;
        applyEarlIdleVariant();
        // Cycle through Earl's micro-behaviors every 8s
        earlIdleTimer = setInterval(applyEarlIdleVariant, 8000);
    }

    function stopEarlIdleCycle() {
        clearInterval(earlIdleTimer);
        earlIdleTimer = null;
        if (widget) {
            var wrap = widget.querySelector('.ernest-char-wrap');
            if (wrap) wrap.className = wrap.className.replace(/\bearl-[a-z-]+\b/g, '').trim();
        }
    }

    function setMood(mood) {
        if (!widget) return;
        currentMood = mood;
        var wrap = widget.querySelector('.ernest-char-wrap');
        wrap.className = 'ernest-char-wrap ernest-' + mood;
        wrap.style.width = config.size + 'px';
        wrap.style.height = (config.size * 1.17) + 'px';
        // Earl's idle cycling kicks in only when idle and persona is earl
        if (currentPersona === 'earl' && mood === 'idle') {
            startEarlIdleCycle();
        } else {
            stopEarlIdleCycle();
        }
    }

    function switchPersona(persona) {
        if (!PERSONAS[persona] || !widget) return;
        currentPersona = persona;
        applyPersona();
        conversationHistory = [];
        speak(pickRandom(PERSONAS[persona].greetings));
        setMood('excited');
        setTimeout(function () { setMood('idle'); }, 1500);
    }

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return r + ',' + g + ',' + b;
    }

    function applyPersona() {
        if (!widget) return;
        var persona = PERSONAS[currentPersona];

        // Set CSS custom properties on the widget root -- all themed styles cascade
        var rgb = hexToRgb(persona.accentColor);
        widget.style.setProperty('--ea', persona.accentColor);
        widget.style.setProperty('--ea-rgb', rgb);
        widget.style.setProperty('--ea-dim', 'rgba(' + rgb + ',0.15)');
        widget.style.setProperty('--ea-subtle', 'rgba(' + rgb + ',0.1)');
        widget.style.setProperty('--ea-border', 'rgba(' + rgb + ',0.3)');
        widget.style.setProperty('--ea-border-light', 'rgba(' + rgb + ',0.2)');
        widget.style.setProperty('--ea-border-faint', 'rgba(' + rgb + ',0.1)');
        widget.style.setProperty('--ea-border-strong', 'rgba(' + rgb + ',0.4)');
        widget.style.setProperty('--ea-border-bright', 'rgba(' + rgb + ',0.7)');

        // Also set on chat panel (it's not a child of widget)
        if (chatEl) {
            chatEl.style.setProperty('--ea', persona.accentColor);
            chatEl.style.setProperty('--ea-rgb', rgb);
            chatEl.style.setProperty('--ea-dim', 'rgba(' + rgb + ',0.15)');
            chatEl.style.setProperty('--ea-subtle', 'rgba(' + rgb + ',0.1)');
            chatEl.style.setProperty('--ea-border', 'rgba(' + rgb + ',0.3)');
            chatEl.style.setProperty('--ea-border-light', 'rgba(' + rgb + ',0.2)');
            chatEl.style.setProperty('--ea-border-faint', 'rgba(' + rgb + ',0.1)');
            chatEl.style.setProperty('--ea-border-strong', 'rgba(' + rgb + ',0.4)');
            chatEl.style.setProperty('--ea-border-bright', 'rgba(' + rgb + ',0.7)');

            var title = chatEl.querySelector('.ernest-chat-title');
            if (title) title.textContent = persona.name;
        }

        // LED and SVG elements
        var led = widget.querySelector('.ernest-led');
        if (led) { led.setAttribute('fill', persona.ledColor); led.style.filter = persona.ledGlow; }

        var toggle = widget.querySelector('.ernest-toggle');
        if (toggle) {
            toggle.textContent = currentPersona === 'ernest' ? 'E' : 'X';
            toggle.title = currentPersona === 'ernest' ? 'Switch to Earl' : 'Switch to Ernest';
        }

        var zaps = widget.querySelectorAll('.ernest-zaps path');
        zaps.forEach(function (z) { z.setAttribute('stroke', persona.accentColor); });

        // Update tooltip
        if (tooltipEl) {
            tooltipEl.querySelector('span').textContent = 'Ask ' + persona.name;
        }
    }

    function celebrate(text) {
        var persona = PERSONAS[currentPersona];
        speak(text || pickRandom(persona.celebrateMessages));
        setMood('excited');
        setTimeout(function () { setMood('idle'); }, 2000);
    }

    // Real inactivity tracker - fires when the USER has been inactive (not just on a wall clock).
    // Listens to mousemove/keydown/scroll/touchstart and resets the timer on each.
    var lastActivityTs = Date.now();
    var inactivityCheckTimer = null;
    var hasFiredRoast = false;
    var hasFiredSleep = false;

    function noteUserActivity() {
        lastActivityTs = Date.now();
        hasFiredRoast = false;
        hasFiredSleep = false;
        // If sleeping, wake up
        if (currentMood === 'sleeping') {
            setMood('idle');
        }
    }

    function startIdleTimer() {
        clearInterval(inactivityCheckTimer);
        lastActivityTs = Date.now();
        hasFiredRoast = false;
        hasFiredSleep = false;
        inactivityCheckTimer = setInterval(checkInactivity, 5000);
    }

    function checkInactivity() {
        if (!widget || isChatOpen() || isThinking) return;
        var idleMs = Date.now() - lastActivityTs;
        var roastMs = config.roastDelay || 60000;        // 60s -> Earl roast / Ernest gentle bubble
        var sleepMs = config.sleepDelay || 300000;       // 5min -> sleeping state

        if (!hasFiredRoast && idleMs >= roastMs && currentMood === 'idle') {
            hasFiredRoast = true;
            if (currentPersona === 'earl') {
                var roasts = PERSONAS.earl.roasts || PERSONAS.earl.idleMessages;
                speak(pickRandom(roasts), 4000);
            } else {
                speak(pickRandom(PERSONAS[currentPersona].idleMessages), 3000);
            }
        }

        if (!hasFiredSleep && idleMs >= sleepMs && currentMood === 'idle') {
            hasFiredSleep = true;
            setMood('sleeping');
        }
    }

    function resetIdleTimer() {
        noteUserActivity();
    }

    function destroy() {
        clearTimeout(bubbleTimer);
        clearInterval(idleTimer);
        clearInterval(inactivityCheckTimer);
        clearInterval(earlIdleTimer);
        if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
        if (chatEl && chatEl.parentNode) chatEl.parentNode.removeChild(chatEl);
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
        document.removeEventListener('mouseup', handleSelectionEvent);
        document.removeEventListener('touchend', handleSelectionEvent);
        ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(function (evt) {
            document.removeEventListener(evt, noteUserActivity);
        });
        widget = null; chatEl = null; tooltipEl = null;
    }

    function setPosition(pos) {
        if (!widget) return;
        widget.className = 'ernest-widget ' + pos;
    }

    function addPersona(key, persona) {
        PERSONAS[key] = persona;
    }

    function setApiKey(key) {
        apiKey = key;
        localStorage.setItem('ernest-api-key', key);
        var setup = chatEl ? chatEl.querySelector('.ernest-api-setup') : null;
        if (setup) setup.remove();
    }

    function refreshContext() {
        pageContext = buildPageContext();
        return pageContext;
    }

    function addReflex(key, ernestText, earlText) {
        REFLEXES[key.toLowerCase()] = { ernest: ernestText, earl: earlText || ernestText };
    }

    // ===== PUBLIC API =====
    window.Ernest = {
        init: createWidget,
        speak: speak,
        setMood: setMood,
        celebrate: celebrate,
        switchPersona: switchPersona,
        setPosition: setPosition,
        addPersona: addPersona,
        openChat: openChat,
        closeChat: closeChat,
        ask: ask,
        setApiKey: setApiKey,
        destroy: destroy,
        refreshContext: refreshContext,
        addReflex: addReflex,
        get persona() { return currentPersona; },
        get mood() { return currentMood; },
        get chatOpen() { return isChatOpen(); },
        get context() { return pageContext; }
    };
})();
