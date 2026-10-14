"use strict";(()=>{function f(){return window.LUA_DATA||{level:1,totalXp:0,xpInLevel:0,xpForLevel:50,title:"Novice",color:"rgb(48, 209, 88)",levelIcon:"levels/novice.svg",streak:0,bestStreak:0,totalCards:0,todayXp:0,todayCards:0,todayCorrect:0,combo:0,badges:{}}}function y(){return window.LUA_ASSET_ROOT||""}function u(e){if(!e)return"";if(e.startsWith("/")||e.startsWith("http"))return e;let t=y();return t?`${t}/${e}`:e}function b(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function s(e,t,n,r,a){let l=e?u(e):"";return l?`<img class="${n}" src="${b(l)}" alt="${b(a)}" width="${r}" height="${r}" loading="lazy" />`:`<span class="${n}-fallback">${t}</span>`}var c=f();function x(e){return e.xpForLevel<=0?100:Math.min(100,e.xpInLevel/e.xpForLevel*100)}function m(){let e=c,t=document.getElementById("lua-level-bar");if(t){let r=t.querySelector(".lua-lb-level");r&&(r.textContent=`Lvl ${e.level}`);let a=t.querySelector(".lua-lb-title");a&&(a.textContent=e.title);let l=t.querySelector(".lua-lb-level-icon");l&&e.levelIcon&&(l.src=u(e.levelIcon));let o=t.querySelector(".lua-lb-xp-fill");o&&(o.style.width=`${x(e)}%`,o.style.background=e.color);let i=t.querySelector(".lua-lb-xp-text");i&&(i.textContent=`${e.xpInLevel}/${e.xpForLevel} XP`);let d=t.querySelector(".lua-lb-streak");d&&(d.innerHTML=`${s("ui/flame.svg","","lua-lb-streak-img",13,"streak")} ${e.streak}`);let v=t.querySelector(".lua-lb-cards");v&&(v.textContent=`${e.todayCards} today`)}let n=document.querySelector("#lvlup-panel .lvlup-level-icon");if(n&&e.levelIcon){let r=u(e.levelIcon);r&&n.getAttribute("src")!==r&&(n.src=r)}}function L(e){let t=document.createElement("div");t.className="lua-badge-toast",t.innerHTML=`
        <span class="lua-badge-icon">${s(e.asset,e.icon,"lua-badge-img",26,e.name)}</span>
        <span class="lua-badge-info">
            <span class="lua-badge-label">${e.tierName} Badge!</span>
            <span class="lua-badge-name">${e.name} ${s(e.tierAsset,e.tierIcon,"lua-tier-img",14,e.tierName)}</span>
        </span>
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}function p(e,t,n){let r=document.createElement("div");r.className="lua-levelup-overlay";let a=s(n||c.levelIcon,"","lua-levelup-img",64,t);r.innerHTML=`
        <div class="lua-levelup-card">
            <div class="lua-levelup-icon">${a}</div>
            <div class="lua-levelup-label">Level Up!</div>
            <div class="lua-levelup-number">${e}</div>
            <div class="lua-levelup-title">${t}</div>
            <button class="lua-levelup-dismiss">Continue</button>
        </div>
    `,document.body.appendChild(r),r.addEventListener("click",l=>{(l.target===r||l.target.classList.contains("lua-levelup-dismiss"))&&r.remove()}),document.addEventListener("keydown",function l(o){o.key==="Escape"&&(r.remove(),document.removeEventListener("keydown",l))})}function $(e,t){let n=document.getElementById(e);if(!n)return;let r=Math.max(...t.map(l=>l.xp),1),a=t.map(l=>{let o=Math.max(2,l.xp/r*100),i=`${l.day}: ${l.xp} XP, ${l.cards} cards`;return`<div class="lua-chart-bar" style="height:${o}%" data-tooltip="${i}"></div>`}).join("");n.innerHTML=`<div class="lua-chart-bars">${a}</div>`}function w(e){let t=document.getElementById("lua-badges-grid");t&&(t.innerHTML=e.map(n=>{let r=n.earned?"earned":"locked",a=n.earned?s(n.tierAsset,n.tierIcon,"lua-tier-img",14,n.tierName):"";return`
            <div class="lua-badge-card ${r} tier-${n.tier}">
                <div class="lua-badge-card-icon">${s(n.asset,n.icon,"lua-badge-card-img",30,n.name)}</div>
                <div class="lua-badge-card-name">${n.name}</div>
                <div class="lua-badge-card-tier">${a}</div>
            </div>
        `}).join(""))}function h(){if(document.getElementById("lvl-reviewer-css"))return;let e=document.createElement("style");e.id="lvl-reviewer-css",e.textContent=`
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
    `,document.head.appendChild(e)}function g(e,t){h();let n=document.getElementById("lvl-reviewer-bar");n||(n=document.createElement("div"),n.id="lvl-reviewer-bar",document.body.appendChild(n));let r=e<0?"lvl-rb-xp negative":"lvl-rb-xp",a=e<0?`${e} XP`:`+${e} XP`,l=s("ui/flame.svg","","lvl-rb-icon",12,"combo"),o=s("ui/broken.svg","","lvl-rb-icon",12,"broken"),i="lvl-rb-combo",d=`${l} 1x`;t>1?(i="lvl-rb-combo active",d=`${l} ${t}x Combo`):t===0&&(i="lvl-rb-combo broken",d=`${o} Combo broken`),n.innerHTML=`<span class="${r}">${a}</span><span class="${i}">${d}</span>`,n.style.opacity="1"}var S={onSummary(e){c=e,m()},onXpAwarded(e){c=e.summary,m(),g(e.xp,c.combo),e.badges&&e.badges.forEach((t,n)=>{setTimeout(()=>L(t),800+n*600)}),e.levelUp&&setTimeout(()=>p(e.level,e.newTitle,e.summary.levelIcon),600)},onLevelUp(e,t){p(e,t,c.levelIcon)},onMonthStats(e){$("lua-month-chart",e)},onBadges(e){w(e)},updateReviewerBar(e,t){g(e,t)}};window.Lua=S;c=f();m();})();
