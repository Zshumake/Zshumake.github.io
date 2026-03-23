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
        </g>
    </svg>`;

    const STYLES = `
    <style id="ernest-module-styles">
    /* ===== WIDGET CONTAINER ===== */
    .ernest-widget {
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
    .ernest-idle .ernest-svg { animation: ernest-m-bounce 3s ease-in-out infinite; }
    @keyframes ernest-m-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

    .ernest-excited .ernest-svg { animation: ernest-m-excited 0.5s ease-in-out infinite; }
    @keyframes ernest-m-excited { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-12px) rotate(-3deg)} 75%{transform:translateY(-12px) rotate(3deg)} }

    .ernest-thinking .ernest-svg { animation: ernest-m-think 2s ease-in-out infinite; }
    @keyframes ernest-m-think { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-4px) rotate(-5deg)} }

    .ernest-waving .ernest-svg { animation: ernest-m-wave 0.8s ease-in-out 3; }
    @keyframes ernest-m-wave { 0%,100%{transform:rotate(0)} 25%{transform:rotate(8deg)} 75%{transform:rotate(-8deg)} }

    .ernest-eyes-open { animation: ernest-m-blink 4s infinite; }
    @keyframes ernest-m-blink { 0%,90%,100%{opacity:1} 95%{opacity:0} }
    .ernest-eyes-closed { animation: ernest-m-blink-inv 4s infinite; }
    @keyframes ernest-m-blink-inv { 0%,90%,100%{opacity:0} 95%{opacity:1} }

    .ernest-led { animation: ernest-m-led 2s ease-in-out infinite; }
    @keyframes ernest-m-led { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .ernest-prong-l { transform-origin:156px 120px; animation:ernest-m-prong 4s ease-in-out infinite; }
    .ernest-prong-r { transform-origin:266px 120px; animation:ernest-m-prong 4.5s ease-in-out infinite 0.5s; }
    @keyframes ernest-m-prong { 0%,100%{transform:rotate(0)} 50%{transform:rotate(3deg)} }

    /* ===== SPEECH BUBBLE (quick messages) ===== */
    .ernest-bubble {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(12, 20, 35, 0.95);
        border: 1px solid rgba(136, 221, 237, 0.3);
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
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(136,221,237,0.05);
        margin-bottom: 8px;
    }
    .ernest-bubble.visible { opacity:1; transform:translateY(0) scale(1); }
    .ernest-bubble::after {
        content:''; position:absolute; bottom:-6px; right:16px; width:12px; height:12px;
        background:rgba(12,20,35,0.95); border-right:1px solid rgba(136,221,237,0.3);
        border-bottom:1px solid rgba(136,221,237,0.3); transform:rotate(45deg);
    }
    .ernest-bubble .ernest-bubble-name {
        font-weight:700; font-size:0.6rem; text-transform:uppercase;
        letter-spacing:0.08em; margin-bottom:0.25rem; color:#88dded;
    }

    /* ===== PERSONA TOGGLE ===== */
    .ernest-toggle {
        position:absolute; top:-4px; left:-4px; width:20px; height:20px;
        border-radius:50%; border:2px solid rgba(136,221,237,0.3);
        background:rgba(12,20,35,0.9); cursor:pointer; display:flex;
        align-items:center; justify-content:center; font-size:0.5rem;
        color:#88dded; font-family:'JetBrains Mono',monospace; font-weight:700;
        transition:all 0.2s; opacity:0;
    }
    .ernest-char-wrap:hover .ernest-toggle { opacity:1; }
    .ernest-toggle:hover { background:rgba(136,221,237,0.15); transform:scale(1.15); }

    /* ===== HIGHLIGHT TOOLTIP ===== */
    .ernest-tooltip {
        position: absolute;
        z-index: 10000;
        display: none;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.7rem;
        background: rgba(12, 20, 35, 0.95);
        border: 1px solid rgba(136, 221, 237, 0.4);
        border-radius: 6px;
        cursor: pointer;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        font-size: 0.68rem;
        color: #88dded;
        font-weight: 600;
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(136,221,237,0.1);
        transition: all 0.15s ease;
        user-select: none;
        white-space: nowrap;
        animation: ernest-tooltip-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ernest-tooltip:hover {
        background: rgba(20, 35, 60, 0.95);
        border-color: rgba(136, 221, 237, 0.7);
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
        background: rgba(136, 221, 237, 0.15);
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
        background: rgba(10, 14, 26, 0.97);
        border: 1px solid rgba(136, 221, 237, 0.2);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        z-index: 10001;
        box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(136,221,237,0.05);
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
        border-bottom: 1px solid rgba(136, 221, 237, 0.1);
    }
    .ernest-chat-title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        font-weight: 700;
        color: #88dded;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .ernest-chat-close {
        width: 24px; height: 24px; border-radius: 4px;
        border: 1px solid rgba(136, 221, 237, 0.2);
        background: transparent; color: #5a7a95; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-family: 'JetBrains Mono', monospace;
        transition: all 0.15s;
    }
    .ernest-chat-close:hover { background:rgba(136,221,237,0.1); color:#88dded; }

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
        scrollbar-color: rgba(136,221,237,0.15) transparent;
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
        background: rgba(136, 221, 237, 0.06);
        border: 1px solid rgba(136, 221, 237, 0.12);
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
        color: #88dded;
    }
    .ernest-msg.user .ernest-msg-name { color: #448aff; }
    .ernest-msg em { color: #88dded; font-style: italic; }

    .ernest-msg-loading {
        align-self: flex-start;
        padding: 0.6rem 0.8rem;
        color: #5a7a95;
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
        background: #88dded;
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
        border-top: 1px solid rgba(136, 221, 237, 0.1);
    }
    .ernest-chat-input {
        flex: 1;
        background: rgba(20, 30, 50, 0.8);
        border: 1px solid rgba(136, 221, 237, 0.15);
        border-radius: 6px;
        padding: 0.5rem 0.7rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        color: #d0dce8;
        outline: none;
        transition: border-color 0.2s;
    }
    .ernest-chat-input:focus { border-color: rgba(136, 221, 237, 0.4); }
    .ernest-chat-input::placeholder { color: #3a5a70; }

    .ernest-chat-send {
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        border: 1px solid rgba(136, 221, 237, 0.3);
        background: rgba(136, 221, 237, 0.1);
        color: #88dded;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
    }
    .ernest-chat-send:hover { background:rgba(136,221,237,0.2); }
    .ernest-chat-send:disabled { opacity:0.4; cursor:not-allowed; }

    .ernest-api-setup {
        padding: 0.75rem;
        text-align: center;
        border-bottom: 1px solid rgba(136, 221, 237, 0.1);
    }
    .ernest-api-setup p {
        font-size: 0.72rem;
        color: #5a7a95;
        margin-bottom: 0.5rem;
        font-family: 'Inter', sans-serif;
    }
    .ernest-api-input {
        width: 100%;
        background: rgba(20, 30, 50, 0.8);
        border: 1px solid rgba(136, 221, 237, 0.2);
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

    @media (max-width: 480px) {
        .ernest-chat { width: calc(100vw - 24px); right: 12px; bottom: 12px; max-height: 70vh; }
    }
    </style>`;

    // ===== STATE =====
    let currentPersona = 'ernest';
    let currentMood = 'idle';
    let bubbleTimer = null;
    let idleTimer = null;
    let widget = null;
    let chatEl = null;
    let tooltipEl = null;
    let currentSelection = null;
    let conversationHistory = [];
    let isThinking = false;
    let apiKey = null;
    let config = {};

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ===== INIT =====
    function createWidget(options) {
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

        // Apply persona accent color
        if (role !== 'user') {
            msg.querySelector('.ernest-msg-name').style.color = PERSONAS[currentPersona].accentColor;
        }

        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showLoadingMessage() {
        var messages = chatEl.querySelector('.ernest-chat-messages');
        var loading = document.createElement('div');
        loading.className = 'ernest-msg-loading';
        loading.id = 'ernest-loading';
        loading.innerHTML = '<div class="ernest-dots"><span></span><span></span><span></span></div> Thinking...';
        messages.appendChild(loading);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeLoadingMessage() {
        var el = document.getElementById('ernest-loading');
        if (el) el.remove();
    }

    function formatText(text) {
        // Basic markdown-ish formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background:rgba(136,221,237,0.1);padding:0.1rem 0.3rem;border-radius:3px;font-family:JetBrains Mono,monospace;font-size:0.72rem;">$1</code>')
            .replace(/\n/g, '<br>');
    }

    // ===== HIGHLIGHT TOOLTIP =====
    function createTooltip() {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'ernest-tooltip';
        tooltipEl.innerHTML =
            '<div class="ernest-tooltip-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="#88dded" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
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
                tooltipEl.style.borderColor = PERSONAS[currentPersona].accentColor + '66';
                tooltipEl.style.color = PERSONAS[currentPersona].accentColor;
                tooltipEl.querySelector('.ernest-tooltip-icon svg').setAttribute('stroke', PERSONAS[currentPersona].accentColor);

                tooltipEl.style.top = (rect.bottom + scrollTop + 8) + 'px';
                tooltipEl.style.left = (rect.left + scrollLeft + (rect.width / 2) - 60) + 'px';
                tooltipEl.style.display = 'flex';
                currentSelection = text;
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

        var opener = pickRandom(PERSONAS[currentPersona].highlightOpeners);
        addChatMessage('user', '"' + text + '"');

        var query = '[HIGHLIGHT_MODE]: "' + text + '"\n(Instruction: The user highlighted this text for an explanation. Start with "' + opener + '" then provide a concise 2-3 sentence clinical high-yield explanation in your persona.)';

        conversationHistory.push({ role: 'user', parts: [{ text: query }] });
        callGemini(query);
    }

    function ask(text, isHighlight) {
        if (!text || isThinking) return;

        addChatMessage('user', text);

        var query = isHighlight
            ? '[HIGHLIGHT_MODE]: "' + text + '"\n(Instruction: Explain this highlighted text.)'
            : text;

        conversationHistory.push({ role: 'user', parts: [{ text: query }] });
        callGemini(query);
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
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + config.geminiModel + ':generateContent?key=' + apiKey;

        var body = {
            contents: conversationHistory.slice(-10),
            systemInstruction: { parts: [{ text: persona.systemPrompt }] },
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

            var data = await response.json();
            var text = data.candidates && data.candidates[0] && data.candidates[0].content
                ? data.candidates[0].content.parts[0].text
                : 'No response generated.';

            conversationHistory.push({ role: 'model', parts: [{ text: text }] });

            removeLoadingMessage();
            addChatMessage('assistant', text);
        } catch (e) {
            removeLoadingMessage();
            var errMsg = currentPersona === 'earl'
                ? 'Connection severed. Check your API key or Wi-Fi. Error: ' + e.message
                : 'Signal lost! Error: ' + e.message;
            addChatMessage('assistant', errMsg);
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
        nameEl.style.color = PERSONAS[currentPersona].accentColor;
        textEl.textContent = text;

        bubble.classList.add('visible');
        bubble.style.borderColor = PERSONAS[currentPersona].accentColor + '33';

        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(function () {
            bubble.classList.remove('visible');
        }, duration);

        resetIdleTimer();
    }

    function setMood(mood) {
        if (!widget) return;
        currentMood = mood;
        var wrap = widget.querySelector('.ernest-char-wrap');
        wrap.className = 'ernest-char-wrap ernest-' + mood;
        wrap.style.width = config.size + 'px';
        wrap.style.height = (config.size * 1.17) + 'px';
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

    function applyPersona() {
        if (!widget) return;
        var persona = PERSONAS[currentPersona];
        var led = widget.querySelector('.ernest-led');
        var toggle = widget.querySelector('.ernest-toggle');

        if (led) { led.setAttribute('fill', persona.ledColor); led.style.filter = persona.ledGlow; }
        if (toggle) {
            toggle.textContent = currentPersona === 'ernest' ? 'E' : 'X';
            toggle.title = currentPersona === 'ernest' ? 'Switch to Earl' : 'Switch to Ernest';
            toggle.style.color = persona.accentColor;
            toggle.style.borderColor = persona.accentColor + '33';
        }

        var zaps = widget.querySelectorAll('.ernest-zaps path');
        zaps.forEach(function (z) { z.setAttribute('stroke', persona.accentColor); });

        // Update chat header
        if (chatEl) {
            var title = chatEl.querySelector('.ernest-chat-title');
            if (title) { title.textContent = persona.name; title.style.color = persona.accentColor; }
        }

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

    function startIdleTimer() {
        clearInterval(idleTimer);
        idleTimer = setInterval(function () {
            if (currentMood === 'idle' && !isChatOpen()) {
                speak(pickRandom(PERSONAS[currentPersona].idleMessages), 3000);
            }
        }, config.idleInterval);
    }

    function resetIdleTimer() {
        if (config.idleChat) { clearInterval(idleTimer); startIdleTimer(); }
    }

    function destroy() {
        clearTimeout(bubbleTimer);
        clearInterval(idleTimer);
        if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
        if (chatEl && chatEl.parentNode) chatEl.parentNode.removeChild(chatEl);
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
        document.removeEventListener('mouseup', handleSelectionEvent);
        document.removeEventListener('touchend', handleSelectionEvent);
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
        get persona() { return currentPersona; },
        get mood() { return currentMood; },
        get chatOpen() { return isChatOpen(); }
    };
})();
