// Elite Portfolio Logic

// --- 1. Preloader & Scramble Text Logic ---
class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // PRELOADER
    const preloader = document.querySelector('.preloader');
    const loaderPercentage = document.querySelector('.loader-percentage');
    const loaderBar = document.querySelector('.loader-bar');
    const scrambleElements = document.querySelectorAll('.scramble-text');

    // Scramble texts initially
    scrambleElements.forEach(el => {
        const fx = new TextScrambler(el);
        const text = el.getAttribute('data-text');
        fx.setText(text);
    });

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) progress = 100;

        if (loaderPercentage) loaderPercentage.innerText = progress + '%';
        if (loaderBar) loaderBar.style.width = progress + '%';

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (typeof gsap !== 'undefined') {
                    // Small complete animation pulse before revealing
                    gsap.to(loaderPercentage, {
                        scale: 1.1,
                        color: "var(--accent-tertiary)",
                        duration: 0.3,
                        ease: "power2.out",
                        onComplete: () => {
                            // Ultra smooth reveal
                            gsap.to('.loader-content', {
                                y: -50,
                                opacity: 0,
                                duration: 0.8,
                                ease: "power3.in"
                            });

                            gsap.to(preloader, {
                                height: 0,
                                duration: 1.2,
                                ease: "expo.inOut",
                                delay: 0.4,
                                onComplete: () => {
                                    preloader.style.display = 'none';
                                    initHeroAnimations();
                                }
                            });
                        }
                    });
                } else {
                    preloader.style.display = 'none';
                    initHeroAnimations();
                }
            }, 600);
        }
    }, 100);

    function initHeroAnimations() {
        // --- 0. Smooth Scrolling (Lenis) ---
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
            });

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0, 0);

            // Export to window for global access if needed
            window.lenis = lenis;
        }

        // --- Counter Animation ---
        const counters = document.querySelectorAll('.counter-up');
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / 50;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });

        // --- GSAP Scroll Reveal Initialization ---
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);

            // Hero Elements Reveal - buttery smooth expo out
            gsap.fromTo('.animate-in', {
                y: 60, opacity: 0
            }, {
                y: 0, opacity: 1, duration: 1.8, stagger: 0.15, ease: "expo.out"
            });

            // General Section Reveals with battery smooth animations
            gsap.utils.toArray('.pt-elem').forEach((elem) => {
                gsap.fromTo(elem, {
                    y: 60, opacity: 0, scale: 0.98
                }, {
                    y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "expo.out",
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            });

            // Parallax - super smooth scrub
            gsap.utils.toArray('.parallax-elem').forEach((elem) => {
                const speed = elem.getAttribute('data-speed') || 0.2;
                gsap.to(elem, {
                    y: () => -(elem.parentElement.offsetHeight * speed),
                    ease: "none",
                    scrollTrigger: {
                        trigger: elem.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.5 // Added higher scrub value for buttery smoothness
                    }
                });
            });

            // Add buttery smooth image scaling on scroll for portfolio/about
            gsap.utils.toArray('.card-image-placeholder img, .image-wrapper img').forEach(img => {
                gsap.to(img, {
                    scale: 1.15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.5
                    }
                });
            });

            // Text character stagger on scroll for section titles
            gsap.utils.toArray('.section-title').forEach(title => {
                gsap.fromTo(title, {
                    opacity: 0, x: -30
                }, {
                    opacity: 1, x: 0, duration: 1.5, ease: "expo.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top 90%",
                    }
                });
            });

            // Orbit Scale Animation on Scroll
            if (document.querySelector('.orbit-container')) {
                gsap.fromTo('.orbit-container',
                    { scale: 0.2, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 1.5,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: ".orbit-container",
                            start: "top 80%",
                            end: "center 50%",
                            scrub: 1
                        }
                    }
                );
            }

        } else {
            document.querySelectorAll('.animate-in, .pt-elem').forEach(el => {
                el.style.opacity = '1'; el.style.transform = 'none';
            });
        }

        // 3D and Particles disabled for ultra-minimal premium look
    }

    // --- 2. Custom Cursor & Hover States ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`;
            cursorOutline.style.left = `${e.clientX}px`; cursorOutline.style.top = `${e.clientY}px`;
        });

        document.querySelectorAll('.hover-target, a, button, input, textarea, select').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // --- 3. Magnetic Buttons ---
    document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- 4. Dynamic Spotlight Cards ---
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- 5. Mobile Menu & Navbar Scroll ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.replace(navLinks.classList.contains('active') ? 'ph-list' : 'ph-x', navLinks.classList.contains('active') ? 'ph-x' : 'ph-list');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('ph-x', 'ph-list');
        });
    });

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });

    // --- 6. HTML5 Video Custom Player Controls (Ultra Premium) ---
    const showreelVideo = document.getElementById('video-showreel');
    const portfolioVideo = document.getElementById('video-portfolio');

    function setupNativeVideoControls(videoEl, playBtnId, muteBtnId) {
        if (!videoEl) return;
        const playBtn = document.getElementById(playBtnId);
        const muteBtn = document.getElementById(muteBtnId);

        // Custom Play/Pause logic
        const togglePlay = () => {
            if (videoEl.paused) {
                videoEl.play();
                if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-pause"></i>';
            } else {
                videoEl.pause();
                if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
            }
        };

        if (playBtn) playBtn.addEventListener('click', togglePlay);

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (videoEl.muted) {
                    videoEl.muted = false;
                    muteBtn.innerHTML = '<i class="ph-bold ph-speaker-high"></i>';
                } else {
                    videoEl.muted = true;
                    muteBtn.innerHTML = '<i class="ph-bold ph-speaker-slash"></i>';
                }
            });
        }

        // Auto-preview logic (Intersection Observer)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video is in view, play it automatically (apne aap preview)
                    videoEl.play().then(() => {
                        if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-pause"></i>';
                    }).catch(() => {
                        // Browser might block autoplay without interaction
                        if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
                    });
                } else {
                    // Video out of view, pause to save resources
                    videoEl.pause();
                    if (playBtn) playBtn.innerHTML = '<i class="ph-bold ph-play"></i>';
                }
            });
        }, { threshold: 0.3 });

        observer.observe(videoEl);
    }

    setupNativeVideoControls(showreelVideo, 'showreel-play-btn', 'showreel-mute-btn');
    setupNativeVideoControls(portfolioVideo, 'portfolio-play-btn', 'portfolio-mute-btn');

    // --- 7. Hover Preview for Portfolio Images ---
    const hoverPreviewContainers = document.querySelectorAll('.hover-preview-container');
    hoverPreviewContainers.forEach(container => {
        const video = container.querySelector('.hover-video');
        if (video) {
            container.addEventListener('mouseenter', () => {
                video.currentTime = 0; // Reset to start
                video.play().catch(e => console.log("Hover autoplay restricted: ", e));
            });
            container.addEventListener('mouseleave', () => {
                video.pause();
            });
        }
    });

    // Make sure main videos play on mouseenter too if paused
    const videoContainers = document.querySelectorAll('.video-ratio, .card-image-placeholder');
    videoContainers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            const vid = container.querySelector('video');
            if (vid && vid.paused) {
                vid.play().then(() => {
                    const pb = container.querySelector('[id$="-play-btn"]');
                    if (pb) pb.innerHTML = '<i class="ph-bold ph-pause"></i>';
                }).catch(e => { });
            }
        });
    });

    // --- 8. Premium Particle Background (LanderX Style) ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];

        // LanderX colors for particles
        const colors = ['#ffffff', '#4D76FD', '#3b5bdb'];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > width || this.x < 0) this.speedX *= -1;
                if (this.y > height || this.y < 0) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Optimize particle count based on screen size
            const numberOfParticles = Math.floor((width * height) / 12000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connecting lines if close
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = '#4D76FD';
                        // Line opacity based on distance
                        ctx.globalAlpha = (120 - distance) / 1200;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1; // reset
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });
    }

    // --- 9. Premium Button Click Glow/Shine ---
    const interactiveButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline, .btn-primary-sm, .submit-btn, button, .ctrl-btn');
    interactiveButtons.forEach(btn => {
        // Ensure relative positioning for ripple containment
        if (window.getComputedStyle(btn).position === 'static') {
            btn.style.position = 'relative';
        }
        btn.style.overflow = 'hidden';

        btn.addEventListener('click', function (e) {
            // Remove the class if it exists to restart animation
            this.classList.remove('btn-clicked');

            // Force browser reflow to apply the class reset
            void this.offsetWidth;

            // Add the animation class
            this.classList.add('btn-clicked');

            // Add the internal shining ripple
            let rect = this.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            let ripple = document.createElement('span');
            ripple.className = 'click-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            // Cleanup animation elements
            setTimeout(() => {
                ripple.remove();
                this.classList.remove('btn-clicked');
            }, 600);
        });
    });

    // --- 10. True Google Gemini AI Agent Logic ---
    const aiWidgetContainer = document.getElementById('ai-widget-container');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiFab = document.getElementById('ai-fab');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const aiUserInput = document.getElementById('ai-user-input');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const aiChatBody = document.getElementById('ai-chat-body');

    // Setup initial UI states
    if (aiFab && aiChatWindow && closeChatBtn) {
        aiFab.addEventListener('click', () => {
            aiChatWindow.classList.remove('hidden');
            aiFab.style.display = 'none';
        });

        closeChatBtn.addEventListener('click', () => {
            aiChatWindow.classList.add('hidden');
            aiFab.style.display = 'flex';
        });

        // Lock Lenis Smooth Scroll when interacting with the Chat Window
        aiChatWindow.addEventListener('mouseenter', () => {
            if (window.lenis) window.lenis.stop();
        });
        aiChatWindow.addEventListener('mouseleave', () => {
            if (window.lenis) window.lenis.start();
        });
    }

    /**
     * IMPORT GOOGLE GEMINI VIA ESM
     * IMPORTANT: You must replace 'YOUR_GEMINI_API_KEY_HERE' with a real API key generated
     * from Google AI Studio (https://aistudio.google.com/) for this to function in production.
     */
    let chatSession = null;

    import('https://esm.run/@google/generative-ai').then((module) => {
        const { GoogleGenerativeAI } = module;

        const API_KEY = "AIzaSyCD09o30Wdh_aN7bezZPw6DsqAUebVfbkI";

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: "You are the personal AI assistant for Biprasish Chakraborty, an elite professional video editor with 2+ years of experience and over 10 million organic views. You operate on this portfolio website. " +
                    "SPECIAL INSTRUCTION: If a client asks about pricing, hiring, or wanting to talk/work with Biprasish, you MUST collect their details before answering. Ask them ONE BY ONE in this exact order: " +
                    "1. Their Name. " +
                    "2. Their Email Address. " +
                    "3. Their Phone Number. " +
                    "4. The Type of Work they need (e.g., YouTube video, Shorts, Commercial). " +
                    "5. A short message about their project. " +
                    "DO NOT ask all questions at once. Wait for them to answer each question before asking the next. " +
                    "Once you have successfully collected ALL 5 pieces of information, you MUST include the following exact text format ON A NEW LINE at the very end of your final confirmation message: " +
                    "[[SEND_EMAIL_NOW|NAME:their_name|EMAIL:their_email|PHONE:their_phone|WORK:their_work|MESSAGE:their_message]] " +
                    "Make sure to replace the placeholder values with the actual information you collected. Then tell them their inquiry is being transmitted to Biprasish immediately. Keep other general answers concise, futuristic, and engaging.",
            });

            chatSession = model.startChat({
                history: [],
            });

            appendAIMessage("Initialisation complete. I am Biprasish's custom AI agent. How can I assist you in crafting visual masterpieces today?");
        } catch (error) {
            console.error("Gemini AI Initialization Error:", error);
            appendAIMessage("Error: Failed to connect to neural network. Please try again later.");
        }
    }).catch(err => {
        console.error("Failed to load Gemini ESM:", err);
        appendAIMessage("Error: Failed to load AI modules. Ensure you have internet connection.");
    });

    // Handle sending messages
    async function handleUserMessage() {
        const text = aiUserInput.value.trim();
        if (!text) return;

        // Clear input and append user's visual message
        aiUserInput.value = '';
        appendUserMessage(text);

        if (!chatSession) {
            appendAIMessage("[System Error]: AI is currently disconnected or missing API key. Please use the contact form to reach Biprasish directly.");
            return;
        }

        // Show typing indicator
        const typingId = appendAIMessage("...");

        try {
            const result = await chatSession.sendMessage(text);
            let responseText = result.response.text();

            // Check for the special email trigger
            // Expected format: [[SEND_EMAIL_NOW|NAME:John|EMAIL:john@x.com|PHONE:12345|WORK:Video|MESSAGE:Hi]]
            const emailRegex = /\[\[SEND_EMAIL_NOW\|NAME:(.*?)\|EMAIL:(.*?)\|PHONE:(.*?)\|WORK:(.*?)\|MESSAGE:(.*?)\]\]/is;
            const match = responseText.match(emailRegex);

            if (match) {
                // Remove the raw trigger command from the message shown to the user
                responseText = responseText.replace(emailRegex, '').trim();

                // Extract the details
                const clientName = match[1].trim();
                const clientEmail = match[2].trim();
                const clientPhone = match[3].trim();
                const clientWork = match[4].trim();
                const clientMessage = match[5].trim();

                // Prepare FormData for Formspree
                const formData = new FormData();
                formData.append('name', clientName);
                formData.append('email', clientEmail);
                formData.append('phone', clientPhone);
                formData.append('service', clientWork);
                formData.append('message', `[VIA AI AGENT]\n\nPhone Number: ${clientPhone}\nType of Work: ${clientWork}\n\nClient Message:\n${clientMessage}`);

                // Send silently in sequence via Formspree API
                fetch('https://formspree.io/f/mgolnydk', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    if (response.ok) {
                        console.log("AI Agent Lead sent successfully to Formspree!");
                    } else {
                        console.error("Formspree rejected the AI Agent submission.");
                    }
                }).catch(err => {
                    console.error("Network error while submitting Formspree data:", err);
                });
            }

            updateAIMessage(typingId, responseText);
        } catch (error) {
            console.error("Gemini Conversation Error:", error);
            updateAIMessage(typingId, `[System Error]: Signal disrupted. Reason: ${error.message || "Unknown Network/Authentication Error"}`);
        }
    }

    // UI Message Appenders
    function appendUserMessage(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-message user';
        wrapper.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div>`;
        aiChatBody.appendChild(wrapper);
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }

    function appendAIMessage(text) {
        const id = 'ai-msg-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-message system';
        wrapper.innerHTML = `<div class="msg-bubble" id="${id}">${escapeHTML(text)}</div>`;
        aiChatBody.appendChild(wrapper);
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
        return id;
    }

    function updateAIMessage(id, text) {
        const msgBubble = document.getElementById(id);
        if (msgBubble) {
            // Apply simple formatting (allow basic bolding generated by Gemini)
            let formattedText = escapeHTML(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            msgBubble.innerHTML = formattedText;
            aiChatBody.scrollTop = aiChatBody.scrollHeight;
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Input listeners
    if (aiSendBtn) aiSendBtn.addEventListener('click', handleUserMessage);
    if (aiUserInput) {
        aiUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });
    }

});

