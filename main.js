/* ============================================
   Antalyatour.online — Motion System (main.js)
   Shared across all pages.
   ============================================ */
import translations from './js/translations.js';

document.addEventListener('DOMContentLoaded', () => {

    // ===== 0. LANGUAGE SYSTEM =====
    const langToggle = document.getElementById('lang-toggle');
    const currentLang = localStorage.getItem('lang') || 'tr';

    // Function to update text content
    const updateLanguage = (lang) => {
        const t = translations[lang];
        if (!t) return;

        // Recursive function to flat-traverse the object or just simple key lookup?
        // Simple approach: Iterate over all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const keys = key.split('.'); // e.g., "hero.title" -> ["hero", "title"]

            let val = t;
            keys.forEach(k => { val = val ? val[k] : null; });

            if (val) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = val;
                } else {
                    el.innerHTML = val; // Use innerHTML to allow <span> in translations
                }
            }
        });

        // Update Toggle Text
        if (langToggle) {
            langToggle.innerText = lang === 'tr' ? 'TR | EN' : 'EN | TR';
            // Visual state (optional)
            langToggle.setAttribute('data-lang', lang);
        }

        // Persist
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
    };

    // Initialize
    updateLanguage(currentLang);

    // Toggle Event
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const current = localStorage.getItem('lang') || 'tr';
            const next = current === 'tr' ? 'en' : 'tr';
            updateLanguage(next);
        });
    }

    // ===== 1. HEADER SCROLL EFFECT =====

    // ===== 1. HEADER SCROLL EFFECT =====
    const siteHeader = document.querySelector('.site-header') || document.querySelector('.header');
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            siteHeader.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // ===== 2. MEGA MENU (Desktop) =====
    const navItems = document.querySelectorAll('.nav-item[data-mega]');
    let megaTimer = null;
    const closeMegas = () => {
        document.querySelectorAll('.mega-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.nav-item.open').forEach(n => n.classList.remove('open'));
    };
    navItems.forEach(item => {
        const mega = item.querySelector('.mega-menu');
        if (!mega) return;
        const show = () => { clearTimeout(megaTimer); closeMegas(); mega.classList.add('open'); item.classList.add('open'); };
        const hide = () => { megaTimer = setTimeout(() => { mega.classList.remove('open'); item.classList.remove('open'); }, 200); };
        item.addEventListener('mouseenter', show);
        item.addEventListener('mouseleave', hide);
        mega.addEventListener('mouseenter', () => clearTimeout(megaTimer));
        mega.addEventListener('mouseleave', hide);
        item.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) return;
            e.preventDefault();
            mega.classList.contains('open') ? hide() : show();
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item[data-mega]')) closeMegas();
    });

    // ===== 2b. MOBILE DRAWER =====
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.mobile-drawer');
    const overlay = document.querySelector('.drawer-overlay');
    const drawerClose = document.querySelector('.drawer-close');

    const openDrawer = () => {
        drawer?.classList.add('open');
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
        hamburger?.setAttribute('aria-expanded', 'true');
        // Focus first link in drawer
        setTimeout(() => drawer?.querySelector('.drawer-link')?.focus(), 100);
    };
    const closeDrawer = () => {
        drawer?.classList.remove('open');
        overlay?.classList.remove('open');
        document.body.style.overflow = '';
        hamburger?.setAttribute('aria-expanded', 'false');
        hamburger?.focus();
    };

    // Set initial ARIA state
    if (hamburger && drawer) {
        drawer.id = drawer.id || 'mobile-drawer';
        hamburger.setAttribute('aria-controls', drawer.id);
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger?.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    overlay?.addEventListener('click', closeDrawer);

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer?.classList.contains('open')) {
            closeDrawer();
        }
    });

    // Drawer accordion
    document.querySelectorAll('.drawer-link[data-accordion]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sub = link.nextElementSibling;
            if (!sub) return;
            const isOpen = sub.classList.contains('open');
            document.querySelectorAll('.drawer-sub.open').forEach(s => { s.classList.remove('open'); s.previousElementSibling?.classList.remove('expanded'); });
            if (!isOpen) { sub.classList.add('open'); link.classList.add('expanded'); }
        });
    });

    // Legacy mobile menu fallback
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    // ===== 3. SCROLL REVEAL (IntersectionObserver) =====
    const revealEls = document.querySelectorAll('.fade-up');
    if (revealEls.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger delay based on sibling index
                    const siblings = entry.target.parentElement
                        ? Array.from(entry.target.parentElement.querySelectorAll('.fade-up'))
                        : [];
                    const idx = siblings.indexOf(entry.target);
                    const delay = Math.min(idx * 80, 320); // max 320ms stagger
                    entry.target.style.transitionDelay = delay + 'ms';
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        // Reduced motion: show everything immediately
        revealEls.forEach(el => el.classList.add('visible'));
    }

    // ===== 4. HERO CARD STACK AUTO-CYCLE =====
    const heroStack = document.querySelector('.hero-stack');
    if (heroStack) {
        const stackCards = heroStack.querySelectorAll('.stack-card');
        if (stackCards.length > 1) {
            let activeIndex = 0;

            function setStackState() {
                stackCards.forEach((card, i) => {
                    const offset = (i - activeIndex + stackCards.length) % stackCards.length;
                    card.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';

                    if (offset === 0) {
                        card.style.zIndex = 3;
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                        card.style.filter = 'none';
                    } else if (offset === 1) {
                        card.style.zIndex = 2;
                        card.style.opacity = '0.7';
                        card.style.transform = 'translateY(20px) translateX(16px) scale(0.96)';
                        card.style.filter = 'none';
                    } else {
                        card.style.zIndex = 1;
                        card.style.opacity = '0.4';
                        card.style.transform = 'translateY(40px) translateX(32px) scale(0.92)';
                        card.style.filter = 'blur(1px)';
                    }
                });
            }

            setStackState();

            let autoInterval = setInterval(() => {
                activeIndex = (activeIndex + 1) % stackCards.length;
                setStackState();
            }, 6500);

            // Pause on hover
            heroStack.addEventListener('mouseenter', () => clearInterval(autoInterval));
            heroStack.addEventListener('mouseleave', () => {
                autoInterval = setInterval(() => {
                    activeIndex = (activeIndex + 1) % stackCards.length;
                    setStackState();
                }, 6500);
            });

            // Click to cycle
            heroStack.addEventListener('click', () => {
                activeIndex = (activeIndex + 1) % stackCards.length;
                setStackState();
            });

            // Touch/swipe support
            let touchStartX = 0;
            heroStack.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            heroStack.addEventListener('touchend', (e) => {
                const diff = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(diff) > 40) {
                    activeIndex = (activeIndex + (diff < 0 ? 1 : -1) + stackCards.length) % stackCards.length;
                    setStackState();
                }
            }, { passive: true });
        }
    }

    // ===== 5. FAQ ACCORDION =====
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item').forEach(it => it.classList.remove('open'));

            if (!isOpen) item.classList.add('open');
        });
    });

    // ===== 6. FILTER PANEL (Mobile) =====
    const filterToggle = document.getElementById('filter-toggle');
    const filterPanel = document.getElementById('filter-panel');
    const filterClose = document.getElementById('filter-close');

    if (filterToggle && filterPanel) {
        filterToggle.addEventListener('click', () => filterPanel.classList.add('open'));
        if (filterClose) filterClose.addEventListener('click', () => filterPanel.classList.remove('open'));
    }

    // ===== 7. TESTIMONIAL CAROUSEL =====
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonialDots = document.querySelectorAll('.t-dot');
    if (testimonialTrack && testimonialDots.length > 0) {
        let currentSlide = 0;
        const slides = testimonialTrack.querySelectorAll('.testimonial-card');

        function goToSlide(idx) {
            currentSlide = idx;
            testimonialTrack.style.transform = `translateX(-${idx * 100}%)`;
            testimonialDots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        testimonialDots.forEach((dot, i) => {
            dot.addEventListener('click', () => goToSlide(i));
        });

        // Auto-advance every 5s
        setInterval(() => {
            goToSlide((currentSlide + 1) % slides.length);
        }, 5000);

        // Swipe support
        let tStartX = 0;
        testimonialTrack.addEventListener('touchstart', (e) => {
            tStartX = e.touches[0].clientX;
        }, { passive: true });
        testimonialTrack.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - tStartX;
            if (Math.abs(diff) > 40) {
                const next = diff < 0 ? currentSlide + 1 : currentSlide - 1;
                goToSlide((next + slides.length) % slides.length);
            }
        }, { passive: true });
    }

    // ===== 8. ORBIT CHIP TOOLTIPS =====
    const orbitChips = document.querySelectorAll('.orbit-wrap .orbit-chip');
    if (orbitChips.length) {
        const closeAllTips = () => {
            document.querySelectorAll('.orbit-tooltip.active').forEach(t => t.classList.remove('active'));
        };
        orbitChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const tip = chip.querySelector('.orbit-tooltip');
                if (!tip) return;
                const wasActive = tip.classList.contains('active');
                closeAllTips();
                if (!wasActive) tip.classList.add('active');
            });
        });
        document.addEventListener('click', closeAllTips);
    }
});
