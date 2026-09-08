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
    color: string;
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
    isNew: boolean;
    summary: LevelUpSummary;
}

export interface XpDetail {
    base: number;
    total: number;
    streak_mult: number;
    combo_mult: number;
    speed_bonus: number;
    daily_bonus_pct: number;
    new_card_bonus: number;
    daily100_bonus: number;
}

export interface BadgeResult {
    id: string;
    name: string;
    desc: string;
    icon: string;
    tier: number;
    tierIcon: string;
    tierName: string;
}

export interface BadgeDef {
    id: string;
    name: string;
    desc: string;
    icon: string;
    tier: number;
    tierIcon: string;
    tierName: string;
    earned: boolean;
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
    updateReviewerBar(xp: number, combo: number): void;
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
        title: "Novice", color: "rgb(48, 209, 88)",
        streak: 0, bestStreak: 0, totalCards: 0,
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
    if (fill) {
        fill.style.width = `${xpPct(d)}%`;
        fill.style.background = d.color;
    }

    const xpText = bar.querySelector(".lua-lb-xp-text");
    if (xpText) xpText.textContent = `${d.xpInLevel}/${d.xpForLevel} XP`;

    const streakEl = bar.querySelector(".lua-lb-streak");
    if (streakEl) streakEl.textContent = `\u{1F525} ${d.streak}`;

    const todayEl = bar.querySelector(".lua-lb-cards");
    if (todayEl) todayEl.textContent = `${d.todayCards} today`;
}

function showToast(text: string): void {
    const toast = document.createElement("div");
    toast.className = "lua-xp-toast";
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
}

function showBadgeToast(badge: BadgeResult): void {
    const toast = document.createElement("div");
    toast.className = "lua-badge-toast";
    toast.innerHTML = `
        <span class="lua-badge-icon">${badge.icon}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">${badge.tierName} Badge!</span>
            <span class="lua-badge-name">${badge.name} ${badge.tierIcon}</span>
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
    document.addEventListener("keydown", function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") {
            overlay.remove();
            document.removeEventListener("keydown", onKey);
        }
    });
}

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
        const tierDisplay = b.earned ? b.tierIcon : "";
        return `
            <div class="lua-badge-card ${cls}">
                <div class="lua-badge-card-icon">${b.icon}</div>
                <div class="lua-badge-card-name">${b.name}</div>
                <div class="lua-badge-card-tier">${tierDisplay}</div>
            </div>
        `;
    }).join("");
}

function injectReviewerCss(): void {
    if (document.getElementById("lvl-reviewer-css")) return;
    const style = document.createElement("style");
    style.id = "lvl-reviewer-css";
    style.textContent = `
        #lvl-reviewer-bar {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
            display: flex; align-items: center; justify-content: center; gap: 18px;
            padding: 8px 16px;
            background: var(--lvl-bg, rgba(30,30,30,0.92));
            border-top: 1px solid var(--lvl-border, rgba(84,84,88,0.35));
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
            font-size: 13px; color: var(--lvl-text, #f2f2f7);
            transition: opacity 0.3s ease;
        }
        #lvl-reviewer-bar .lvl-rb-xp {
            font-weight: 700; font-size: 15px; color: var(--lvl-accent, #0A84FF);
        }
        #lvl-reviewer-bar .lvl-rb-combo {
            font-weight: 600; font-size: 13px; color: var(--lvl-subtle, #98989d);
        }
        #lvl-reviewer-bar .lvl-rb-combo.active {
            color: #FF9F0A;
        }
    `;
    document.head.appendChild(style);
}

function updateReviewerBar(xp: number, combo: number): void {
    injectReviewerCss();
    let bar = document.getElementById("lvl-reviewer-bar");
    if (!bar) {
        bar = document.createElement("div");
        bar.id = "lvl-reviewer-bar";
        document.body.appendChild(bar);
    }
    const comboClass = combo > 1 ? "lvl-rb-combo active" : "lvl-rb-combo";
    const comboText = combo > 1 ? `\u{1F525} ${combo}x Combo` : `\u{1F525} 1x`;
    bar.innerHTML = `<span class="lvl-rb-xp">+${xp} XP</span><span class="${comboClass}">${comboText}</span>`;
    bar.style.opacity = "1";
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

        if (result.isNew) {
            toastText += " (new card)";
        } else if (detail.daily100_bonus > 0) {
            toastText += " (100 cards!)";
        } else if (detail.streak_mult > 1) {
            toastText += ` (streak x${detail.streak_mult})`;
        } else if (detail.combo_mult > 1) {
            toastText += ` (combo x${detail.combo_mult})`;
        }

        showToast(toastText);
        updateReviewerBar(result.xp, currentData.combo);

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

    updateReviewerBar(xp: number, combo: number): void {
        updateReviewerBar(xp, combo);
    },
};

window.Lua = bridge;
currentData = getData();
updateHud();
