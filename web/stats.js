"use strict";(()=>{function r(e){try{window.pycmd(e)}catch(a){console.error("[Level] pycmd failed:",a)}}function o(){r("lua:badges")}function n(e,a){let l=document.getElementById(e);if(!l)return;let i=Math.max(...a.map(t=>t.xp),1);l.innerHTML=`<div class="lua-chart-bars">${a.map(t=>`<div class="lua-chart-bar" style="height:${Math.max(2,t.xp/i*100)}%" data-tooltip="${t.day}: ${t.xp} XP"></div>`).join("")}</div>`}function c(){if(document.getElementById("lua-stats-panel"))return;let e=window.LUA_DATA||{level:1,totalXp:0,streak:0,totalCards:0},a=window.LUA_CONFIG||{showWeekChart:!0,showMonthChart:!0,showBadges:!0},l=window.LUA_WEEK_STATS||[],i=window.LUA_MONTH_STATS||[],t="";a.showWeekChart&&(t+=`
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Week</div>
            <div id="lua-week-chart"></div>
        </div>`),a.showMonthChart&&(t+=`
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Month</div>
            <div id="lua-month-chart"></div>
        </div>`),a.showBadges&&(t+=`
        <div class="lua-chart-container">
            <div class="lua-chart-label">Badges</div>
            <div id="lua-badges-grid" class="lua-badges-grid"></div>
        </div>`);let s=document.createElement("div");s.id="lua-stats-panel",s.className="lua-stats-panel",s.innerHTML=`
        <div class="lua-stats-header">Statistics</div>
        <div class="lua-stats-grid">
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:${e.color||"var(--lvl-accent)"}">${e.level}</div>
                <div class="lua-stat-label">Level</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${e.totalXp}</div>
                <div class="lua-stat-label">Total XP</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${e.streak}</div>
                <div class="lua-stat-label">Streak</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${e.totalCards}</div>
                <div class="lua-stat-label">Cards</div>
            </div>
        </div>
        ${t}
    `;let d=document.getElementById("lvlup-panel");d&&d.parentNode?d.parentNode.insertBefore(s,d.nextSibling):document.body.appendChild(s),a.showWeekChart&&n("lua-week-chart",l),a.showMonthChart&&n("lua-month-chart",i),a.showBadges&&o()}document.addEventListener("DOMContentLoaded",c);})();
