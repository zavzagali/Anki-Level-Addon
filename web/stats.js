"use strict";(()=>{function l(a){try{window.pycmd(a)}catch(t){console.error("[Level] pycmd failed:",t)}}function s(){l("lua:summary")}function i(){l("lua:week_stats")}function n(){l("lua:month_stats")}function c(){l("lua:badges")}function d(){if(document.getElementById("lua-stats-panel"))return;let a=window.LUA_DATA||{level:1,totalXp:0,streak:0,totalCards:0},t=document.createElement("div");t.id="lua-stats-panel",t.className="lua-stats-panel",t.innerHTML=`
        <div class="lua-stats-header">Statistics</div>
        <div class="lua-stats-grid">
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:${a.color||"var(--lvl-accent)"}">${a.level}</div>
                <div class="lua-stat-label">Level</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${a.totalXp}</div>
                <div class="lua-stat-label">Total XP</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${a.streak}</div>
                <div class="lua-stat-label">Streak</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${a.totalCards}</div>
                <div class="lua-stat-label">Cards</div>
            </div>
        </div>
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Week</div>
            <div id="lua-week-chart"></div>
        </div>
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Month</div>
            <div id="lua-month-chart"></div>
        </div>
        <div class="lua-chart-container">
            <div class="lua-chart-label">Badges</div>
            <div id="lua-badges-grid" class="lua-badges-grid"></div>
        </div>
    `;let e=document.getElementById("lvlup-panel");e&&e.parentNode?e.parentNode.insertBefore(t,e.nextSibling):document.body.appendChild(t),s(),i(),n(),c()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d();})();
