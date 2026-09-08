"use strict";(()=>{function m(){return window.LUA_DATA||{level:1,totalXp:0,xpInLevel:0,xpForLevel:50,title:"Novice",streak:0,bestStreak:0,totalCards:0,todayXp:0,todayCards:0,todayCorrect:0,combo:0,badges:{}}}var s=m();function v(e){return e.xpForLevel<=0?100:Math.min(100,e.xpInLevel/e.xpForLevel*100)}function i(){let e=document.getElementById("lua-level-bar");if(!e)return;let t=s,a=e.querySelector(".lua-lb-level");a&&(a.textContent=`Lvl ${t.level}`);let n=e.querySelector(".lua-lb-title");n&&(n.textContent=t.title);let l=e.querySelector(".lua-lb-xp-fill");l&&(l.style.width=`${v(t)}%`);let r=e.querySelector(".lua-lb-xp-text");r&&(r.textContent=`${t.xpInLevel}/${t.xpForLevel} XP`);let o=e.querySelector(".lua-lb-streak");o&&(o.textContent=`\u{1F525} ${t.streak}`);let d=e.querySelector(".lua-lb-cards");d&&(d.textContent=`${t.todayCards} today`)}function p(e){let t=document.createElement("div");t.className="lua-xp-toast",t.textContent=e,document.body.appendChild(t),setTimeout(()=>t.remove(),1800)}function b(e){let t=document.createElement("div");t.className="lua-badge-toast",t.innerHTML=`
        <span class="lua-badge-icon">${e.icon}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">Badge earned!</span>
            <span class="lua-badge-name">${e.name}</span>
        </span>
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}function u(e,t){let a=document.createElement("div");a.className="lua-levelup-overlay",a.innerHTML=`
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">\u{1F389}</div>
            <div class="lua-levelup-label">Level Up!</div>
            <div class="lua-levelup-number">${e}</div>
            <div class="lua-levelup-title">${t}</div>
            <button class="lua-levelup-dismiss">Continue</button>
        </div>
    `,document.body.appendChild(a),a.addEventListener("click",n=>{(n.target===a||n.target.classList.contains("lua-levelup-dismiss"))&&a.remove()}),document.addEventListener("keydown",function n(l){l.key==="Escape"&&(a.remove(),document.removeEventListener("keydown",n))})}function c(e,t){let a=document.getElementById(e);if(!a)return;let n=Math.max(...t.map(r=>r.xp),1),l=t.map(r=>{let o=Math.max(2,r.xp/n*100),d=`${r.day}: ${r.xp} XP, ${r.cards} cards`;return`<div class="lua-chart-bar" style="height:${o}%" data-tooltip="${d}"></div>`}).join("");a.innerHTML=`<div class="lua-chart-bars">${l}</div>`}function g(e){let t=document.getElementById("lua-badges-grid");t&&(t.innerHTML=e.map(a=>`
            <div class="lua-badge-card ${a.earned?"earned":"locked"}">
                <div class="lua-badge-card-icon">${a.icon}</div>
                <div class="lua-badge-card-name">${a.name}</div>
                <div class="lua-badge-card-desc">${a.desc}</div>
            </div>
        `).join(""))}var y={onSummary(e){s=e,i()},onXpAwarded(e){s=e.summary,i();let t=e.xpDetail,a=`+${e.xp} XP`;t.streak_mult>1?a+=` (streak x${t.streak_mult})`:t.combo_mult>1&&(a+=` (combo x${t.combo_mult})`),p(a),e.badges&&e.badges.forEach((n,l)=>{setTimeout(()=>b(n),800+l*600)}),e.levelUp&&setTimeout(()=>u(e.level,e.newTitle),600)},onLevelUp(e,t){u(e,t)},onWeekStats(e){c("lua-week-chart",e)},onMonthStats(e){c("lua-month-chart",e)},onBadges(e){g(e)}};window.Lua=y;s=m();i();})();
