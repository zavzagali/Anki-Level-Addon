"use strict";(()=>{function m(){return window.LUA_DATA||{level:1,totalXp:0,xpInLevel:0,xpForLevel:50,title:"Novice",color:"rgb(48, 209, 88)",streak:0,bestStreak:0,totalCards:0,todayXp:0,todayCards:0,todayCorrect:0,combo:0,badges:{}}}var o=m();function v(e){return e.xpForLevel<=0?100:Math.min(100,e.xpInLevel/e.xpForLevel*100)}function d(){let e=document.getElementById("lua-level-bar");if(!e)return;let t=o,n=e.querySelector(".lua-lb-level");n&&(n.textContent=`Lvl ${t.level}`);let a=e.querySelector(".lua-lb-title");a&&(a.textContent=t.title);let r=e.querySelector(".lua-lb-xp-fill");r&&(r.style.width=`${v(t)}%`,r.style.background=t.color);let l=e.querySelector(".lua-lb-xp-text");l&&(l.textContent=`${t.xpInLevel}/${t.xpForLevel} XP`);let i=e.querySelector(".lua-lb-streak");i&&(i.textContent=`\u{1F525} ${t.streak}`);let s=e.querySelector(".lua-lb-cards");s&&(s.textContent=`${t.todayCards} today`)}function p(e){let t=document.createElement("div");t.className="lua-xp-toast",t.textContent=e,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}function b(e){let t=document.createElement("div");t.className="lua-badge-toast",t.innerHTML=`
        <span class="lua-badge-icon">${e.icon}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">${e.tierName} Badge!</span>
            <span class="lua-badge-name">${e.name} ${e.tierIcon}</span>
        </span>
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}function c(e,t){let n=document.createElement("div");n.className="lua-levelup-overlay",n.innerHTML=`
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">\u{1F389}</div>
            <div class="lua-levelup-label">Level Up!</div>
            <div class="lua-levelup-number">${e}</div>
            <div class="lua-levelup-title">${t}</div>
            <button class="lua-levelup-dismiss">Continue</button>
        </div>
    `,document.body.appendChild(n),n.addEventListener("click",a=>{(a.target===n||a.target.classList.contains("lua-levelup-dismiss"))&&n.remove()}),document.addEventListener("keydown",function a(r){r.key==="Escape"&&(n.remove(),document.removeEventListener("keydown",a))})}function g(e,t){let n=document.getElementById(e);if(!n)return;let a=Math.max(...t.map(l=>l.xp),1),r=t.map(l=>{let i=Math.max(2,l.xp/a*100),s=`${l.day}: ${l.xp} XP, ${l.cards} cards`;return`<div class="lua-chart-bar" style="height:${i}%" data-tooltip="${s}"></div>`}).join("");n.innerHTML=`<div class="lua-chart-bars">${r}</div>`}function y(e){let t=document.getElementById("lua-badges-grid");t&&(t.innerHTML=e.map(n=>{let a=n.earned?"earned":"locked",r=n.earned?n.tierIcon:"";return`
            <div class="lua-badge-card ${a}">
                <div class="lua-badge-card-icon">${n.icon}</div>
                <div class="lua-badge-card-name">${n.name}</div>
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
    `,document.head.appendChild(e)}function u(e,t){x();let n=document.getElementById("lvl-reviewer-bar");n||(n=document.createElement("div"),n.id="lvl-reviewer-bar",document.body.appendChild(n));let a=t>1?"lvl-rb-combo active":"lvl-rb-combo",r=t>1?`\u{1F525} ${t}x Combo`:"\u{1F525} 1x";n.innerHTML=`<span class="lvl-rb-xp">+${e} XP</span><span class="${a}">${r}</span>`,n.style.opacity="1"}var f={onSummary(e){o=e,d()},onXpAwarded(e){o=e.summary,d();let t=e.xpDetail,n=`+${e.xp} XP`;e.isNew?n+=" (new card)":t.daily100_bonus>0?n+=" (100 cards!)":t.streak_mult>1?n+=` (streak x${t.streak_mult})`:t.combo_mult>1&&(n+=` (combo x${t.combo_mult})`),p(n),u(e.xp,o.combo),e.badges&&e.badges.forEach((a,r)=>{setTimeout(()=>b(a),800+r*600)}),e.levelUp&&setTimeout(()=>c(e.level,e.newTitle),600)},onLevelUp(e,t){c(e,t)},onMonthStats(e){g("lua-month-chart",e)},onBadges(e){y(e)},updateReviewerBar(e,t){u(e,t)}};window.Lua=f;o=m();d();})();
