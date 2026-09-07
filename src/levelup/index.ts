export {};

declare global {
    interface Window {
        Lua?: LuaBridge;
        LUA_DATA?: LevelUpSummary;
    }
}

export interface LevelUpSummary {
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpForLevel: number;
    title: string;
    streak: number;
    bestStreak: number;
    totalCards: number;
    todayXp: number;
    todayCards: number;
    todayCorrect: number;
    combo: number;
    badges: Record<string, number>;
}

export interface XpAwardResult {
    xp: number;
    level: number;
    levelUp: boolean;
    newTitle: string;
    oldTitle: string | null;
    streak: number;
    totalXp: number;
    xpInLevel: number;
    xpForLevel: number;
    badges: BadgeResult[];
    xpDetail: XpDetail;
    summary: LevelUpSummary;
}

export interface XpDetail {
    base: number;
    total: number;
    streak_mult: number;
    combo_mult: number;
    speed_bonus: number;
    daily_bonus_pct: number;
}

export interface BadgeResult {
    id: string;
    name: string;
    desc: string;
    icon: string;
}

export interface BadgeDef {
    id: string;
    name: string;
    desc: string;
    icon: string;
    earned: boolean;
    earnedDay?: number;
}

export interface DayStat {
    day: string;
    xp: number;
    cards: number;
    correct?: number;
}

export interface LuaBridge {
    onXpAwarded(result: XpAwardResult): void;
    onSummary(summary: LevelUpSummary): void;
    onLevelUp(level: number, title: string): void;
    onWeekStats(stats: DayStat[]): void;
    onMonthStats(stats: DayStat[]): void;
    onBadges(badges: BadgeDef[]): void;
}

function pycmd(cmd: string): void {
    try {
        (window as any).pycmd(cmd);
    } catch (e) {
        console.error("[Level] pycmd failed:", e);
    }
}

function getData(): LevelUpSummary {
    return window.LUA_DATA || {
        level: 1, totalXp: 0, xpInLevel: 0, xpForLevel: 50,
        title: "Novice", streak: 0, bestStreak: 0, totalCards: 0,
        todayXp: 0, todayCards: 0, todayCorrect: 0, combo: 0, badges: {}
    };
}

let currentData = getData();

function xpPct(d: LevelUpSummary): number {
    if (d.xpForLevel <= 0) return 100;
    return Math.min(100, (d.xpInLevel / d.xpForLevel) * 100);
}

function updateHud(): void {
    const bar = document.getElementById("lua-level-bar");
    if (!bar) return;
    const d = currentData;

    const levelEl = bar.querySelector(".lua-lb-level");
    if (levelEl) levelEl.textContent = `Lvl ${d.level}`;

    const titleEl = bar.querySelector(".lua-lb-title");
    if (titleEl) titleEl.textContent = d.title;

    const fill = bar.querySelector(".lua-lb-xp-fill") as HTMLElement;
    if (fill) fill.style.width = `${xpPct(d)}%`;

    const xpText = bar.querySelector(".lua-lb-xp-text");
    if (xpText) xpText.textContent = `${d.xpInLevel}/${d.xpForLevel} XP`;

    const streakEl = bar.querySelector(".lua-lb-streak");
    if (streakEl) streakEl.textContent = `\u{1F525} ${d.streak}`;

    const todayEl = bar.querySelector(".lua-lb-cards");
    if (todayEl) todayEl.textContent = `${d.todayCards} today`;
}

function showToast(text: string, cls?: string): void {
    const toast = document.createElement("div");
    toast.className = "lua-xp-toast" + (cls ? " " + cls : "");
    toast.textContent = text;
    toast.style.left = "50%";
    toast.style.top = "50%";
    toast.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
}

function showBadgeToast(badge: BadgeResult): void {
    const toast = document.createElement("div");
    toast.className = "lua-badge-toast";
    toast.innerHTML = `
        <span class="lua-badge-icon">${badge.icon}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">Badge earned!</span>
            <span class="lua-badge-name">${badge.name}</span>
        </span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function showLevelUpModal(level: number, title: string): void {
    const overlay = document.createElement("div");
    overlay.className = "lua-levelup-overlay";
    overlay.innerHTML = `
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">\u{1F389}</div>
            <div class="lua-levelup-label">Level Up!</div>
            <div class="lua-levelup-number">${level}</div>
            <div class="lua-levelup-title">${title}</div>
            <button class="lua-levelup-dismiss">Continue</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay || (e.target as HTMLElement).classList.contains("lua-levelup-dismiss")) {
            overlay.remove();
        }
    });

    try { (window as any).LUA_CONFETTI(); } catch {}
}

function confetti(): void {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;z-index:4000;pointer-events:none;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#FFD60A"];
    const pieces: Array<{
        x: number; y: number; vx: number; vy: number;
        w: number; h: number; color: string; rot: number; vr: number;
    }> = [];

    for (let i = 0; i < 80; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 200,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4 + 2,
            w: Math.random() * 10 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.3,
        });
    }

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of pieces) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
        frame++;
        if (frame < 120) {
            requestAnimationFrame(draw);
        } else {
            canvas.remove();
        }
    }
    draw();
}

(window as any).LUA_CONFETTI = confetti;

function renderChart(containerId: string, stats: DayStat[]): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...stats.map(s => s.xp), 1);
    const barsHtml = stats.map(s => {
        const h = Math.max(2, (s.xp / max) * 100);
        const tip = `${s.day}: ${s.xp} XP, ${s.cards} cards`;
        return `<div class="lua-chart-bar" style="height:${h}%" data-tooltip="${tip}"></div>`;
    }).join("");

    container.innerHTML = `<div class="lua-chart-bars">${barsHtml}</div>`;
}

function renderBadges(badges: BadgeDef[]): void {
    const grid = document.getElementById("lua-badges-grid");
    if (!grid) return;

    grid.innerHTML = badges.map(b => {
        const cls = b.earned ? "earned" : "locked";
        return `
            <div class="lua-badge-card ${cls}">
                <div class="lua-badge-card-icon">${b.icon}</div>
                <div class="lua-badge-card-name">${b.name}</div>
                <div class="lua-badge-card-desc">${b.desc}</div>
            </div>
        `;
    }).join("");
}

const bridge: LuaBridge = {
    onSummary(summary: LevelUpSummary): void {
        currentData = summary;
        updateHud();
    },

    onXpAwarded(result: XpAwardResult): void {
        currentData = result.summary;
        updateHud();

        const detail = result.xpDetail;
        let toastText = `+${result.xp} XP`;
        let toastCls = "";

        if (detail.streak_mult > 1) {
            toastCls = "streak-bonus";
        } else if (detail.combo_mult > 1) {
            toastCls = "combo";
        } else if (detail.speed_bonus > 0 || detail.daily_bonus_pct > 0) {
            toastCls = "bonus";
        }

        showToast(toastText, toastCls);

        if (detail.streak_mult > 1) {
            setTimeout(() => showToast(`\u{1F525} Streak Bonus: x${detail.streak_mult}`, "streak-bonus"), 400);
        }
        if (detail.combo_mult > 1) {
            setTimeout(() => showToast(`\u26A1 Combo: x${detail.combo_mult}`, "combo"), 400);
        }

        if (result.badges) {
            result.badges.forEach((b: BadgeResult, i: number) => {
                setTimeout(() => showBadgeToast(b), 800 + i * 600);
            });
        }

        if (result.levelUp) {
            setTimeout(() => showLevelUpModal(result.level, result.newTitle), 600);
        }
    },

    onLevelUp(level: number, title: string): void {
        showLevelUpModal(level, title);
    },

    onWeekStats(stats: DayStat[]): void {
        renderChart("lua-week-chart", stats);
    },

    onMonthStats(stats: DayStat[]): void {
        renderChart("lua-month-chart", stats);
    },

    onBadges(badges: BadgeDef[]): void {
        renderBadges(badges);
    },
};

window.Lua = bridge;
currentData = getData();
updateHud();
