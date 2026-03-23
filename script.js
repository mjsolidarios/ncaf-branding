// NCAF 2026 Brand Guidelines Script

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');
const revealItems = document.querySelectorAll('.reveal');
const colorTokens = document.querySelectorAll('[data-copy]');
const toast = document.querySelector('.toast');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navLinks.classList.toggle('is-open');
    });
}

navAnchors.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = anchor.getAttribute('href');
        const targetSection = targetId ? document.querySelector(targetId) : null;

        if (!targetSection) {
            return;
        }

        targetSection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });

        if (navToggle && navLinks) {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('is-open');
        }
    });
});

const setActiveNavLink = (id) => {
    navAnchors.forEach((anchor) => {
        const isActive = anchor.getAttribute('href') === `#${id}`;
        anchor.classList.toggle('is-active', isActive);
        if (isActive) {
            anchor.setAttribute('aria-current', 'page');
        } else {
            anchor.removeAttribute('aria-current');
        }
    });
};

if (sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActiveNavLink(entry.target.id);
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: '-10% 0px -45% 0px'
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

if (!prefersReducedMotion && revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

const showToast = (message) => {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 1800);
};

colorTokens.forEach((token) => {
    token.addEventListener('click', async () => {
        const value = token.getAttribute('data-copy');

        if (!value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            showToast(`${value} copied`);
        } catch (error) {
            showToast('Clipboard unavailable');
            console.error('Unable to copy color token.', error);
        }
    });
});
