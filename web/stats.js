"use strict";(()=>{function i(t){try{window.pycmd(t)}catch(e){console.error("[Level] pycmd failed:",e)}}function n(){i("lua:badges")}function o(t,e){let d=document.getElementById(t);if(!d)return;let s=Math.max(...e.map(a=>a.xp),1);d.innerHTML=`<div class="lua-chart-bars">${e.map(a=>{let l=Math.max(2,a.xp/s*100);return`<div class="${a.isToday?"lua-chart-bar today":"lua-chart-bar"}" style="height:${l}%" data-tooltip="${a.day}: ${a.xp} XP"></div>`}).join("")}</div>`}function r(){if(document.getElementById("lua-stats-panel"))return;let t=window.LUA_DATA||{level:1,totalXp:0,streak:0,totalCards:0},e=window.LUA_CONFIG||{showWeekChart:!0,showMonthChart:!0,showBadges:!0},d=window.LUA_MONTH_STATS||[],s="";e.showMonthChart&&(s+=`
        <div class="lua-chart-container">
            <div id="lua-month-chart"></div>
        </div>`),e.showBadges&&(s+=`
        <div class="lua-chart-container">
            <div id="lua-badges-grid" class="lua-badges-grid"></div>
        </div>`);let a=document.createElement("div");a.id="lua-stats-panel",a.className="lua-stats-panel",a.innerHTML=`
        <div class="lua-stats-grid">
            <div class="lua-stat-card">
                <div class="lua-stat-value" style="color:${t.color||"var(--lvl-accent)"}">${t.level}</div>
                <div class="lua-stat-label">Level</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${t.totalXp}</div>
                <div class="lua-stat-label">Total XP</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${t.streak}</div>
                <div class="lua-stat-label">Streak</div>
            </div>
            <div class="lua-stat-card">
                <div class="lua-stat-value">${t.totalCards}</div>
                <div class="lua-stat-label">Cards</div>
            </div>
        </div>
        ${s}
    `;let l=document.getElementById("lvlup-panel");l&&l.parentNode?l.parentNode.insertBefore(a,l.nextSibling):document.body.appendChild(a),e.showMonthChart&&o("lua-month-chart",d),e.showBadges&&n()}document.addEventListener("DOMContentLoaded",r);})();
