"""Reviewer chrome — handle card answers."""

import json
import time

from aqt import gui_hooks, mw
from aqt.reviewer import Reviewer

from ..features.levelup import store as level_store
from ..features.levelup import badges as badge_module


_last_answer_time = 0.0


def _eval(js: str) -> None:
    try:
        rev = mw.reviewer
        if rev and rev.web:
            rev.web.eval(js)
    except Exception:
        pass


def _on_answer_card(reviewer: Reviewer, card, ease: int) -> None:
    if mw.col is None:
        return

    store = level_store.get_store()

    now = time.time()
    answer_time_ms = int((now - _last_answer_time) * 1000) if _last_answer_time else 10000
    answer_time_ms = max(answer_time_ms, 0)

    result = store.award_xp(ease, answer_time_ms)
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
        "summary": summary,
    }

    _eval(f"if(typeof window.Lua!=='undefined')window.Lua.onXpAwarded({json.dumps(payload)});")

    if result["levelUp"]:
        try:
            from aqt.qt import QTimer
            j = f"if(typeof window.Lua!=='undefined')window.Lua.onLevelUp({result['level']},{json.dumps(result['newTitle'])});"
            QTimer.singleShot(300, lambda x=j: _eval(x))
        except Exception:
            pass


def _on_show_answer(card) -> None:
    global _last_answer_time
    _last_answer_time = time.time()


def install() -> None:
    gui_hooks.reviewer_did_show_answer.append(_on_show_answer)
    gui_hooks.reviewer_did_answer_card.append(_on_answer_card)
