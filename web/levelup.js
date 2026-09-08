"use strict";(()=>{function v(){return window.LUA_DATA||{level:1,totalXp:0,xpInLevel:0,xpForLevel:50,title:"Novice",color:"rgb(48, 209, 88)",streak:0,bestStreak:0,totalCards:0,todayXp:0,todayCards:0,todayCorrect:0,combo:0,badges:{}}}var l=v();function p(e){return e.xpForLevel<=0?100:Math.min(100,e.xpInLevel/e.xpForLevel*100)}function d(){let e=document.getElementById("lua-level-bar");if(!e)return;let t=l,a=e.querySelector(".lua-lb-level");a&&(a.textContent=`Lvl ${t.level}`);let n=e.querySelector(".lua-lb-title");n&&(n.textContent=t.title);let r=e.querySelector(".lua-lb-xp-fill");r&&(r.style.width=`${p(t)}%`,r.style.background=t.color);let o=e.querySelector(".lua-lb-xp-text");o&&(o.textContent=`${t.xpInLevel}/${t.xpForLevel} XP`);let i=e.querySelector(".lua-lb-streak");i&&(i.textContent=`\u{1F525} ${t.streak}`);let s=e.querySelector(".lua-lb-cards");s&&(s.textContent=`${t.todayCards} today`)}function b(e){let t=document.createElement("div");t.className="lua-xp-toast",t.textContent=e,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}function g(e){let t=document.createElement("div");t.className="lua-badge-toast",t.innerHTML=`
        <span class="lua-badge-icon">${e.icon}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">${e.tierName} Badge!</span>
            <span class="lua-badge-name">${e.name} ${e.tierIcon}</span>
        </span>
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}function c(e,t){let a=document.createElement("div");a.className="lua-levelup-overlay",a.innerHTML=`
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">\u{1F389}</div>
            <div class="lua-levelup-label">Level Up!</div>
            <div class="lua-levelup-number">${e}</div>
            <div class="lua-levelup-title">${t}</div>
            <button class="lua-levelup-dismiss">Continue</button>
        </div>
    `,document.body.appendChild(a),a.addEventListener("click",n=>{(n.target===a||n.target.classList.contains("lua-levelup-dismiss"))&&a.remove()}),document.addEventListener("keydown",function n(r){r.key==="Escape"&&(a.remove(),document.removeEventListener("keydown",n))})}function u(e,t){let a=document.getElementById(e);if(!a)return;let n=Math.max(...t.map(o=>o.xp),1),r=t.map(o=>{let i=Math.max(2,o.xp/n*100),s=`${o.day}: ${o.xp} XP, ${o.cards} cards`;return`<div class="lua-chart-bar" style="height:${i}%" data-tooltip="${s}"></div>`}).join("");a.innerHTML=`<div class="lua-chart-bars">${r}</div>`}function y(e){let t=document.getElementById("lua-badges-grid");t&&(t.innerHTML=e.map(a=>{let n=a.earned?"earned":"locked",r=a.earned?a.tierIcon:"";return`
            <div class="lua-badge-card ${n}">
                <div class="lua-badge-card-icon">${a.icon}</div>
                <div class="lua-badge-card-name">${a.name}</div>
                <div class="lua-badge-card-tier">${r}</div>
            </div>
        `}).join(""))}function x(){if(document.getElementById("lvl-reviewer-css"))return;let e=document.createElement("style");e.id="lvl-reviewer-css",e.textContent=`
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
    `,document.head.appendChild(e)}function m(e,t){x();let a=document.getElementById("lvl-reviewer-bar");a||(a=document.createElement("div"),a.id="lvl-reviewer-bar",document.body.appendChild(a));let n=t>1?"lvl-rb-combo active":"lvl-rb-combo",r=t>1?`\u{1F525} ${t}x Combo`:"\u{1F525} 1x";a.innerHTML=`<span class="lvl-rb-xp">+${e} XP</span><span class="${n}">${r}</span>`,a.style.opacity="1"}var f={onSummary(e){l=e,d()},onXpAwarded(e){l=e.summary,d();let t=e.xpDetail,a=`+${e.xp} XP`;e.isNew?a+=" (new card)":t.daily100_bonus>0?a+=" (100 cards!)":t.streak_mult>1?a+=` (streak x${t.streak_mult})`:t.combo_mult>1&&(a+=` (combo x${t.combo_mult})`),b(a),m(e.xp,l.combo),e.badges&&e.badges.forEach((n,r)=>{setTimeout(()=>g(n),800+r*600)}),e.levelUp&&setTimeout(()=>c(e.level,e.newTitle),600)},onLevelUp(e,t){c(e,t)},onWeekStats(e){u("lua-week-chart",e)},onMonthStats(e){u("lua-month-chart",e)},onBadges(e){y(e)},updateReviewerBar(e,t){m(e,t)}};window.Lua=f;l=v();d();})();
