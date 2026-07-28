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

// Infinite marquee: duplicate each card once so the CSS loop (-50%) is seamless.
// Duplicates are hidden from assistive tech and removed from tab order.
document.querySelectorAll('.marquee-track').forEach(track => {
    Array.from(track.children).forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
    });
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
