// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Offset for sticky header
                behavior: 'smooth'
            });
        }
    });
});

// Hero typewriter: cycles the hero title through role words, typing and deleting each in turn
(() => {
    const el = document.getElementById('hero-typewriter');
    if (!el) return;

    const words = ['Developer.', 'Builder.', 'Problem Solver.'];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = words[0];
        return;
    }

    let wordIndex = 0;
    let text = '';
    let isDeleting = false;

    const tick = () => {
        const currentWord = words[wordIndex];
        const speed = isDeleting ? 50 : 100;

        if (!isDeleting && text === currentWord) {
            setTimeout(() => { isDeleting = true; tick(); }, 1500);
            return;
        }

        if (isDeleting && text === '') {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        } else {
            text = isDeleting
                ? currentWord.substring(0, text.length - 1)
                : currentWord.substring(0, text.length + 1);
        }

        el.textContent = text;
        setTimeout(tick, speed);
    };

    tick();
})();

// Reveal animations on scroll (base/hidden state lives in CSS; this just toggles the class)
const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.skill-card, .project-card, .section-header');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('is-visible');
        }
    });
};

document.addEventListener('DOMContentLoaded', revealOnScroll); // Check on load

window.addEventListener('scroll', revealOnScroll);

// Mobile nav menu
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Collapsible Sections
document.querySelectorAll('.header-with-toggle').forEach(header => {
    header.addEventListener('click', () => {
        const section = header.closest('.collapsible');
        section.classList.toggle('collapsed');
    });
});

// Infinite marquee: duplicate each card once so the native-scroll loop-back is seamless.
// Duplicates are hidden from assistive tech and removed from tab order.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.marquee-track');
    const originalCards = Array.from(track.children);

    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
    });

    // Pagination dots: one per original (non-cloned) card, kept in sync with scroll position
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'marquee-dots';
    dotsWrap.setAttribute('role', 'tablist');
    dotsWrap.setAttribute('aria-label', 'Carousel pagination');

    const dots = originalCards.map((card, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'marquee-dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
            marquee.scrollTo({
                left: card.offsetLeft - (marquee.clientWidth - card.clientWidth) / 2,
                behavior: 'smooth'
            });
        });
        dotsWrap.appendChild(dot);
        return dot;
    });
    dots[0].classList.add('active');
    marquee.insertAdjacentElement('afterend', dotsWrap);

    const updateActiveDot = () => {
        const setWidth = track.scrollWidth / 2;
        const pos = ((marquee.scrollLeft % setWidth) + setWidth) % setWidth;
        let closest = 0;
        let closestDist = Infinity;
        originalCards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - pos);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        });
        dots.forEach((dot, i) => dot.classList.toggle('active', i === closest));
    };

    // Auto-flows via rAF-driven scrollLeft; native overflow-x scrolling gives touch/trackpad
    // swipe "for free" on top of it, so users can drag to grab a card without fighting the loop.
    // Direction/duration are content-driven so every marquee completes a loop in ~30s
    // regardless of card count, and alternates direction per data-direction on the container.
    const direction = marquee.dataset.direction === 'right' ? -1 : 1;
    const loopDurationSeconds = 30;
    const setWidth = track.scrollWidth / 2;
    const speed = setWidth / (loopDurationSeconds * 60); // px per frame at ~60fps
    let flowing = true;
    let resumeTimer = null;

    if (direction === -1) {
        marquee.scrollLeft = setWidth;
    }

    const pause = () => {
        flowing = false;
        clearTimeout(resumeTimer);
    };
    const resume = (delay = 1200) => {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => { flowing = true; }, delay);
    };

    marquee.addEventListener('mouseenter', pause);
    marquee.addEventListener('mouseleave', () => resume(0));
    marquee.addEventListener('touchstart', pause, { passive: true });
    marquee.addEventListener('touchend', () => resume());
    marquee.addEventListener('pointerdown', pause);
    window.addEventListener('pointerup', () => resume());

    marquee.addEventListener('scroll', () => {
        if (marquee.scrollLeft >= setWidth) {
            marquee.scrollLeft -= setWidth;
        } else if (marquee.scrollLeft <= 0) {
            marquee.scrollLeft += setWidth;
        }
        updateActiveDot();
    });

    if (!prefersReducedMotion) {
        const step = () => {
            if (flowing) {
                marquee.scrollLeft += speed * direction;
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
});

// Ambient background audio toggle (starts muted/paused per autoplay policy)
const audioToggle = document.getElementById('audio-toggle');
const bgAudio = document.getElementById('bg-audio');

if (audioToggle && bgAudio) {
    bgAudio.volume = 0.2;

    audioToggle.addEventListener('click', () => {
        const willPlay = bgAudio.paused;

        if (willPlay) {
            bgAudio.play().catch(() => {});
        } else {
            bgAudio.pause();
        }

        audioToggle.classList.toggle('is-playing', willPlay);
        audioToggle.setAttribute('aria-pressed', String(willPlay));
        audioToggle.setAttribute('aria-label', willPlay ? 'Mute background music' : 'Play background music');
    });
}

// Section background videos: only fetch/play once a section is in view, pause when it isn't.
const lazyBgVideos = document.querySelectorAll('.bg-video[data-src]');

if (lazyBgVideos.length && 'IntersectionObserver' in window) {
    const bgVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (!video.src) {
                    video.src = video.dataset.src;
                }
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.15 });

    lazyBgVideos.forEach(video => bgVideoObserver.observe(video));
}

// AI Assistant: a client-side FAQ chatbot grounded strictly in this page's own
// content (no external API calls, so there's no key to leak and no risk of
// answering off-topic or making things up).
(() => {
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const panel = document.getElementById('ai-chat-panel');
    const backdrop = document.getElementById('ai-chat-backdrop');
    const closeBtn = document.getElementById('ai-chat-close');
    const messagesEl = document.getElementById('ai-chat-messages');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');

    if (!toggleBtn || !panel || !form || !input) return;

    const KNOWLEDGE = {
        greeting: "Hi! I'm Bo's portfolio assistant. Ask me about his background, technical skills, featured projects, or collaborations.",
        background: "10+ years as a Finance Operations Manager across Fintech, Banking, AdTech, and eCommerce, now transitioning into full-stack AI software development — building LLM pipelines, agentic workflows, RAG architectures, and custom UI dashboards. The throughline: building software that eliminates operational friction and automates financial workflows, not just technically sound tools.",
        arsenal: "Technical arsenal:\nCore Development — Python, JavaScript, React, TypeScript\nAI & Automation — LLM APIs, Prompt Engineering, Automations, Pinecone\nOperations & Cloud — Git/GitHub, Cloud Platforms, RESTful APIs, SQL",
        projects: "Featured projects:\n• Scribe + Thrive — AI transcription tool using LLM APIs\n• Ad Optimizer — AdTech campaign optimization & performance tracking\n• Closer Data Analytics — data visualization/reporting platform built in React\n• Soarin' — wellness business growth & performance metrics platform\nScroll up to the Work section for live links.",
        collaborations: "Collaborative builds:\n• LinkUp — Figma prototype validating a new user flow\n• CRM Operations Engine — Salesforce data rebuilt into a Remix front end\n• CYA NYC — shared Figma design system & component library\n• Fanzone Unlocked — full-stack app built and deployed with a team, on Vercel\nScroll up to the Collaborations section for live links.",
        contact: "You can reach Bo directly — email bo.moldenhauer@pursuit.org, LinkedIn at linkedin.com/in/bomoldenhauer, or GitHub at github.com/bofrompursuit.",
    };

    const FALLBACK = "I'm best at answering questions about Bo's background, technical skills, projects, or how to get in touch — try asking about one of those!";

    const TOPICS = [
        { key: 'background', words: ['background', 'experience', 'finance', 'career', 'journey', 'transition', 'history', 'about'] },
        { key: 'arsenal', words: ['skill', 'skills', 'tech', 'technical', 'stack', 'language', 'languages', 'tool', 'tools', 'arsenal', 'python', 'javascript', 'react', 'typescript', 'sql', 'pinecone', 'know'] },
        { key: 'projects', words: ['project', 'projects', 'scribe', 'thrive', 'optimizer', 'adtech', 'closer', 'analytics', 'soar', 'soarin', 'wellness', 'portfolio', 'built', 'work'] },
        { key: 'collaborations', words: ['collab', 'collaboration', 'collaborations', 'linkup', 'crm', 'salesforce', 'remix', 'cya', 'nyc', 'fanzone', 'unlocked', 'team', 'partner'] },
        { key: 'contact', words: ['contact', 'email', 'reach', 'hire', 'linkedin', 'github', 'connect', 'message', 'talk'] },
        { key: 'greeting', words: ['hi', 'hello', 'hey', 'sup', 'yo'] },
    ];

    const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    function matchTopic(text) {
        let best = null;
        let bestScore = 0;
        TOPICS.forEach(topic => {
            const score = topic.words.reduce((count, w) => {
                const re = new RegExp(`\\b${escapeRegex(w)}\\b`, 'i');
                return count + (re.test(text) ? 1 : 0);
            }, 0);
            if (score > bestScore) {
                bestScore = score;
                best = topic.key;
            }
        });
        return best;
    }

    let isOpen = false;
    let greeted = false;
    let questionCount = 0;
    let hasOfferedContact = false;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `ai-chat-msg ${sender}`;
        msg.textContent = text;
        messagesEl.appendChild(msg);
        scrollToBottom();
    }

    function addContactCTA() {
        const wrap = document.createElement('div');
        wrap.className = 'ai-chat-msg bot ai-chat-cta';

        const p = document.createElement('p');
        p.textContent = "It looks like you're interested in learning more! Would you like to reach out directly?";

        const link = document.createElement('a');
        link.href = '#contact';
        link.className = 'btn ai-chat-cta-btn';
        link.textContent = 'Go to Contact';
        link.addEventListener('click', e => {
            e.preventDefault();
            closePanel();
            const target = document.querySelector('#contact');
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });

        wrap.appendChild(p);
        wrap.appendChild(link);
        messagesEl.appendChild(wrap);
        scrollToBottom();
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'ai-chat-msg bot ai-chat-typing';
        typing.id = 'ai-chat-typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('ai-chat-typing-indicator');
        if (typing) typing.remove();
    }

    function respond(userText) {
        const topicKey = matchTopic(userText);
        const reply = topicKey ? KNOWLEDGE[topicKey] : FALLBACK;

        showTyping();
        window.setTimeout(() => {
            hideTyping();
            addMessage(reply, 'bot');

            if (questionCount >= 2 && !hasOfferedContact) {
                hasOfferedContact = true;
                window.setTimeout(addContactCTA, 400);
            }
        }, 500 + Math.random() * 500);
    }

    function openPanel() {
        isOpen = true;
        panel.classList.add('is-open');
        backdrop.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        if (!greeted) {
            greeted = true;
            addMessage(KNOWLEDGE.greeting, 'bot');
        }

        window.setTimeout(() => input.focus(), 300);
    }

    function closePanel() {
        isOpen = false;
        panel.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', () => (isOpen ? closePanel() : openPanel()));
    closeBtn.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            closePanel();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = panel.querySelectorAll('button, input, a[href]');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';
        questionCount += 1;
        respond(text);
    });
})();
