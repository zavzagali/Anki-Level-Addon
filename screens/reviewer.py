"""Reviewer chrome — handle card answers."""

import json
import os
import time

from aqt import gui_hooks, mw
from aqt.qt import QTimer
from aqt.reviewer import Reviewer

from ..features.levelup import store as level_store
from ..features.levelup import badges as badge_module


_last_answer_time = 0.0
_css_injected = False
_fade_timer = None


def _eval(js: str) -> None:
    try:
        rev = mw.reviewer
        if rev and rev.web:
            rev.web.eval(js)
    except Exception as e:
        print(f"[Level] reviewer eval error: {e}")


def _inject_css() -> None:
    global _css_injected
    if _css_injected:
        return
    _css_injected = True
    addon_path = os.path.dirname(os.path.dirname(__file__))
    addon_package = mw.addonManager.addonFromModule(__name__.split(".")[0])
    web_root = f"/_addons/{addon_package}/web"
    try:
        version = int(os.path.getmtime(os.path.join(addon_path, "web", "levelup.css")))
    except OSError:
        version = 0
    css_url = f"{web_root}/levelup.css?v={version}"
    _eval(
        'if(!document.getElementById("lvl-reviewer-css-link")){'
        'var s=document.createElement("link");'
        's.id="lvl-reviewer-css-link";s.rel="stylesheet";'
        f's.href="{css_url}";' 'document.head.appendChild(s);}'
    )


def _update_bar(xp: int, combo: int) -> None:
    global _fade_timer

    if _fade_timer is not None:
        _fade_timer.stop()
        _fade_timer = None

    xp_cls = "lvl-rb-xp negative" if xp < 0 else "lvl-rb-xp"
    xp_txt = f"{xp} XP" if xp < 0 else f"+{xp} XP"

    if combo > 1:
        combo_cls = "lvl-rb-combo active"
        combo_txt = f"\\u{{1F525}} {combo}x Combo"
    elif combo == 1:
        combo_cls = "lvl-rb-combo"
        combo_txt = "\\u{{1F525}} 1x"
    else:
        combo_cls = "lvl-rb-combo broken"
        combo_txt = "\\u{1F6AB} Combo broken"

    js = (
        "(function(){"
        "var b=document.getElementById('lvl-reviewer-bar');"
        "if(!b){b=document.createElement('div');b.id='lvl-reviewer-bar';document.body.appendChild(b);}"
        f"b.innerHTML='<span class=\"{xp_cls}\">{xp_txt}</span>"
        f"<span class=\"{combo_cls}\">{combo_txt}</span>';"
        "b.style.opacity='1';"
        "})()"
    )
    _eval(js)

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

    xp_val = result["earned"]
    combo_val = summary["combo"]
    QTimer.singleShot(200, lambda x=xp_val, c=combo_val: _do_bar(x, c))


def _do_bar(xp: int, combo: int) -> None:
    _inject_css()
    _update_bar(xp, combo)


def _on_show_answer(card) -> None:
    global _last_answer_time
    _last_answer_time = time.time()


def install() -> None:
    gui_hooks.reviewer_did_show_answer.append(_on_show_answer)
    gui_hooks.reviewer_did_answer_card.append(_on_answer_card)
