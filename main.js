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

// Reveal animations on scroll
const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.skill-card, .project-card, .section-header');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
            // Adding active class via JS, styling in CSS could be added if needed
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
};

// Initial setup for reveal elements
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.skill-card, .project-card, .section-header');
    reveals.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.6s ease-out";
    });
    
    revealOnScroll(); // Check on load
});

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
