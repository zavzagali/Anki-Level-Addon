export {};

declare global {
    interface Window {
        Lua?: import("../levelup/index").LuaBridge;
        LUA_DATA?: import("../levelup/index").LevelUpSummary;
        LUA_CONFIG?: { showWeekChart: boolean; showMonthChart: boolean; showBadges: boolean };
        LUA_WEEK_STATS?: Array<{day:string;xp:number;cards:number;correct:number}>;
        LUA_MONTH_STATS?: Array<{day:string;xp:number;cards:number}>;
    }
}

function pycmd(cmd: string): void {
    try {
        (window as any).pycmd(cmd);
    } catch (e) {
        console.error("[Level] pycmd failed:", e);
    }
}

function requestBadges(): void { pycmd("lua:badges"); }

function renderChart(containerId: string, stats: Array<{day:string;xp:number;cards:number}>): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    const max = Math.max(...stats.map(s => s.xp), 1);
    container.innerHTML = `<div class="lua-chart-bars">${
        stats.map(s => {
            const h = Math.max(2, (s.xp / max) * 100);
            return `<div class="lua-chart-bar" style="height:${h}%" data-tooltip="${s.day}: ${s.xp} XP"></div>`;
        }).join("")
    }</div>`;
}

function init(): void {
    if (document.getElementById("lua-stats-panel")) return;
    const data = (window as any).LUA_DATA || {
        level: 1, totalXp: 0, streak: 0, totalCards: 0
    };
    const cfg = (window as any).LUA_CONFIG || { showWeekChart: true, showMonthChart: true, showBadges: true };
    const weekStats = (window as any).LUA_WEEK_STATS || [];
    const monthStats = (window as any).LUA_MONTH_STATS || [];

    let chartsHtml = "";
    if (cfg.showWeekChart) {
        chartsHtml += `
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Week</div>
            <div id="lua-week-chart"></div>
        </div>`;
    }
    if (cfg.showMonthChart) {
        chartsHtml += `
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Month</div>
            <div id="lua-month-chart"></div>
        </div>`;
    }
    if (cfg.showBadges) {
        chartsHtml += `
        <div class="lua-chart-container">
            <div class="lua-chart-label">Badges</div>
            <div id="lua-badges-grid" class="lua-badges-grid"></div>
        </div>`;
    }

    const panel = document.createElement("div");
    panel.id = "lua-stats-panel";
    panel.className = "lua-stats-panel";
    panel.innerHTML = `
        <div class="lua-stats-header">Statistics</div>
        <div class="lua-stats-grid">
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:${data.color || 'var(--lvl-accent)'}">${data.level}</div>
                <div class="lua-stat-label">Level</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${data.totalXp}</div>
                <div class="lua-stat-label">Total XP</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${data.streak}</div>
                <div class="lua-stat-label">Streak</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${data.totalCards}</div>
                <div class="lua-stat-label">Cards</div>
            </div>
        </div>
        ${chartsHtml}
    `;

    const lvlupPanel = document.getElementById("lvlup-panel");
    if (lvlupPanel && lvlupPanel.parentNode) {
        lvlupPanel.parentNode.insertBefore(panel, lvlupPanel.nextSibling);
    } else {
        document.body.appendChild(panel);
    }

    if (cfg.showWeekChart) renderChart("lua-week-chart", weekStats);
    if (cfg.showMonthChart) renderChart("lua-month-chart", monthStats);
    if (cfg.showBadges) requestBadges();
}

document.addEventListener("DOMContentLoaded", init);
