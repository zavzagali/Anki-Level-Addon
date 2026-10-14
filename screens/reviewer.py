"""Reviewer chrome — handle card answers."""

import json
import time

from aqt import gui_hooks, mw
from aqt.qt import QTimer
from aqt.reviewer import Reviewer

from ..features.levelup import store as level_store
from ..features.levelup import badges as badge_module


try:
    _WEB_ROOT = f"/_addons/{mw.addonManager.addonFromModule(__name__.split('.')[0])}"
except Exception:
    _WEB_ROOT = ""
_FLAME_URL = f"{_WEB_ROOT}/web/assets/ui/flame.svg"
_BROKEN_URL = f"{_WEB_ROOT}/web/assets/ui/broken.svg"


_last_answer_time = 0.0
_fade_timer = None
_pending_feedback = None  # (xp, combo) shown on next question so it survives DOM reload


# Inline CSS — no external file dependency. External <link> to levelup.css
# could 404 (wrong addon id) or be wiped on card change, leaving the bar
# unstyled at the top-left as plain text. Inline <style> is re-injected
# on every feedback, so positioning is guaranteed.
_INLINE_CSS = """
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
#lvl-reviewer-bar .lvl-rb-xp { font-weight: 700; font-size: 13px; color: var(--lvl-accent, #0A84FF); }
#lvl-reviewer-bar .lvl-rb-xp.negative { color: #FF453A; }
#lvl-reviewer-bar .lvl-rb-combo { font-weight: 600; font-size: 11px; color: var(--lvl-subtle, #98989d); }
#lvl-reviewer-bar .lvl-rb-combo.active { color: #FF9F0A; }
#lvl-reviewer-bar .lvl-rb-combo.broken { color: #FF453A; font-style: italic; }
#lvl-reviewer-bar img.lvl-rb-icon { width: 12px; height: 12px; vertical-align: -2px; }
"""


def _eval(js: str) -> None:
    try:
        rev = mw.reviewer
        if rev and rev.web:
            rev.web.eval(js)
    except Exception as e:
        print(f"[Level] reviewer eval error: {e}")


def _ensure_style_js() -> str:
    css_json = json.dumps(_INLINE_CSS)
    return (
        "(function(){"
        "var s=document.getElementById('lvl-reviewer-css-inline');"
        "if(!s){s=document.createElement('style');s.id='lvl-reviewer-css-inline';"
        f"s.textContent={css_json};document.head.appendChild(s);"
        "}"
        "})()"
    )


def _feedback_js(xp: int, combo: int) -> str:
    xp_cls = "lvl-rb-xp negative" if xp < 0 else "lvl-rb-xp"
    xp_txt = f"{xp} XP" if xp < 0 else f"+{xp} XP"

    if combo > 1:
        combo_cls = "lvl-rb-combo active"
        combo_txt = f'<img class="lvl-rb-icon" src="{_FLAME_URL}" alt="" width="12" height="12"> {combo}x Combo'
    elif combo == 1:
        combo_cls = "lvl-rb-combo"
        combo_txt = f'<img class="lvl-rb-icon" src="{_FLAME_URL}" alt="" width="12" height="12"> 1x'
    else:
        combo_cls = "lvl-rb-combo broken"
        combo_txt = f'<img class="lvl-rb-icon" src="{_BROKEN_URL}" alt="" width="12" height="12"> Combo broken'

    # JSON-encode dynamic strings so quotes/emoji survive JS injection.
    payload = json.dumps({
        "xpCls": xp_cls, "xpTxt": xp_txt,
        "comboCls": combo_cls, "comboTxt": combo_txt,
    })
    css_json = json.dumps(_INLINE_CSS)

    return (
        "(function(){"
        "var P=" + payload + ";"
        # style first — guarantees bar styling even on fresh card DOM
        "var s=document.getElementById('lvl-reviewer-css-inline');"
        "if(!s){s=document.createElement('style');s.id='lvl-reviewer-css-inline';"
        f"s.textContent={css_json};"
        "(document.head||document.documentElement).appendChild(s);}"
        # bottom pill bar only
        "var b=document.getElementById('lvl-reviewer-bar');"
        "if(!b){b=document.createElement('div');b.id='lvl-reviewer-bar';document.body.appendChild(b);}"
        "b.innerHTML='<span class=\"'+P.xpCls+'\">'+P.xpTxt+'</span>'"
        "+'<span class=\"'+P.comboCls+'\">'+P.comboTxt+'</span>';"
        "b.style.opacity='1';"
        "})()"
    )


def _show_feedback(xp: int, combo: int) -> None:
    _eval(_feedback_js(xp, combo))
    global _fade_timer
    if _fade_timer is not None:
        try:
            _fade_timer.stop()
        except Exception:
            pass
        _fade_timer = None
    if combo == 0:
        _fade_timer = QTimer()
        _fade_timer.setSingleShot(True)
        _fade_timer.timeout.connect(_fade_bar)
        _fade_timer.start(2000)


def _fade_bar() -> None:
    global _fade_timer
    _fade_timer = None
    _eval(
        "(function(){"
        "var b=document.getElementById('lvl-reviewer-bar');"
        "if(b)b.style.opacity='0';"
        "})()"
    )


def _on_answer_card(reviewer: Reviewer, card, ease: int) -> None:
    global _pending_feedback
    if mw.col is None:
        return

    store = level_store.get_store()

    now = time.time()
    answer_time_ms = int((now - _last_answer_time) * 1000) if _last_answer_time else 10000
    answer_time_ms = max(answer_time_ms, 0)

    is_new = card.queue == 0 or card.type == 0

    result = store.award_xp(ease, answer_time_ms, is_new=is_new)
    new_badges = badge_module.check_badges(store)

    summary = store.get_summary()
    payload = {
        "xp": result["earned"],
        "level": result["level"],
        "levelUp": result["levelUp"],
        "newTitle": result["newTitle"],
        "oldTitle": result["oldTitle"],
        "streak": result["streak"],
        "totalXp": result["totalXp"],
        "xpInLevel": result["xpInLevel"],
        "xpForLevel": result["xpForLevel"],
        "badges": new_badges,
        "xpDetail": result["xp"],
        "isNew": is_new,
        "summary": summary,
    }

    _eval(f"if(typeof window.Lua!=='undefined')window.Lua.onXpAwarded({json.dumps(payload)});")

    if result["levelUp"]:
        j = f"if(typeof window.Lua!=='undefined')window.Lua.onLevelUp({result['level']},{json.dumps(result['newTitle'])});"
        QTimer.singleShot(300, lambda x=j: _eval(x))

    # Reviewer webview has no window.Lua bundle and its DOM is rebuilt on
    # the next card, so: remember feedback, show now, re-show after
    # navigation, and re-show again when the next question is displayed.
    xp_val = result["earned"]
    combo_val = summary["combo"]
    _pending_feedback = (xp_val, combo_val)
    _show_feedback(xp_val, combo_val)
    QTimer.singleShot(350, lambda x=xp_val, c=combo_val: _show_feedback(x, c))


def _on_show_answer(card) -> None:
    global _last_answer_time
    _last_answer_time = time.time()


def _on_show_question(*args) -> None:
    # Fired when the next card's DOM is ready — guarantees the bar
    # lands on visible content (card change wipes injected DOM).
    global _pending_feedback
    _eval(_ensure_style_js())
    if _pending_feedback is not None:
        xp_val, combo_val = _pending_feedback
        _pending_feedback = None
        _show_feedback(xp_val, combo_val)


def install() -> None:
    gui_hooks.reviewer_did_show_answer.append(_on_show_answer)
    gui_hooks.reviewer_did_answer_card.append(_on_answer_card)
    if hasattr(gui_hooks, "reviewer_did_show_question"):
        gui_hooks.reviewer_did_show_question.append(_on_show_question)
