/* Magic School X — shared interactions */
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    /* ---------- Nav: scrolled state, active link, mobile menu ---------- */
    const nav = document.querySelector('.nav');
    const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.getAttribute('href') === page) a.classList.add('active');
    });

    const toggle = document.querySelector('.nav-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            document.body.style.overflow = '';
        }));
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

    /* ---------- Reveal on scroll ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target;
                    el.classList.add('in');
                    io.unobserve(el);
                    // hand control back to the element's own hover transitions once revealed
                    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
                    setTimeout(() => el.classList.remove('reveal', 'in'), 1100 + delay * 1000);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }

    /* ---------- Count-up numbers ---------- */
    const counters = document.querySelectorAll('[data-count]');
    const runCount = el => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target + suffix; return; }
        const start = performance.now();
        const dur = 1800;
        const step = now => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    if (counters.length && 'IntersectionObserver' in window) {
        const co = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
        }, { threshold: 0.6 });
        counters.forEach(c => co.observe(c));
    }

    /* ---------- Card spotlight ---------- */
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    /* ---------- Magnetic buttons ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('pointermove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.18;
                const y = (e.clientY - r.top - r.height / 2) * 0.3;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('pointerleave', () => btn.style.transform = '');
        });
    }

    /* ---------- Cursor glow + sparkle trail ---------- */
    if (finePointer && !reduceMotion) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        let last = 0;
        window.addEventListener('pointermove', e => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            const now = performance.now();
            if (now - last > 45) {
                last = now;
                const s = document.createElement('span');
                s.className = 'sparkle';
                s.style.left = e.clientX - 3 + 'px';
                s.style.top = e.clientY - 3 + 'px';
                s.style.setProperty('--dx', (Math.random() - 0.5) * 30 + 'px');
                s.style.setProperty('--dy', 10 + Math.random() * 25 + 'px');
                document.body.appendChild(s);
                setTimeout(() => s.remove(), 900);
            }
        }, { passive: true });
    }

    /* ---------- Hero parallax ---------- */
    const heroBg = document.querySelector('.hero-bg');
    const heroInner = document.querySelector('.hero-inner');
    if (heroBg && !reduceMotion) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y > window.innerHeight) return;
            heroBg.style.translate = `0 ${y * 0.35}px`;
            if (heroInner) {
                heroInner.style.translate = `0 ${y * 0.15}px`;
                heroInner.style.opacity = Math.max(1 - y / (window.innerHeight * 0.7), 0);
            }
        }, { passive: true });
    }

    /* ---------- Particle field: twinkling stars + rising embers ---------- */
    const canvas = document.getElementById('particles');
    if (canvas && !reduceMotion) {
        const ctx = canvas.getContext('2d');
        let w, h, dpr, stars, embers;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = innerWidth * dpr;
            h = canvas.height = innerHeight * dpr;
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
            const area = innerWidth * innerHeight;
            stars = Array.from({ length: Math.min(Math.round(area / 9000), 180) }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: (Math.random() * 1.1 + 0.2) * dpr,
                p: Math.random() * Math.PI * 2,
                s: 0.6 + Math.random() * 1.6
            }));
            embers = Array.from({ length: Math.min(Math.round(area / 32000), 50) }, () => newEmber(true));
        };

        const newEmber = initial => ({
            x: Math.random() * w,
            y: initial ? Math.random() * h : h + 10,
            r: (Math.random() * 1.8 + 0.6) * dpr,
            vy: (Math.random() * 0.35 + 0.15) * dpr,
            vx: (Math.random() - 0.5) * 0.15 * dpr,
            a: Math.random() * 0.6 + 0.3,
            w: Math.random() * Math.PI * 2
        });

        let running = true;
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) requestAnimationFrame(draw);
        });

        const draw = t => {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            const time = t / 1000;

            for (const s of stars) {
                const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * s.s + s.p));
                ctx.fillStyle = `rgba(255,255,255,${a})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = 0; i < embers.length; i++) {
                const e = embers[i];
                e.y -= e.vy;
                e.x += e.vx + Math.sin(time + e.w) * 0.2 * dpr;
                if (e.y < -10) embers[i] = newEmber(false);
                const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
                g.addColorStop(0, `rgba(246,220,148,${e.a})`);
                g.addColorStop(1, 'rgba(232,196,104,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(draw);
    }
})();
