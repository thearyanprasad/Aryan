document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false, // native on mobile
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    // Update Lenis on requestAnimationFrame
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Custom Cursor Upgrade
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.add('has-custom-cursor');

        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;
        
        // Dynamic hover check utility
        const checkHover = (element) => {
            if (!element) return;
            
            const isHoverTarget = element.closest('a, button, input, textarea, .availability-badge, .skill-item, .stat-card, .topic-chip, .cs-toc-pill, .reset-form-btn, .copy-email-btn');
            const isTextTarget = element.closest('p, h1, h2, h3, span, li, td, th, label') && 
                                 !element.closest('a, button, .skill-item, .stat-card, .theme-toggle, .menu-toggle, .topic-chip, .cs-toc-pill, .reset-form-btn, .copy-email-btn, .availability-badge');
            
            if (isHoverTarget) {
                document.body.classList.add('cursor-hover');
            } else {
                document.body.classList.remove('cursor-hover');
            }
            
            if (isTextTarget) {
                document.body.classList.add('cursor-text');
            } else {
                document.body.classList.remove('cursor-text');
            }
        };

        const updateCursor = () => {
            // Lerping for follower cursor position
            posX += (mouseX - posX) * 0.12;
            posY += (mouseY - posY) * 0.12;

            // Calculate movement velocity
            const dx = mouseX - posX;
            const dy = mouseY - posY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            
            // Squash and stretch parameters based on speed
            const maxSquish = 0.35;
            const squish = Math.min(speed / 120, maxSquish);
            const scaleX = 1 + squish;
            const scaleY = 1 - squish;
            
            // Calculate travel angle
            const angle = Math.atan2(dy, dx);
            
            // Apply 3D transforms for high performance GPU rendering
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            
            // Only rotate and squish if we are moving significantly
            if (speed > 1) {
                follower.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${scaleX}, ${scaleY})`;
            } else {
                follower.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%) scale(1)`;
            }

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
            
            checkHover(e.target);
        });

        // Re-check hover element on scroll (resolves hover lock during keyboard scrolling)
        window.addEventListener('scroll', () => {
            const el = document.elementFromPoint(mouseX, mouseY);
            checkHover(el);
        }, { passive: true });

        // Mouse Down / Up click physics
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

    // Smooth scroll for nav links using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            lenis.scrollTo(targetId, {
                offset: 0,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
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
            if (navMenu.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
                lenis.stop();
            } else {
                document.body.style.overflow = '';
                lenis.start();
            }
        });

        const navMenuLinks = navMenu.querySelectorAll('a');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggleBtn.classList.remove('active');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
                lenis.start();
            });
        });
    }

    // ScrollSpy active class for nav
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');

    function updateActiveNav() {
        let currentSectionId = '';

        sections.forEach(section => {
            const id = section.getAttribute('id');
            const hasNavLink = document.querySelector(`nav a[href="#${id}"]`);
            if (hasNavLink) {
                const rect = section.getBoundingClientRect();
                // A section is active if its top is in the upper half of viewport and bottom is below header
                if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= 100) {
                    currentSectionId = id;
                }
            }
        });

        // Fallback for very bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            for (let i = sections.length - 1; i >= 0; i--) {
                const id = sections[i].getAttribute('id');
                if (document.querySelector(`nav a[href="#${id}"]`)) {
                    currentSectionId = id;
                    break;
                }
            }
        }

        if (currentSectionId) {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
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

    // ==========================================================================
    // CASE STUDY DATASTORE & INTERACTIVE ENGINE (VERSION 2)
    // ==========================================================================

    const caseStudies = {
        'ai-venture': {
            badge: 'Featured Platform',
            title: 'AI Venture Intelligence Platform',
            readTime: '⏱️ 5 min read',
            demoUrl: 'https://github.com/thearyanprasad/AI-Venture-Intelligence-Platform',
            sourceUrl: 'https://github.com/thearyanprasad/AI-Venture-Intelligence-Platform',
            heroImg: 'ai_venture_platform.png',
            problem: {
                desc: 'Venture capital partners and investment managers lacked a unified analytical platform to monitor global AI startup activity, track funding rounds across emerging sub-sectors, evaluate valuation growth velocity, and identify high-potential venture opportunities before competitive bidding cycles.',
                why: 'Capital allocation in the AI ecosystem shifts rapidly across foundational models, GPU infrastructure, and vertical applications. Without structured intelligence, investment teams risk misallocating capital to commoditized software tools or missing co-investment syndicates.',
                who: 'VC Managing Partners, Tech Investment Analysts, Portfolio Strategy Leads, and M&A Deal Teams.'
            },
            questions: [
                'Which AI sub-sectors (Generative AI, Infrastructure, MLOps, Vertical SaaS) capture the highest share of venture capital?',
                'What is the median duration and valuation step-up from Seed to Series A across global tech hubs?',
                'How are top-tier VC syndicates structuring lead vs. follow-on investments in high-growth AI markets?'
            ],
            approach: {
                thinking: 'Approached the problem by transforming unstructured venture announcements and deal logs into a structured relational schema. Prioritized tracking capital efficiency and round-over-round valuation multipliers over raw vanity metrics.',
                assumptions: 'Initially assumed foundational model providers captured >60% of total capital inflow; hypothesized application-layer tools faced higher burn rates due to steep customer acquisition costs.',
                rationale: 'Combined SQL staging for ETL, Python for duplicate entity resolution and currency conversion, and Power BI for executive-level interactive visual exploration.'
            },
            dataset: {
                metrics: [
                    { val: '12,500+', lbl: 'Venture Deals' },
                    { val: '3,400+', lbl: 'AI Startups' },
                    { val: '45', lbl: 'Schema Fields' },
                    { val: '2020-2024', lbl: 'Date Range' }
                ],
                desc: 'Synthesized global startup database covering investment transactions, investor syndicate networks, geographic headquarters, valuation metrics, and exit indicators.',
                fields: ['Startup_ID', 'Funding_Round', 'Amount_USD', 'Valuation_USD', 'Lead_Investor', 'Sub_Sector', 'Headquarters', 'Unicorn_Status']
            },
            cleaning: [
                { title: 'Currency Normalization', details: 'Converted localized currency entries (EUR, GBP, JPY) to USD using historical spot rate reference tables matching transaction timestamps to ensure baseline multi-currency parity.' },
                { title: 'Duplicate Entity Resolution', details: 'Scrubbed 420 duplicate press release records across Crunchbase and PitchBook feeds using Python string distance matching on startup names and date windows.' },
                { title: 'Outlier Isolation', details: 'Isolated mega-rounds ($500M+) into dedicated analytical views to prevent skewed median sector valuation metrics across early-stage startup cohorts.' },
                { title: 'Missing Valuation Handling', details: 'Applied sector-median revenue multiple proxies for undisclosed valuations while flagging proxy rows to maintain strict reporting integrity.' }
            ],
            journey: [
                { num: '1', title: 'Business Understanding', desc: 'Engaged with investment partners to establish core VC metrics: LTV/CAC proxies, valuation step-up ratios, and sector momentum.' },
                { num: '2', title: 'Data Exploration', desc: 'Profiled raw JSON deal feeds, identifying missing valuation fields and multi-currency timestamp anomalies.' },
                { num: '3', title: 'Data Cleaning & Transformation', desc: 'Developed Python ETL scripts for deduplication, currency standardization, and schema normalization.' },
                { num: '4', title: 'SQL Staging & DAX Modeling', desc: 'Wrote SQL CTEs for temporal windowing and built DAX measures for dynamic cohort filtering.' },
                { num: '5', title: 'Visualization & UX Design', desc: 'Designed a 6-page glassmorphic Power BI dashboard featuring drill-throughs, slicers, and map charts.' },
                { num: '6', title: 'Insights & Strategy Synthesis', desc: 'Translated visual trends into actionable investment briefs for deal sourcing teams.' }
            ],
            tools: {
                sql: 'Used MySQL for staging transaction logs, partitioning funding rounds, and calculating LAG/LEAD valuation growth percentages.',
                python: 'Utilized Pandas and FuzzyWuzzy for automated entity resolution, currency conversion, and missing data imputation.',
                powerbi: 'Developed multi-page interactive executive dashboards with dynamic DAX measures and custom slicer hierarchies.',
                excel: 'Engineered quick ad-hoc financial cap table models and baseline KPI verification sheets.',
                alternatives: 'Streamlit was considered, but Power BI was selected for native enterprise role-based security and seamless executive interaction.'
            },
            insights: [
                {
                    tag: 'Capital Distribution Skew',
                    title: 'Infrastructure vs Application Capital Concentration',
                    what: 'Generative AI infrastructure and GPU hosting captured 38% of total venture capital inflow despite representing only 12% of total deal volume.',
                    why: 'Massive compute requirements create high barriers to entry, concentrating capital in proven infrastructure providers.',
                    matter: 'Application-layer wrappers experience fast commoditization unless anchored by proprietary data moats.',
                    value: 'Directs venture capital away from low-defensibility wrappers toward infrastructure enablers.'
                },
                {
                    tag: 'Valuation Velocity',
                    title: 'Geographic Acceleration in Tier-1 Hubs',
                    what: 'Startups headquartered in San Francisco and London reached Unicorn status ($1B+) 2.4x faster than regional averages.',
                    why: 'Dense investor syndicate networks enable rapid follow-on funding rounds with minimal friction.',
                    matter: 'Geographic location directly correlates with portfolio liquidity timelines and exit valuations.',
                    value: 'Optimizes deal sourcing workflows to prioritize tier-1 geographic innovation nodes for Series A lead investments.'
                }
            ],
            recommendations: [
                { title: 'Prioritize Proprietary Data Moats', desc: 'Focus 60% of growth-stage capital on vertical AI platforms that possess exclusive data pipelines rather than consumer UI wrappers.' },
                { title: 'Structure Syndicate Lead Terms', desc: 'Partner with established tier-1 leads on Series B extensions to hedge against macro valuation volatility.' },
                { title: 'Automate Signal Detection', desc: 'Deploy automated SQL alert scripts for target startups exhibiting >3x YoY headcount growth paired with steady GitHub commit velocity.' }
            ],
            reflection: {
                challenges: 'Handling non-standard valuation disclosures and multi-currency fluctuations across global deal registries without introducing bias.',
                lessons: 'Early schema normalization and rigorous data hygiene are critical to prevent cascading calculation errors in downstream DAX measures.',
                improvement: 'If rebuilding today, I would implement an automated Apache Airflow data pipeline streaming live deal feeds directly into Snowflake.'
            },
            questions: [
                { q: 'How did you normalize multi-currency valuations in SQL?', a: 'I created a dedicated exchange rate reference table with daily spot rates. By joining deal timestamps with exchange dates, I converted all transactional currency values to USD based on the exact transaction date.' },
                { q: 'Why choose Power BI over a Python web framework like Streamlit?', a: 'Power BI provided native enterprise role-based security, seamless cross-filtering across 6 report pages, and intuitive controls for non-technical investment partners.' },
                { q: 'How did you handle confidential or undisclosed deal valuations?', a: 'I calculated sector-specific median valuation multiples from disclosed deals and applied a flagged proxy metric with clear UI tooltips indicating estimated values, ensuring complete analytical transparency.' },
                { q: 'What SQL window functions were crucial for this project?', a: 'I used LAG() and LEAD() over PARTITION BY startup_id ORDER BY round_date to calculate exact month intervals between funding rounds and track valuation step-up multiples.' },
                { q: 'How did you optimize dashboard performance with over 12,000 records?', a: 'I implemented a Star Schema data model, pushed aggregations back to SQL view layers, and relied on DAX measures rather than calculated columns to minimize memory consumption.' },
                { q: 'What was your approach to deduplicating deal press releases?', a: 'I built a Python script utilizing string similarity matching (difflib) on startup names combined with deal date windows to flag and merge duplicate press release records.' }
            ]
        },

        'ibm-hr': {
            badge: 'Power BI Dashboard',
            title: 'IBM HR Analytics Dashboard',
            readTime: '⏱️ 4 min read',
            demoUrl: 'https://github.com/thearyanprasad/IBM-HR-Analytics-Dashboard',
            sourceUrl: 'https://github.com/thearyanprasad/IBM-HR-Analytics-Dashboard',
            heroImg: 'ibm_hr_1.png',
            problem: {
                desc: 'HR leadership and department managers lacked visibility into workforce attrition drivers, employee turnover demographics, and satisfaction metrics, making it difficult to prevent costly talent loss.',
                why: 'High employee turnover increases recruitment costs, disrupts operational productivity, and degrades institutional knowledge. Retaining key talent requires proactive data-driven intervention.',
                who: 'Chief Human Resources Officers (CHROs), People Analytics Managers, and Regional Department Directors.'
            },
            questions: [
                'What are the primary drivers of voluntary employee attrition across departments?',
                'Does overtime work frequency correlate directly with employee departures in high-stress roles?',
                'Which age brackets, tenure bands, and income levels exhibit the highest churn risk?'
            ],
            approach: {
                thinking: 'Hypothesized that uncompensated overtime combined with low promotion velocity was the primary driver of attrition, rather than baseline compensation alone.',
                assumptions: 'Assumed salary level was the main cause of departures; expected technical roles to have lower turnover due to high market demand.',
                rationale: 'Used Power BI for dynamic DAX modeling, building specialized dashboard pages focused on demographics, turnover drivers, and career satisfaction profiles.'
            },
            dataset: {
                metrics: [
                    { val: '1,470', lbl: 'Employee Records' },
                    { val: '35', lbl: 'HR Attributes' },
                    { val: '16.1%', lbl: 'Baseline Churn' },
                    { val: '3', lbl: 'Dashboard Pages' }
                ],
                desc: 'IBM Watson HR Analytics dataset featuring demographic, compensation, job role, satisfaction ratings, and historical turnover data.',
                fields: ['Age', 'Attrition', 'Department', 'DistanceFromHome', 'JobSatisfaction', 'MonthlyIncome', 'OverTime', 'YearsAtCompany']
            },
            cleaning: [
                { title: 'Zero Variance Removal', details: 'Removed non-informative columns with zero variance across all records (e.g., StandardHours = 80, EmployeeCount = 1, Over18 = Y).' },
                { title: 'Categorical Encoding', details: 'Converted binary text columns (Attrition: Yes/No, OverTime: Yes/No) into integer flags (1/0) for DAX measure calculation.' },
                { title: 'Satisfaction Rating Banning', details: 'Mapped 1-4 ordinal satisfaction survey scores into clear descriptive labels (Low, Medium, High, Very High) for executive reporting.' },
                { title: 'Tenure Grouping', details: 'Created custom binned tenure groups (0-2 yrs, 3-5 yrs, 6-10 yrs, 10+ yrs) to enable demographic cohort analysis.' }
            ],
            journey: [
                { num: '1', title: 'Business Problem Definition', desc: 'Met with HR stakeholders to define key turnover KPIs and target benchmarks.' },
                { num: '2', title: 'Data Profiling & Auditing', desc: 'Inspected 35 dataset fields for missing values, carding issues, and distribution skews.' },
                { num: '3', title: 'Data Transformation in Power Query', desc: 'Scrubbed zero-variance fields and encoded binary flags for DAX compatibility.' },
                { num: '4', title: 'DAX Modeling & Metrics Engine', desc: 'Calculated dynamic Attrition Rate %, Turnover Cost, and Overtime Impact measures.' },
                { num: '5', title: 'Interactive Dashboard Design', desc: 'Built a 3-page interactive suite covering Executive Summary, Demographics, and Retention Strategy.' },
                { num: '6', title: 'HR Policy Recommendations', desc: 'Synthesized findings into strategic HR interventions targeting high-risk employee segments.' }
            ],
            tools: {
                sql: 'Used SQL for baseline data validation, summary group-by queries, and checking distribution balances.',
                python: 'Utilized Python for exploratory data analysis (EDA) and computing Pearson correlation matrices between variables.',
                powerbi: 'Developed 3 interactive dashboard pages with customized DAX measures, slicers, and conditional visual formatting.',
                excel: 'Conducted quick pivot table cross-tabulations during preliminary data discovery.',
                alternatives: 'Tableau was considered, but Power BI was selected for seamless integration with corporate Microsoft ecosystems.'
            },
            insights: [
                {
                    tag: 'Overtime Friction',
                    title: 'Overtime Work Drives 53.6% of Total Turnover',
                    what: 'Employees working frequent overtime exhibited an attrition rate of 30.5%, compared to only 10.4% among non-overtime staff.',
                    why: 'Prolonged overtime without clear career progression triggers burn-out and job dissatisfaction.',
                    matter: 'Overtime workers represent over half of all corporate resignations despite being a minority of total headcount.',
                    value: 'Identifies immediate intervention targets to dramatically reduce voluntary employee departures.'
                },
                {
                    tag: 'Tenure Risk Window',
                    title: 'High Attrition in Young Professionals (20-30 Age Bracket)',
                    what: 'Employees aged 20-30 in Sales & R&D departments showed a 24.7% attrition rate, peaking at 2-3 years of company tenure.',
                    why: 'Early-career employees frequently change companies to achieve faster salary progression when internal promotions stall.',
                    matter: 'Losing early-career talent depletes the future leadership pipeline and increases replacement hiring expenses.',
                    value: 'Enables HR to introduce targeted retention bonuses and structured 18-month career progression pathing.'
                }
            ],
            recommendations: [
                { title: 'Automated Overtime Alert Thresholds', desc: 'Implement automated HR manager alerts when individual employees exceed 15 consecutive hours of overtime per month.' },
                { title: '18-Month Career Progression Reviews', desc: 'Establish structured career pathway reviews at month 18 for high-performing junior engineers and sales representatives.' },
                { title: 'Flexible Work Options for High-Commute Staff', desc: 'Offer hybrid remote work policies for staff commuting >15 miles, addressing distance-related attrition triggers.' }
            ],
            reflection: {
                challenges: 'Designing dynamic DAX measures that maintain accurate filter context across complex multi-slicer combinations.',
                lessons: 'Categorical survey scores need careful transformation into intuitive business labels to drive actionable executive discussions.',
                improvement: 'If rebuilding today, I would train a Logistic Regression or Random Forest model in Python to calculate individual employee attrition risk scores.'
            },
            questions: [
                { q: 'Why did you select Attrition Rate % as your primary KPI instead of total headcount loss?', a: 'Raw headcount loss obscures department size variations. Attrition Rate % normalizes departures across departments of different sizes, allowing fair performance comparisons.' },
                { q: 'How did you handle DAX filter context when calculating Overtime Attrition Impact?', a: 'I used CALCULATE() combined with FILTER() and ALLSELECTED() to compute overtime churn percentages while preserving active user slicers on department and job role.' },
                { q: 'What steps did you take to clean the IBM HR dataset?', a: 'I removed 3 zero-variance columns, encoded text flags (Yes/No) into binary numeric indicators (1/0), binned tenure and age metrics, and transformed 1-4 satisfaction scores into intuitive descriptive categories.' },
                { q: 'How does your dashboard help HR managers take immediate action?', a: 'The dashboard highlights high-risk employee cohorts through color-coded KPI cards and allows managers to filter down to specific job roles and overtime brackets in two clicks.' },
                { q: 'What alternative approaches did you consider for analyzing turnover?', a: 'I considered survival analysis in Python (Kaplan-Meier curves), but chose an interactive Power BI dashboard to give HR business partners immediate self-service drilldown capabilities.' },
                { q: 'How would you measure the business ROI of implementing your recommendations?', a: 'By tracking overall attrition rate reduction over 12 months and multiplying retained headcount by average replacement cost (typically 1.5x annual salary).' }
            ]
        },

        'lv-analytics': {
            badge: 'Power BI Dashboard',
            title: 'LV Analytics Dashboard',
            readTime: '⏱️ 4 min read',
            demoUrl: 'https://github.com/thearyanprasad/LV-Analytics-Dashboard',
            sourceUrl: 'https://github.com/thearyanprasad/LV-Analytics-Dashboard',
            heroImg: 'lv_dashboard.png',
            problem: {
                desc: 'Operations executives and store network directors lacked centralized visibility into retail product performance, store-level operational margins, inventory throughput, and regional supply fulfillment bottlenecks.',
                why: 'Fragmented reporting across store locations leads to delayed stock re-orders, imbalanced regional inventory, and reduced gross margins in premium product lines.',
                who: 'Retail Operations Vice Presidents, Inventory Planning Directors, and Regional Store Operations Managers.'
            },
            questions: [
                'Which retail product categories yield the highest operational margin contribution across store networks?',
                'Where are regional fulfillment bottlenecks causing extended stockout cycles?',
                'How do seasonal sales velocity patterns vary across store tiers and geographic territories?'
            ],
            approach: {
                thinking: 'Focused on creating a top-down executive analytical hierarchy: top-level KPI cards for immediate operational health checks, supported by detailed regional drill-through views.',
                assumptions: 'Assumed high sales volume correlated directly with high net profit margin; expected store size to be the dominant performance predictor.',
                rationale: 'Built dynamic DAX measures for rolling averages and margin percentages in Power BI to give regional managers instant slice-and-dice capability.'
            },
            dataset: {
                metrics: [
                    { val: '8,800+', lbl: 'Store Records' },
                    { val: '12', lbl: 'Product Lines' },
                    { val: '28', lbl: 'Fields' },
                    { val: '99.4%', lbl: 'Data Accuracy' }
                ],
                desc: 'Operational sales registry tracking retail transactions, inventory turnover rates, margin percentages, and regional store performance metrics.',
                fields: ['Store_ID', 'Region', 'Category', 'Units_Sold', 'Revenue', 'Margin_Pct', 'Fulfillment_Days', 'Stockout_Flag']
            },
            cleaning: [
                { title: 'Timezone Synchronization', details: 'Normalized transaction timestamps across 4 different geographic time zones to ensure accurate daily sales alignment.' },
                { title: 'Missing Store ID Mapping', details: 'Imputed missing store location tags by cross-referencing postal codes against master store geospatial reference tables.' },
                { title: 'Duplicate Order Removal', details: 'Deduplicated order fulfillment records caused by multi-shipment split orders using unique order transaction keys.' },
                { title: 'Margin Outlier Capping', details: 'Corrected data entry anomalies where margin percentages exceeded 100% due to return credit adjustments.' }
            ],
            journey: [
                { num: '1', title: 'Operational Needs Assessment', desc: 'Collaborated with retail directors to pinpoint critical operational KPIs: margin %, stockout frequency, and turnover velocity.' },
                { num: '2', title: 'Data Extraction & Audit', desc: 'Extracted transaction feeds, identifying timezone mismatches and postal code gaps.' },
                { num: '3', title: 'Transformation in Power Query', desc: 'Normalized timestamps, mapped store geospatial IDs, and calculated gross margin fields.' },
                { num: '4', title: 'Data Modeling & DAX Engine', desc: 'Structured a Star Schema model and developed dynamic DAX measures for rolling inventory averages.' },
                { num: '5', title: 'Dashboard UI Development', desc: 'Designed a high-contrast executive dashboard with custom visual cards, maps, and category slicers.' },
                { num: '6', title: 'Operational Review', desc: 'Presented dashboard insights to store operations leads to guide regional inventory rebalancing.' }
            ],
            tools: {
                sql: 'Used SQL for ETL data staging, aggregating store transactions, and creating indexed analytics views.',
                python: 'Utilized Python for data validation scripts and distribution testing across store tiers.',
                powerbi: 'Engineered dynamic Power BI reports featuring Star Schema data modeling, DAX measures, and drill-through navigation.',
                excel: 'Utilized Excel for quick baseline metric reconciliation against operational financial statements.',
                alternatives: 'Looker was considered, but Power BI was selected for superior offline desktop development and custom visual formatting options.'
            },
            insights: [
                {
                    tag: 'Margin Concentration',
                    title: 'Top 15% Premium Lines Drive 62% of Operational Margin',
                    what: 'High-end luxury product categories generated 62% of total operational margin despite accounting for only 22% of total unit sales volume.',
                    why: 'Premium pricing power and low production cost variance yield significantly higher gross margin percentages.',
                    matter: 'Operational focus must prioritize inventory availability for premium lines over high-volume low-margin items.',
                    value: 'Reallocates warehouse storage and priority shipping resources toward top-tier margin categories.'
                },
                {
                    tag: 'Supply Bottleneck',
                    title: 'East Region Stockouts Exceed Baseline by 14 Days',
                    what: 'Stores in the East sales region experienced stockout durations averaging 18 days, compared to a 4-day average in West stores.',
                    why: 'Centralized distribution warehouses in the East faced transportation scheduling delays during peak quarter transitions.',
                    matter: 'Extended stockouts resulted in estimated lost revenue opportunities during high-traffic retail windows.',
                    value: 'Justifies establishing a regional satellite distribution hub to reduce transit lead times by 65%.'
                }
            ],
            recommendations: [
                { title: 'Establish Regional Safety Stock Buffer', desc: 'Increase minimum safety stock thresholds by 25% for top 15% margin categories in East region store warehouses.' },
                { title: 'Implement Automated Re-order Triggers', desc: 'Deploy automated inventory re-order alerts in Power BI when stock levels drop below 7 days of projected sales.' },
                { title: 'Store Tier Inventory Rebalancing', desc: 'Reallocate slow-moving premium inventory from Tier-3 stores to flagship Tier-1 locations with higher sales velocity.' }
            ],
            reflection: {
                challenges: 'Optimizing DAX performance across thousands of daily transaction records without causing visual rendering lag.',
                lessons: 'Executive dashboards require strict visual hierarchy—showing key numbers at a glance before presenting granular tables.',
                improvement: 'If rebuilding today, I would incorporate predictive demand forecasting models using Python prophet algorithms directly into Power BI.'
            },
            questions: [
                { q: 'How did you design the underlying data model for the LV Analytics Dashboard?', a: 'I implemented a Star Schema model consisting of a central Store_Sales fact table surrounded by Store, Product, Geography, and Date dimension tables to ensure optimal DAX evaluation speed.' },
                { q: 'What steps did you take to ensure high dashboard rendering performance?', a: 'I minimized calculated columns, pre-aggregated transactional data in SQL views, limited visual counts per page, and optimized DAX measures using DIVIDE() and KEEPFILTERS().' },
                { q: 'How did you handle stockout tracking in your data model?', a: 'I created a binary Stockout_Flag measure triggered when inventory falls to zero, combined with DATEDIFF() calculations to track total stockout duration days.' },
                { q: 'Why did you choose Power BI over building a custom web dashboard?', a: 'Power BI offered immediate out-of-the-box cross-filtering, native mobile layout options, and seamless integration with corporate Microsoft security infrastructure.' },
                { q: 'How would you explain the operational value of this dashboard to a store manager?', a: 'It replaces manual spreadsheet reporting with a single view that shows exactly which high-margin items are running low and need immediate re-ordering.' },
                { q: 'What was the most challenging data cleaning step?', a: 'Synchronizing timestamps across 4 different timezones and deduplicating split-shipment orders using composite transaction keys.' }
            ]
        },

        'pokemon-excel': {
            badge: 'Excel Dashboard',
            title: 'Pokémon Excel Dashboard',
            readTime: '⏱️ 3 min read',
            demoUrl: 'https://github.com/thearyanprasad/pokemon-excel-dashboard',
            sourceUrl: 'https://github.com/thearyanprasad/pokemon-excel-dashboard',
            heroImg: 'pokemon_dashboard.png',
            problem: {
                desc: 'Game balance designers and competitive analysts lacked an interactive, lightweight framework to audit character combat statistics across 800+ records, slowing down game rebalancing updates.',
                why: 'Evaluating stat distributions, elemental type resistances, and legendary power skews across multiple generations required tedious manual spreadsheet filtering.',
                who: 'Game Mechanics Designers, Combat Balance Analysts, and Competitive Gaming Strategists.'
            },
            questions: [
                'Which elemental type combinations exhibit disproportionately high base stat efficiency?',
                'How severe is stat inflation (power creep) across successive generations (Gen 1 to Gen 7)?',
                'What is the true stat gap between Legendary/Mythical Pokémon and standard competitive rosters?'
            ],
            approach: {
                thinking: 'Designed a dynamic, zero-dependency Excel dashboard utilizing dynamic array formulas, interactive Pivot Tables, and visual Slicers.',
                assumptions: 'Assumed Legendary Pokémon dominated all stat categories; expected Dragon types to hold the highest average base stat totals.',
                rationale: 'Selected Microsoft Excel to maximize accessibility for non-technical game designers who require instant offline manipulation without database software.'
            },
            dataset: {
                metrics: [
                    { val: '800+', lbl: 'Pokémon Records' },
                    { val: '7', lbl: 'Generations' },
                    { val: '13', lbl: 'Stat Fields' },
                    { val: '35%', lbl: 'Search Speedup' }
                ],
                desc: 'Comprehensive Pokémon combat registry containing stat attributes (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed), elemental typing, and generation metadata.',
                fields: ['Pokedex_ID', 'Name', 'Type_1', 'Type_2', 'Total_Stats', 'HP', 'Attack', 'Defense', 'Speed', 'Generation', 'Legendary']
            },
            cleaning: [
                { title: 'Secondary Type Imputation', details: 'Populated missing Type_2 entries for single-type Pokémon with "None" labels to prevent Pivot Table group breaks.' },
                { title: 'Stat Sum Verification', details: 'Audited and verified calculated Total_Stats fields against individual stat components (HP + Atk + Def + SpAtk + SpDef + Spd).' },
                { title: 'Duplicate Form Disambiguation', details: 'Categorized Mega Evolutions, Regional Variants, and Forme changes into explicit sub-categories to prevent double-counting species counts.' },
                { title: 'Data Formatting Standardization', details: 'Applied consistent integer formatting, custom color scales, and data validation drop-downs across all workbook tabs.' }
            ],
            journey: [
                { num: '1', title: 'User Requirements', desc: 'Identified key analytical needs of game balance designers: instant type comparisons and stat filtering.' },
                { num: '2', title: 'Data Structuring & Validation', desc: 'Ingested raw CSV data into structured Excel Tables (`Ctrl + T`) and audited formula integrity.' },
                { num: '3', title: 'Data Cleaning & Labeling', desc: 'Handled single-type N/A values, verified stat totals, and created form category tags.' },
                { num: '4', title: 'Pivot Table & Slicer Engine', desc: 'Built multi-index Pivot Tables and connected interactive visual Slicers across tabs.' },
                { num: '5', title: 'UI Formatting & Conditional Rules', desc: 'Applied custom color-coded conditional formatting rules to highlight top stat distributions.' },
                { num: '6', title: 'Balance Insights Synthesis', desc: 'Summarized stat inflation patterns and elemental resistance anomalies for game balance teams.' }
            ],
            tools: {
                sql: 'Used SQLite for initial data verification and checking multi-type group aggregations.',
                python: 'Utilized Python Pandas for fast preliminary exploratory data profiling.',
                powerbi: 'Evaluated Power BI, but opted for Excel to satisfy the user requirement for dynamic offline spreadsheet editing.',
                excel: 'Utilized advanced Excel functions (INDEX/MATCH, XLOOKUP, Pivot Tables, Slicers, Dynamic Arrays, Conditional Formatting).',
                alternatives: 'A web dashboard was considered, but Excel provided instant zero-overhead distribution among game designers.'
            },
            insights: [
                {
                    tag: 'Stat Inflation',
                    title: 'Generation 4 Introduced Peak Base Stat Power Creep',
                    what: 'Generation 4 Pokémon exhibited a 12.4% higher average Total Stat baseline compared to Generation 1 species.',
                    why: 'Introduction of powerful legendary trios and evolved forms raised baseline stat expectations.',
                    matter: 'Unchecked stat creep invalidates older roster choices in competitive battle environments.',
                    value: 'Provides game designers with empirical stat targets to rebalance legacy characters in future balance patches.'
                },
                {
                    tag: 'Type Advantage Skew',
                    title: 'Steel & Dragon Dual-Types Lead Defense Ratios',
                    what: 'Steel/Dragon dual-typing yielded a 34% higher effective defense rating due to combining 9 elemental resistances.',
                    why: 'Typing mechanics grant compounding defensive multipliers when combined with high base Defense stats.',
                    matter: 'Certain type combinations create oppressive competitive metagames if left unadjusted.',
                    value: 'Guides balance designers to adjust base stat distribution caps for highly resistant type combinations.'
                }
            ],
            recommendations: [
                { title: 'Cap Base Stat Increases on Future Gens', desc: 'Enforce a maximum average stat ceiling of 480 for non-legendary additions in upcoming game releases.' },
                { title: 'Adjust Defensive Modifiers for Steel Combos', desc: 'Tweak defensive damage multipliers for dual-Steel types to encourage broader competitive roster diversity.' },
                { title: 'Rebalance Legacy Generation Stats', desc: 'Apply targeted stat buffs (+15 HP/Speed) to underperforming Generation 1 and 2 fully evolved species.' }
            ],
            reflection: {
                challenges: 'Maintaining Excel workbook calculation speed when using complex dynamic array formulas across multiple linked Pivot Tables.',
                lessons: 'Proper Excel Table naming and structured references (`[@Total_Stats]`) make workbooks far easier to maintain and update.',
                improvement: 'If rebuilding today, I would use Excel Power Query to build an automated data refresh pipeline from online Pokedex APIs.'
            },
            questions: [
                { q: 'Why choose Microsoft Excel over Power BI or Python for this dashboard?', a: 'Game balance designers needed an offline, zero-dependency tool they could edit and tweak directly during balance discussions without installing database or BI software.' },
                { q: 'How did you ensure your Excel dashboard stays dynamic when new data is added?', a: 'I stored all source data in formatted Excel Tables (`Ctrl + T`). Any new rows added automatically expand formula ranges and update connected Pivot Tables on refresh.' },
                { q: 'What advanced Excel formulas did you utilize?', a: 'I used XLOOKUP for flexible multi-criteria lookups, INDEX/MATCH for dynamic matrix searches, and dynamic array formulas like FILTER() and UNIQUE() for auto-updating slicer lists.' },
                { q: 'How did you handle single-type Pokémon in your cleaning process?', a: 'I replaced missing Type_2 entries with "None" string values so that Pivot Tables could group and filter secondary types without dropping single-type species.' },
                { q: 'How did you measure user efficiency improvements?', a: 'By timing search and comparison workflows—the dynamic slicer setup reduced type comparison lookups from 45 seconds to under 5 seconds (a 35% overall task speedup).' },
                { q: 'What conditional formatting logic did you apply?', a: 'I built dynamic color scales based on stat percentile ranges, automatically highlighting top 10% stats in green and bottom 10% stats in subtle red.' }
            ]
        },

        'sql-analytics': {
            badge: 'SQL Scripting',
            title: 'SQL Analytics Project',
            readTime: '⏱️ 4 min read',
            demoUrl: 'https://github.com/thearyanprasad/sql-sales-analysis',
            sourceUrl: 'https://github.com/thearyanprasad/sql-sales-analysis',
            heroImg: 'sql_analysis.png',
            problem: {
                desc: 'E-commerce business managers could not analyze customer cohort retention rates, repeat purchase cycles, or revenue churn patterns across transaction logs containing over 50,000 sales records.',
                why: 'Without structured cohort query pipelines, marketing teams were unable to identify when customer drop-off occurred or measure true Customer Lifetime Value (LTV).',
                who: 'E-Commerce Growth Managers, Head of Performance Marketing, and Retention Strategy Leads.'
            },
            questions: [
                'What is the 30-60-90 day customer cohort repeat purchase retention rate across registration channels?',
                'Which buyer segments contribute the highest cumulative revenue Lifetime Value (LTV)?',
                'What seasonal purchase churn patterns occur between initial order and second purchase?'
            ],
            approach: {
                thinking: 'Engineered a modular SQL query architecture utilizing Common Table Expressions (CTEs), Window Functions (LAG, LEAD, NTILE), and temporal aggregations to build cohort retention matrices.',
                assumptions: 'Assumed initial discount campaigns generated high long-term retention; expected customer churn to peak at day 90.',
                rationale: 'Utilized MySQL for high-performance server-side data processing, staging raw transaction logs into clean relational views for fast reporting.'
            },
            dataset: {
                metrics: [
                    { val: '50,000+', lbl: 'Sales Transactions' },
                    { val: '12,400', lbl: 'Unique Customers' },
                    { val: '18', lbl: 'DB Columns' },
                    { val: '18%', lbl: 'Cohort Churn Found' }
                ],
                desc: 'Relational e-commerce database schema comprising Customers, Orders, Order_Items, Products, and Payment_Logs tables.',
                fields: ['Order_ID', 'Customer_ID', 'Order_Date', 'Total_Amount', 'Payment_Status', 'Product_Category', 'Acquisition_Channel']
            },
            cleaning: [
                { title: 'Duplicate Transaction Purging', details: 'Eliminated duplicate order records generated by gateway retry events using ROW_NUMBER() OVER (PARTITION BY transaction_hash ORDER BY order_date).' },
                { title: 'Date Data Type Standardizing', details: 'Cast string timestamp attributes into standard DATETIME formats to enable MySQL DATE_ADD() and DATEDIFF() function evaluation.' },
                { title: 'Cancelled Order Filtering', details: 'Filtered out refunded and test transaction orders (Payment_Status = "Failed" OR "Test") from core LTV cohort aggregations.' },
                { title: 'Null Foreign Key Auditing', details: 'Identified and isolated orphaned order records missing valid Customer_ID references into audit logging tables.' }
            ],
            journey: [
                { num: '1', title: 'Business Problem Formulation', desc: 'Aligned with growth marketing teams to target core retention KPIs: Cohort Retention %, LTV, and Churn Rate.' },
                { num: '2', title: 'Database Schema Audit', desc: 'Inspected relational ERD diagrams, auditing foreign key integrity across transaction tables.' },
                { num: '3', title: 'Data Cleaning via SQL Scripts', desc: 'Executed DDL and DML scripts to remove duplicates, format dates, and filter test transactions.' },
                { num: '4', title: 'CTE Cohort Query Engineering', desc: 'Wrote modular CTEs calculating initial order dates, cohort month buckets, and repeat purchase intervals.' },
                { num: '5', title: 'Window Function Analysis', desc: 'Applied NTILE() for customer spend tiering and LAG() to compute order-to-order lapse days.' },
                { num: '6', title: 'Executive Insight Briefing', desc: 'Translated complex SQL query outputs into clear visual cohort matrices and strategic briefs.' }
            ],
            tools: {
                sql: 'Engineered advanced MySQL queries using CTEs, Window Functions (ROW_NUMBER, LAG, NTILE), CASE statements, and complex JOINs.',
                python: 'Used Python (SQLAlchemy/Pandas) for automated database connection testing and export verification.',
                powerbi: 'Connected Power BI directly to SQL views for dynamic cohort matrix visual rendering.',
                excel: 'Utilized Excel for quick sanity-checking of aggregated cohort retention outputs against raw accounting logs.',
                alternatives: 'BigQuery was considered, but MySQL was selected to match the client\'s existing local database infrastructure.'
            },
            insights: [
                {
                    tag: 'Cohort Churn Spike',
                    title: '18% Season-over-Season Drop in Q3 Buyer Retention',
                    what: 'Customer cohorts acquired during Q3 promotional events exhibited an 18% lower 60-day repeat purchase rate compared to Q1 cohorts.',
                    why: 'Discount-driven promotional acquisition attracted price-sensitive one-time buyers with low brand affinity.',
                    matter: 'High customer acquisition spend in Q3 yielded poor long-term Customer Lifetime Value (LTV).',
                    value: 'Reallocates marketing budget away from deep-discount ads toward value-added retention campaigns.'
                },
                {
                    tag: 'Pareto Spend Skew',
                    title: 'Top 10% Buyer Cohort Generates 48% of Net Revenue',
                    what: 'NTILE(10) segmentation revealed that the top decile of repeat customers accounts for nearly half of total net annual revenue.',
                    why: 'Repeat buyers exhibit 3.2x higher average order values (AOV) and order frequency compared to single-purchase customers.',
                    matter: 'Retention efforts focused on high-tier cohorts yield exponentially higher return on investment.',
                    value: 'Establishes a dedicated VIP loyalty tier program to safeguard high-LTV customer segments.'
                }
            ],
            recommendations: [
                { title: 'Trigger Day-45 Re-engagement Automations', desc: 'Deploy automated email re-engagement flows at day 45 post-first purchase when churn risk peaks.' },
                { title: 'Launch High-LTV VIP Loyalty Tier', desc: 'Introduce exclusive perks and early product access for customers entering the top spend decile.' },
                { title: 'Refine Acquisition Channel Budgeting', desc: 'Reduce acquisition spend on channels generating high initial volume but low 60-day cohort retention.' }
            ],
            reflection: {
                challenges: 'Query execution lag when running multi-stage CTE joins across 50,000+ unindexed order rows.',
                lessons: 'Adding composite database indexes on (Customer_ID, Order_Date) reduced query execution time by 82% (from 4.2s to 0.75s).',
                improvement: 'If rebuilding today, I would create materialized views or scheduled dbt transformation models for daily cohort updates.'
            },
            questions: [
                { q: 'Walk me through how you calculated cohort retention rates in SQL.', a: 'I used a 3-stage CTE: First CTE found each customer\'s initial purchase date (cohort month). Second CTE calculated subsequent purchase dates and month differences. Third CTE aggregated count of active customers per cohort month divided by initial cohort size.' },
                { q: 'How did you optimize query execution speed on 50,000+ transaction rows?', a: 'I analyzed the EXPLAIN query execution plan, identified full table scans on join keys, and created composite indexes on (customer_id, order_date) which dropped execution time from 4.2 seconds to 0.75 seconds.' },
                { q: 'Why did you use CTEs instead of subqueries in your SQL scripts?', a: 'CTEs significantly improve query readability, allow modular step-by-step debugging, and enable reuse of intermediate tables across complex window function calculations.' },
                { q: 'How did you handle duplicate transactions in your SQL cleaning stage?', a: 'I used ROW_NUMBER() OVER (PARTITION BY customer_id, order_date, total_amount ORDER BY order_id) to assign rank numbers, then filtered WHERE row_num = 1.' },
                { q: 'What window function was most useful for customer segmentation?', a: 'NTILE(10) OVER (ORDER BY SUM(total_amount) DESC) allowed me to cleanly group customers into 10 equal spend deciles to uncover Pareto revenue distribution.' },
                { q: 'How would this SQL pipeline scale to millions of rows in a cloud data warehouse?', a: 'In BigQuery or Snowflake, I would partition tables by order_date, cluster by customer_id, and use materialized view tables to serve pre-calculated cohort metrics.' }
            ]
        },

        'lumis-ai': {
            badge: 'AI Assistant',
            title: 'Lumis AI (Work in Progress)',
            readTime: '⏱️ 4 min read',
            demoUrl: 'https://github.com/thearyanprasad/Lumis-AI',
            sourceUrl: 'https://github.com/thearyanprasad/Lumis-AI',
            heroImg: 'lumis_ai.png',
            problem: {
                desc: 'Non-technical business executives and operational managers struggle to extract immediate analytical insights from SQL databases and CSV reports without waiting for dedicated analyst teams to write queries.',
                why: 'Manual data request queues create reporting bottlenecks, slowing down executive decision-making and operational responses.',
                who: 'Executive Leadership, Business Development Leads, and Non-Technical Operations Managers.'
            },
            questions: [
                'How can natural language user queries be reliably translated into accurate SQL queries without syntax errors?',
                'What architectural safeguards prevent AI hallucination and SQL injection security risks when querying databases?',
                'How can automated Python tools summarize complex query outputs into concise executive business briefs?'
            ],
            approach: {
                thinking: 'Designing an end-to-end Python architecture combining schema metadata injection, LLM API endpoints, and Streamlit user interfaces for interactive query execution.',
                assumptions: 'Assumed off-the-shelf LLMs could query databases without schema context; expected prompt engineering alone to guarantee zero syntax errors.',
                rationale: 'Building in Python for its extensive AI/ML ecosystem (LangChain, Pandas, SQLAlchemy) and deploying via Streamlit for instant interactive prototyping.'
            },
            dataset: {
                metrics: [
                    { val: '15,000', lbl: 'Benchmark Records' },
                    { val: '42%', lbl: 'Accuracy Gain' },
                    { val: '4', lbl: 'Python Modules' },
                    { val: 'In Progress', lbl: 'Dev Status' }
                ],
                desc: 'Corporate analytics benchmark datasets containing financial records, sales logs, operations tables, and schema metadata dictionaries.',
                fields: ['User_Prompt', 'Generated_SQL', 'Query_Status', 'Execution_Time', 'Summary_Output', 'Schema_Context']
            },
            cleaning: [
                { title: 'Schema Metadata Preprocessing', details: 'Scrubbed and structured database table DDL definitions into concise JSON metadata context blocks for prompt injection.' },
                { title: 'Prompt Sanitization', details: 'Built regex input filters to strip malicious SQL injection keywords (DROP, DELETE, ALTER, TRUNCATE) from user input prompts.' },
                { title: 'Response Token Scrubbing', details: 'Parsed and stripped markdown formatting code blocks (` ```sql `) from LLM API outputs to extract pure executable SQL strings.' },
                { title: 'Error Fallback Handling', details: 'Implemented automatic retry logic that feeds SQL execution error messages back into the LLM prompt for self-correction.' }
            ],
            journey: [
                { num: '1', title: 'Architecture & UX Specification', desc: 'Defined system requirements for natural language to SQL translation and executive summary generation.' },
                { num: '2', title: 'Schema Context Engineering', desc: 'Structured database DDL metadata injection pipelines to give the LLM full table relationship context.' },
                { num: '3', title: 'Python Engine & API Integration', desc: 'Developed core Python backend modules connecting OpenAI/LLM APIs with SQLAlchemy database connectors.' },
                { num: '4', title: 'Security & Safety Hardening', desc: 'Built regex SQL sanitization rules restricting execution to read-only SELECT statements.' },
                { num: '5', title: 'Streamlit Interface Design', desc: 'Constructed an intuitive Streamlit UI featuring prompt input boxes, SQL code previews, and data tables.' },
                { num: '6', title: 'Accuracy Benchmarking & Iteration', desc: 'Tested prompt variations across 100 sample business questions to optimize SQL translation accuracy.' }
            ],
            tools: {
                sql: 'Used SQL (SQLAlchemy) for executing read-only generated queries against target SQLite and MySQL databases.',
                python: 'Utilized Python (Pandas, LangChain, OpenAI API, Streamlit) for core backend logic, prompt handling, and UI rendering.',
                powerbi: 'Evaluated Power BI integration, but built a Streamlit web app to enable real-time conversational AI interactions.',
                excel: 'Used Excel for tracking benchmark query accuracy scores across prompt engineering iterations.',
                alternatives: 'LlamaIndex was evaluated, but custom LangChain prompt templates provided tighter control over SQL schema injection.'
            },
            insights: [
                {
                    tag: 'Prompt Accuracy',
                    title: 'Schema-Aware Prompting Boosts SQL Accuracy by 42%',
                    what: 'Injecting dynamic table schemas and column descriptions into prompt templates increased correct SQL generation from 54% to 96%.',
                    why: 'LLMs require explicit schema context (foreign key relationships and data types) to select correct join paths.',
                    matter: 'Without schema context, AI assistants frequently generate hallucinated column names and invalid JOIN conditions.',
                    value: 'Ensures business executives receive accurate data outputs without requiring technical query correction.'
                },
                {
                    tag: 'Workflow Acceleration',
                    title: 'Executive Reporting Drafting Time Reduced by 85%',
                    what: 'Automated Python text summarization of query result sets reduced executive report drafting time from hours to seconds.',
                    why: 'Natural language processing translates raw tabular data into structured narrative bullet points instantly.',
                    matter: 'Accelerates business decision velocity during executive meetings and strategy reviews.',
                    value: 'Frees up human analytics teams from answering repetitive basic data requests.'
                }
            ],
            recommendations: [
                { title: 'Enforce Read-Only Database Credentials', desc: 'Restrict AI execution database user permissions strictly to SELECT operations to guarantee data security.' },
                { title: 'Implement Human-in-the-Loop Verification', desc: 'Require analyst review for high-impact financial queries before exporting summaries for executive presentations.' },
                { title: 'Expand Vector Search Schema Discovery', desc: 'Integrate FAISS vector indexing to dynamically inject relevant table schemas for databases with >100 tables.' }
            ],
            reflection: {
                challenges: 'Handling complex multi-table JOINs and nested aggregations where user prompts contained ambiguous business terms.',
                lessons: 'Providing few-shot SQL query examples inside the prompt significantly improves LLM handling of edge-case business logic.',
                improvement: 'Currently implementing a RAG vector index (FAISS) to scale schema injection across enterprise database architectures.'
            },
            questions: [
                { q: 'How do you prevent Lumis AI from executing destructive SQL commands like DROP or DELETE?', a: 'I implemented a multi-layer security model: First, regex input filtering blocks DDL/DML keywords. Second, the backend uses a dedicated read-only database user role that physically rejects non-SELECT queries.' },
                { q: 'How do you handle schema changes in target databases?', a: 'Lumis AI dynamically inspects database metadata using SQLAlchemy inspector objects at runtime, auto-updating the schema context injected into the prompt without manual code changes.' },
                { q: 'What happens when the LLM generates a SQL query with syntax errors?', a: 'The system catches SQL execution exceptions, appends the error message to the prompt context, and sends a retry call to the LLM to self-correct the query automatically.' },
                { q: 'Why choose Streamlit for the user interface?', a: 'Streamlit allows rapid Python-native web interface deployment with built-in support for dataframes, visual charts, code blocks, and real-time session state management.' },
                { q: 'How did you evaluate the accuracy of generated SQL queries?', a: 'I built an automated benchmarking suite in Python that runs generated queries against a ground-truth dataset and compares result set dataframes for exact equality.' },
                { q: 'What is your vision for completing this work-in-progress project?', a: 'Adding FAISS vector search for large-scale schema indexing, introducing chart auto-generation (Plotly), and deploying as a containerized Microservice via Docker.' }
            ]
        }
    };

    // DOM Elements for Modal
    const modalBackdrop = document.getElementById('cs-modal-backdrop');
    const modalTitle = document.getElementById('cs-modal-title');
    const modalBadge = document.getElementById('cs-modal-badge');
    const readTimeEl = document.getElementById('cs-read-time');
    const demoBtn = document.getElementById('cs-modal-demo-btn');
    const sourceBtn = document.getElementById('cs-modal-source-btn');
    const closeBtn = document.getElementById('cs-modal-close');
    const modalBody = document.getElementById('cs-modal-body');
    const progressBar = document.getElementById('cs-progress-bar');
    const tocPills = document.querySelectorAll('.cs-toc-pill');

    let activeProjectKey = null;

    // Render Case Study Content
    function renderCaseStudy(key) {
        const cs = caseStudies[key];
        if (!cs) return;

        activeProjectKey = key;
        modalTitle.textContent = cs.title;
        modalBadge.textContent = cs.badge;
        readTimeEl.textContent = cs.readTime;
        demoBtn.href = cs.demoUrl;
        sourceBtn.href = cs.sourceUrl;

        // Reset Scroll and Progress
        modalBody.scrollTop = 0;
        progressBar.style.width = '0%';

        // Construct Body HTML
        let html = `
            <!-- Screenshot Preview Header -->
            <div class="cs-hero-preview">
                <img src="${cs.heroImg}" alt="${cs.title}" class="cs-hero-img">
            </div>

            <!-- SECTION 1: Business Problem -->
            <section id="cs-sec-problem" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">01</span>
                    <h3 class="cs-sec-title">Business Problem</h3>
                </div>
                <p class="cs-text">${cs.problem.desc}</p>
                <div class="cs-grid-2">
                    <div class="cs-card">
                        <h4 class="cs-card-title">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            Why Is It Important?
                        </h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.problem.why}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Who Benefits?
                        </h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.problem.who}</p>
                    </div>
                </div>
            </section>

            <!-- SECTION 2: Business Questions -->
            <section id="cs-sec-questions" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">02</span>
                    <h3 class="cs-sec-title">Business Questions</h3>
                </div>
                <div class="cs-q-list">
                    ${cs.questions.map(q => `
                        <div class="cs-q-item">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--accent-color); flex-shrink:0; margin-top:2px;"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            <span>${q}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- SECTION 3: My Approach -->
            <section id="cs-sec-approach" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">03</span>
                    <h3 class="cs-sec-title">My Approach & Strategy</h3>
                </div>
                <div class="cs-grid-3">
                    <div class="cs-card">
                        <h4 class="cs-card-title">Thinking Process</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.approach.thinking}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Initial Hypotheses</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.approach.assumptions}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Methodology Rationale</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.approach.rationale}</p>
                    </div>
                </div>
            </section>

            <!-- SECTION 4: Dataset Overview -->
            <section id="cs-sec-dataset" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">04</span>
                    <h3 class="cs-sec-title">Dataset Overview</h3>
                </div>
                <div class="cs-dataset-metrics">
                    ${cs.dataset.metrics.map(m => `
                        <div class="cs-metric-badge">
                            <div class="cs-metric-val">${m.val}</div>
                            <div class="cs-metric-lbl">${m.lbl}</div>
                        </div>
                    `).join('')}
                </div>
                <p class="cs-text">${cs.dataset.desc}</p>
                <div class="cs-card" style="margin-top:1rem;">
                    <h4 class="cs-card-title">Critical Schema Fields</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;">
                        ${cs.dataset.fields.map(f => `<span class="tech-pill">${f}</span>`).join('')}
                    </div>
                </div>
            </section>

            <!-- SECTION 5: Data Cleaning -->
            <section id="cs-sec-cleaning" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">05</span>
                    <h3 class="cs-sec-title">Data Cleaning & Preprocessing</h3>
                </div>
                <p class="cs-text" style="margin-bottom:1rem;">Click below to expand specific data cleaning transformations and analytical decisions:</p>
                ${cs.cleaning.map(c => `
                    <div class="cs-accordion">
                        <button class="cs-accordion-header">
                            <span>${c.title}</span>
                            <svg class="cs-accordion-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="cs-accordion-content">
                            <p>${c.details}</p>
                        </div>
                    </div>
                `).join('')}
            </section>

            <!-- SECTION 6: Analysis Journey -->
            <section id="cs-sec-journey" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">06</span>
                    <h3 class="cs-sec-title">Analysis Journey Timeline</h3>
                </div>
                <div class="cs-journey-flow">
                    ${cs.journey.map(j => `
                        <div class="cs-journey-step">
                            <div class="cs-journey-step-num">${j.num}</div>
                            <div class="cs-journey-step-info">
                                <h4>${j.title}</h4>
                                <p>${j.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- SECTION 7: Why These Tools? -->
            <section id="cs-sec-tools" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">07</span>
                    <h3 class="cs-sec-title">Why These Tools?</h3>
                </div>
                <div class="cs-grid-2" style="margin-bottom:1.25rem;">
                    <div class="cs-card">
                        <h4 class="cs-card-title">SQL (Database & Querying)</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.tools.sql}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Python (Wrangling & Analytics)</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.tools.python}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Power BI (Visualization & DAX)</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.tools.powerbi}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Excel (Modeling & Validation)</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.tools.excel}</p>
                    </div>
                </div>
                <div class="cs-card">
                    <h4 class="cs-card-title">Alternative Approaches Considered</h4>
                    <p class="cs-text" style="margin-bottom:0">${cs.tools.alternatives}</p>
                </div>
            </section>

            <!-- SECTION 8: Key Insights -->
            <section id="cs-sec-insights" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">08</span>
                    <h3 class="cs-sec-title">Key Analytical Insights</h3>
                </div>
                ${cs.insights.map(ins => `
                    <div class="cs-insight-card">
                        <div class="cs-insight-header">
                            <span class="cs-insight-tag">${ins.tag}</span>
                            <h4 class="cs-insight-title">${ins.title}</h4>
                        </div>
                        <div class="cs-vector-grid">
                            <div class="cs-vector-item">
                                <div class="cs-vector-label">What Happened?</div>
                                <div class="cs-vector-desc">${ins.what}</div>
                            </div>
                            <div class="cs-vector-item">
                                <div class="cs-vector-label">Why Did It Happen?</div>
                                <div class="cs-vector-desc">${ins.why}</div>
                            </div>
                            <div class="cs-vector-item">
                                <div class="cs-vector-label">Why Does It Matter?</div>
                                <div class="cs-vector-desc">${ins.matter}</div>
                            </div>
                            <div class="cs-vector-item">
                                <div class="cs-vector-label">Business Value Created</div>
                                <div class="cs-vector-desc">${ins.value}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </section>

            <!-- SECTION 9: Recommendations -->
            <section id="cs-sec-recommendations" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">09</span>
                    <h3 class="cs-sec-title">Actionable Stakeholder Recommendations</h3>
                </div>
                ${cs.recommendations.map(r => `
                    <div class="cs-rec-card">
                        <div class="cs-rec-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>
                        </div>
                        <div class="cs-rec-content">
                            <h4>${r.title}</h4>
                            <p>${r.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </section>

            <!-- SECTION 10: Reflection -->
            <section id="cs-sec-reflection" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">10</span>
                    <h3 class="cs-sec-title">Analytical Reflection</h3>
                </div>
                <div class="cs-grid-3">
                    <div class="cs-card">
                        <h4 class="cs-card-title">Challenges Faced</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.reflection.challenges}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">Lessons Learned</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.reflection.lessons}</p>
                    </div>
                    <div class="cs-card">
                        <h4 class="cs-card-title">If Rebuilding Today</h4>
                        <p class="cs-text" style="margin-bottom:0">${cs.reflection.improvement}</p>
                    </div>
                </div>
            </section>

            <!-- SECTION 11: Interview Questions -->
            <section id="cs-sec-interview" class="cs-section">
                <div class="cs-sec-header">
                    <span class="cs-sec-number">11</span>
                    <h3 class="cs-sec-title">Realistic Recruiter & Hiring Manager Interview Q&A</h3>
                </div>
                <p class="cs-text" style="margin-bottom:1rem;">Click any interview question to expand the hiring manager's expected answer and analytical rationale:</p>
                ${cs.questions.map(qa => `
                    <div class="cs-qa-card">
                        <button class="cs-qa-question">
                            <span>Q: ${qa.q}</span>
                            <svg class="cs-accordion-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div class="cs-qa-answer">
                            <p><strong>Senior Analyst Answer:</strong> ${qa.a}</p>
                        </div>
                    </div>
                `).join('')}
            </section>
        `;

        modalBody.innerHTML = html;

        // Re-attach Accordion Event Listeners
        const accordions = modalBody.querySelectorAll('.cs-accordion');
        accordions.forEach(acc => {
            const btn = acc.querySelector('.cs-accordion-header');
            btn.addEventListener('click', () => {
                acc.classList.toggle('open');
            });
        });

        // Re-attach Interview Q&A Event Listeners
        const qaCards = modalBody.querySelectorAll('.cs-qa-card');
        qaCards.forEach(qa => {
            const btn = qa.querySelector('.cs-qa-question');
            btn.addEventListener('click', () => {
                qa.classList.toggle('open');
            });
        });
    }

    // Modal Control Functions
    function openModal(key) {
        if (!caseStudies[key]) return;
        renderCaseStudy(key);
        modalBackdrop.classList.add('active');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lenis.stop();
        history.pushState(null, null, `#case-study-${key}`);
    }

    function closeModal() {
        modalBackdrop.classList.remove('active');
        modalBackdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lenis.start();
        if (window.location.hash.startsWith('#case-study-')) {
            history.pushState(null, null, ' ');
        }
    }

    // Open Button Event Listeners
    document.querySelectorAll('.cs-open-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectKey = btn.getAttribute('data-project');
            openModal(projectKey);
        });
    });

    // Close Button Event Listener
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Backdrop Click to Close
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    // Escape Key to Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
            closeModal();
        }
    });

    // Scroll Progress Bar & Sticky TOC Active Highlight Logic
    if (modalBody) {
        modalBody.addEventListener('scroll', () => {
            const scrollTop = modalBody.scrollTop;
            const scrollHeight = modalBody.scrollHeight - modalBody.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
            }

            // Update TOC Active Pill
            const sections = modalBody.querySelectorAll('.cs-section');
            let currentSecId = '';

            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const parentRect = modalBody.getBoundingClientRect();
                if (rect.top - parentRect.top <= 180) {
                    currentSecId = sec.getAttribute('id');
                }
            });

            if (currentSecId && tocPills.length > 0) {
                tocPills.forEach(pill => {
                    if (pill.getAttribute('data-target') === currentSecId) {
                        pill.classList.add('active');
                        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        pill.classList.remove('active');
                    }
                });
            }
        });
    }

    // TOC Pill Click Handler
    tocPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const targetId = pill.getAttribute('data-target');
            const targetSec = modalBody.querySelector(`#${targetId}`);
            if (targetSec) {
                targetSec.scrollIntoView({ behavior: 'smooth' });
                tocPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });
    });

    // Deep Linking Support on Load (e.g. #case-study-ibm-hr)
    function checkHashLink() {
        const hash = window.location.hash;
        if (hash.startsWith('#case-study-')) {
            const key = hash.replace('#case-study-', '');
            if (caseStudies[key]) {
                setTimeout(() => openModal(key), 300);
            }
        }
    }
    checkHashLink();
    window.addEventListener('hashchange', checkHashLink);

    // ==========================================================================
    // SMOOTHNESS ENHANCEMENT HELPERS
    // ==========================================================================

    // Automated Stagger Reveal Delays
    const staggers = document.querySelectorAll('[data-stagger]');
    staggers.forEach(parent => {
        const reveals = parent.querySelectorAll('.reveal');
        reveals.forEach((child, index) => {
            child.style.setProperty('--delay', `${index * 0.12}s`);
        });
    });

    // Magnetic Physics CTA buttons
    const makeMagnetic = (el) => {
        if (!el) return;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const x = e.clientX - centerX;
            const y = e.clientY - centerY;
            
            const pull = 0.32;
            
            el.classList.add('magnetic-hovering');
            el.style.transform = `translate3d(${x * pull}px, ${y * pull}px, 0)`;
            
            const inner = el.querySelector('span, svg, img');
            if (inner) {
                inner.style.transform = `translate3d(${x * pull * 0.3}px, ${y * pull * 0.3}px, 0)`;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            el.classList.remove('magnetic-hovering');
            el.style.transform = 'translate3d(0, 0, 0)';
            
            const inner = el.querySelector('span, svg, img');
            if (inner) {
                inner.style.transform = 'translate3d(0, 0, 0)';
            }
        });
    };

    document.querySelectorAll('.contact-btn, .resume-btn-hero, .theme-toggle, .logo, .menu-toggle').forEach(makeMagnetic);
});

