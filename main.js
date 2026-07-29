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

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.padding = "0.5rem 0";
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
    } else {
        header.style.padding = "0";
        header.style.boxShadow = "none";
    }
});

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

    Array.from(track.children).forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
    });

    // Auto-flows via rAF-driven scrollLeft; native overflow-x scrolling gives touch/trackpad
    // swipe "for free" on top of it, so users can drag to grab a card without fighting the loop.
    const speed = 0.6; // px per frame
    let flowing = true;
    let resumeTimer = null;

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
        const setWidth = track.scrollWidth / 2;
        if (marquee.scrollLeft >= setWidth) {
            marquee.scrollLeft -= setWidth;
        }
    });

    if (!prefersReducedMotion) {
        const step = () => {
            if (flowing) {
                marquee.scrollLeft += speed;
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
