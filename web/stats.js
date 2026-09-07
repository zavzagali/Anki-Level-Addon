"use strict";(()=>{function l(t){try{window.pycmd(t)}catch(a){console.error("[Level] pycmd failed:",a)}}function s(){l("lua:summary")}function i(){l("lua:week_stats")}function n(){l("lua:month_stats")}function r(){l("lua:badges")}function d(){if(document.getElementById("lua-stats-panel"))return;let t=window.LUA_DATA||{level:1,totalXp:0,streak:0,totalCards:0},a=document.createElement("div");a.id="lua-stats-panel",a.className="lua-stats-panel",a.innerHTML=`
        <div class="lua-stats-header">\u{1F4CA} Statistics</div>
        <div class="lua-stats-grid">
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:var(--lua-accent)">${t.level}</div>
                <div class="lua-stat-label">Level</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:var(--lua-purple)">${t.totalXp}</div>
                <div class="lua-stat-label">Total XP</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:var(--lua-orange)">\u{1F525} ${t.streak}</div>
                <div class="lua-stat-label">Streak</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:var(--lua-green)">${t.totalCards}</div>
                <div class="lua-stat-label">Total Cards</div>
            </div>
        </div>
        <div class="lua-chart-container">
            <div class="lua-chart-label">This Week</div>
            <div id="lua-week-chart"></div>
        </div>
        <div class="lua-chart-container" style="margin-top:12px">
            <div class="lua-chart-label">This Month</div>
            <div id="lua-month-chart"></div>
        </div>
        <div class="lua-chart-container" style="margin-top:16px">
            <div class="lua-chart-label">Badges</div>
            <div id="lua-badges-grid" class="lua-badges-grid"></div>
        </div>
    `;let e=document.getElementById("lvlup-panel");e&&e.parentNode?e.parentNode.insertBefore(a,e.nextSibling):document.body.appendChild(a),s(),i(),n(),r()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d();})();
