document.addEventListener('DOMContentLoaded', () => {

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.add('has-custom-cursor');
        
        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        const updateCursor = () => {
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;

            follower.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(updateCursor);
        };

        let firstMove = true;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (firstMove) {
                posX = mouseX;
                posY = mouseY;
                firstMove = false;
                updateCursor();
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, input, textarea, .availability-badge, .skill-item, .stat-card')) {
                document.body.classList.add('cursor-hover');
            }
            if (e.target.closest('p, h1, h2, h3, span, li, td, th') && !e.target.closest('a, button, .skill-item, .stat-card, .theme-toggle, .menu-toggle')) {
                document.body.classList.add('cursor-text');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('a, button, input, textarea, .availability-badge, .skill-item, .stat-card')) {
                document.body.classList.remove('cursor-hover');
            }
            if (e.target.closest('p, h1, h2, h3, span, li, td, th')) {
                document.body.classList.remove('cursor-text');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-active');
        });

        document.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-active');
        });
    } else {
        if (cursor) cursor.style.display = 'none';
        if (follower) follower.style.display = 'none';
    }

    // Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dark Mode Toggle
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');

    const getSavedTheme = () => {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    };

    const saveTheme = (theme) => {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
        }
    };

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = getSavedTheme();

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
        if (moonIcon) moonIcon.style.display = 'none';
        if (sunIcon) sunIcon.style.display = 'block';
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', 'Toggle Light Mode');
    } else {
        document.body.classList.remove('dark-mode');
        if (moonIcon) moonIcon.style.display = 'block';
        if (sunIcon) sunIcon.style.display = 'none';
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');

            saveTheme(isDark ? 'dark' : 'light');

            if (isDark) {
                if (moonIcon) moonIcon.style.display = 'none';
                if (sunIcon) sunIcon.style.display = 'block';
                themeToggleBtn.setAttribute('aria-label', 'Toggle Light Mode');
            } else {
                if (moonIcon) moonIcon.style.display = 'block';
                if (sunIcon) sunIcon.style.display = 'none';
                themeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
            }
        });
    }

    // Mobile Menu
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav');

    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener('click', () => {
            menuToggleBtn.classList.toggle('active');
            navMenu.classList.toggle('open');
            document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
        });

        const navMenuLinks = navMenu.querySelectorAll('a');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggleBtn.classList.remove('active');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ScrollSpy active class for nav
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');

    function updateActiveNav() {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 300 && rect.bottom >= 100) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                currentSectionId = lastSection.getAttribute('id');
            }
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSectionId && currentSectionId !== 'contact') {
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    updateActiveNav();

    // Skills Category Filter
    const filterPills = document.querySelectorAll('.filter-pill');
    const skillItems = document.querySelectorAll('.skill-item');

    if (filterPills.length > 0 && skillItems.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                if (pill.classList.contains('active')) return;

                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const category = pill.getAttribute('data-category');
                const itemsToHide = [];
                const itemsToShow = [];

                skillItems.forEach(item => {
                    const itemCat = item.getAttribute('data-category');
                    if (category === 'all' || itemCat === category) {
                        itemsToShow.push(item);
                    } else {
                        itemsToHide.push(item);
                    }
                });

                itemsToHide.forEach(item => {
                    if (!item.classList.contains('hidden')) {
                        item.classList.add('fade-exit-active');
                    }
                });

                setTimeout(() => {
                    itemsToHide.forEach(item => {
                        item.classList.add('hidden');
                        item.classList.remove('fade-exit-active');
                    });

                    itemsToShow.forEach(item => {
                        if (item.classList.contains('hidden')) {
                            item.classList.remove('hidden');
                            item.classList.add('fade-enter');
                            
                            void item.offsetWidth;
                            
                            item.classList.add('fade-enter-active');
                            item.classList.remove('fade-enter');
                            
                            setTimeout(() => {
                                item.classList.remove('fade-enter-active');
                            }, 350);
                        }
                    });
                }, 250);
            });
        });
    }

    // Scroll state header
    const header = document.querySelector('header');
    if (header) {
        const toggleHeaderScrolled = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', toggleHeaderScrolled);
        toggleHeaderScrolled();
    }

    // Contact Topic Chips
    const topicChips = document.querySelectorAll('.topic-chip');
    const emailSubject = document.getElementById('email-subject');
    const emailCategory = document.getElementById('email-category');
    const messageLabel = document.getElementById('message-label');

    if (topicChips.length > 0) {
        topicChips.forEach(chip => {
            chip.addEventListener('click', () => {
                topicChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const category = chip.getAttribute('data-category');
                const subject = chip.getAttribute('data-subject');
                if (emailSubject) emailSubject.value = subject;
                if (emailCategory) emailCategory.value = category;

                const label = chip.getAttribute('data-label');
                if (messageLabel && label) {
                    messageLabel.textContent = label;
                }
            });
        });
        
        const activeChip = document.querySelector('.topic-chip.active');
        if (activeChip) {
            const label = activeChip.getAttribute('data-label');
            if (messageLabel && label) messageLabel.textContent = label;
        }
    }
});
