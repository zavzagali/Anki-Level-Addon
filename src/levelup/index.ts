export {};

declare global {
    interface Window {
        Lua?: LuaBridge;
        LUA_DATA?: LevelUpSummary;
        LUA_ASSET_ROOT?: string;
    }
}

export interface LevelUpSummary {
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpForLevel: number;
    title: string;
    color: string;
    levelIcon?: string;
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
    asset?: string;
    tier: number;
    tierIcon: string;
    tierAsset?: string;
    tierName: string;
}

export interface BadgeDef {
    id: string;
    name: string;
    desc: string;
    icon: string;
    asset?: string;
    tier: number;
    tierIcon: string;
    tierAsset?: string;
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
        levelIcon: "levels/novice.svg",
        streak: 0, bestStreak: 0, totalCards: 0,
        todayXp: 0, todayCards: 0, todayCorrect: 0, combo: 0, badges: {}
    };
}

function assetRoot(): string {
    return window.LUA_ASSET_ROOT || "";
}

function assetUrl(path?: string): string {
    if (!path) return "";
    if (path.startsWith("/") || path.startsWith("http")) return path;
    const root = assetRoot();
    return root ? `${root}/${path}` : path;
}

function escapeAttr(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Custom SVG artwork with emoji fallback (icon = legacy emoji). */
function iconHtml(asset: string | undefined, fallbackEmoji: string, cls: string, size: number, alt: string): string {
    const url = asset ? assetUrl(asset) : "";
    if (!url) return `<span class="${cls}-fallback">${fallbackEmoji}</span>`;
    return `<img class="${cls}" src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" width="${size}" height="${size}" loading="lazy" />`;
}

let currentData = getData();

function xpPct(d: LevelUpSummary): number {
    if (d.xpForLevel <= 0) return 100;
    return Math.min(100, (d.xpInLevel / d.xpForLevel) * 100);
}

function updateHud(): void {
    const d = currentData;

    const bar = document.getElementById("lua-level-bar");
    if (bar) {
        const levelEl = bar.querySelector(".lua-lb-level");
        if (levelEl) levelEl.textContent = `Lvl ${d.level}`;

        const titleEl = bar.querySelector(".lua-lb-title");
        if (titleEl) titleEl.textContent = d.title;

        const iconEl = bar.querySelector(".lua-lb-level-icon") as HTMLImageElement | null;
        if (iconEl && d.levelIcon) iconEl.src = assetUrl(d.levelIcon);

        const fill = bar.querySelector(".lua-lb-xp-fill") as HTMLElement;
        if (fill) {
            fill.style.width = `${xpPct(d)}%`;
            fill.style.background = d.color;
        }

        const xpText = bar.querySelector(".lua-lb-xp-text");
        if (xpText) xpText.textContent = `${d.xpInLevel}/${d.xpForLevel} XP`;

        const streakEl = bar.querySelector(".lua-lb-streak");
        if (streakEl) streakEl.innerHTML = `${iconHtml("ui/flame.svg", "", "lua-lb-streak-img", 13, "streak")} ${d.streak}`;

        const todayEl = bar.querySelector(".lua-lb-cards");
        if (todayEl) todayEl.textContent = `${d.todayCards} today`;
    }

    // Server-rendered panel from __init__.py (_panel_html) — keep icon fresh.
    const panelIcon = document.querySelector("#lvlup-panel .lvlup-level-icon") as HTMLImageElement | null;
    if (panelIcon && d.levelIcon) {
        const url = assetUrl(d.levelIcon);
        if (url && panelIcon.getAttribute("src") !== url) panelIcon.src = url;
    }
}

function showToast(text: string): void {
    const toast = document.createElement("div");
    toast.className = "lua-xp-toast";
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function showBadgeToast(badge: BadgeResult): void {
    const toast = document.createElement("div");
    toast.className = "lua-badge-toast";
    toast.innerHTML = `
        <span class="lua-badge-icon">${iconHtml(badge.asset, badge.icon, "lua-badge-img", 26, badge.name)}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">${badge.tierName} Badge!</span>
            <span class="lua-badge-name">${badge.name} ${iconHtml(badge.tierAsset, badge.tierIcon, "lua-tier-img", 14, badge.tierName)}</span>
        </span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function showLevelUpModal(level: number, title: string, levelIcon?: string): void {
    const overlay = document.createElement("div");
    overlay.className = "lua-levelup-overlay";
    const icon = iconHtml(levelIcon || currentData.levelIcon, "", "lua-levelup-img", 64, title);
    overlay.innerHTML = `
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">${icon}</div>
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
        const tierDisplay = b.earned ? iconHtml(b.tierAsset, b.tierIcon, "lua-tier-img", 14, b.tierName) : "";
        return `
            <div class="lua-badge-card ${cls} tier-${b.tier}">
                <div class="lua-badge-card-icon">${iconHtml(b.asset, b.icon, "lua-badge-card-img", 30, b.name)}</div>
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
            position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
            z-index: 999; display: flex; align-items: center; justify-content: center;
            gap: 10px; padding: 5px 14px;
            background: var(--lvl-bg, rgba(30,30,30,0.92));
            border: 1px solid var(--lvl-border, rgba(84,84,88,0.35));
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
            font-size: 12px; color: var(--lvl-text, #f2f2f7);
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        #lvl-reviewer-bar .lvl-rb-xp {
            font-weight: 700; font-size: 13px; color: var(--lvl-accent, #0A84FF);
        }
        #lvl-reviewer-bar .lvl-rb-xp.negative {
            color: #FF453A;
        }
        #lvl-reviewer-bar .lvl-rb-combo {
            font-weight: 600; font-size: 11px; color: var(--lvl-subtle, #98989d);
        }
        #lvl-reviewer-bar .lvl-rb-combo.active {
            color: #FF9F0A;
        }
        #lvl-reviewer-bar .lvl-rb-combo.broken {
            color: #FF453A; font-style: italic;
        }
        #lvl-reviewer-bar img.lvl-rb-icon {
            width: 12px; height: 12px; vertical-align: -2px;
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
    const xpCls = xp < 0 ? "lvl-rb-xp negative" : "lvl-rb-xp";
    const xpTxt = xp < 0 ? `${xp} XP` : `+${xp} XP`;
    const flameImg = iconHtml("ui/flame.svg", "", "lvl-rb-icon", 12, "combo");
    const brokenImg = iconHtml("ui/broken.svg", "", "lvl-rb-icon", 12, "broken");
    let comboCls = "lvl-rb-combo";
    let comboTxt = `${flameImg} 1x`;
    if (combo > 1) {
        comboCls = "lvl-rb-combo active";
        comboTxt = `${flameImg} ${combo}x Combo`;
    } else if (combo === 0) {
        comboCls = "lvl-rb-combo broken";
        comboTxt = `${brokenImg} Combo broken`;
    }
    bar.innerHTML = `<span class="${xpCls}">${xpTxt}</span><span class="${comboCls}">${comboTxt}</span>`;
    (bar as HTMLElement).style.opacity = "1";
}

const bridge: LuaBridge = {
    onSummary(summary: LevelUpSummary): void {
        currentData = summary;
        updateHud();
    },

    onXpAwarded(result: XpAwardResult): void {
        currentData = result.summary;
        updateHud();

        updateReviewerBar(result.xp, currentData.combo);

        if (result.badges) {
            result.badges.forEach((b: BadgeResult, i: number) => {
                setTimeout(() => showBadgeToast(b), 800 + i * 600);
            });
        }

        if (result.levelUp) {
            setTimeout(() => showLevelUpModal(result.level, result.newTitle, result.summary.levelIcon), 600);
        }
    },

    onLevelUp(level: number, title: string): void {
        showLevelUpModal(level, title, currentData.levelIcon);
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
