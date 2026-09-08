"""Bridge — pycmd message router for Level commands."""

import json

from aqt import mw

from ..core import conf
from ..features.levelup import store as level_store
from ..features.levelup import badges as badge_module


def handle_message(handled, message: str, context):
    if not isinstance(message, str) or not message.startswith("lua:"):
        return handled

    command = message[len("lua:"):]

    if command == "summary":
        _push_summary()
    elif command == "week_stats":
        _push_week_stats()
    elif command == "month_stats":
        _push_month_stats()
    elif command == "badges":
        _push_badges()
    elif command.startswith("settings:"):
        _apply_setting(command[len("settings:"):])
    elif command == "dismiss_badge":
        pass
    else:
        return handled

    return (True, None)


def _push_summary() -> None:
    store = level_store.get_store()
    summary = store.get_summary()
    try:
        mw.reviewer.web.eval(
            f"window.Lua && window.Lua.onSummary({json.dumps(summary)});"
        )
    except Exception:
        pass
    try:
        mw.deckBrowser.web.eval(
            f"window.Lua && window.Lua.onSummary({json.dumps(summary)});"
        )
    except Exception:
        pass


def _push_week_stats() -> None:
    store = level_store.get_store()
    stats = store.get_week_stats()
    try:
        mw.deckBrowser.web.eval(
            f"window.Lua && window.Lua.onWeekStats({json.dumps(stats)});"
        )
    except Exception:
        pass


def _push_month_stats() -> None:
    store = level_store.get_store()
    stats = store.get_month_stats()
    try:
        mw.deckBrowser.web.eval(
            f"window.Lua && window.Lua.onMonthStats({json.dumps(stats)});"
        )
    except Exception:
        pass


from ..features.levelup.badges import TIER_ICONS, TIER_NAMES


def _push_badges() -> None:
    store = level_store.get_store()
    earned = store.badges()
    all_badges = badge_module.get_all_badges()
    for b in all_badges:
        tier = earned.get(b["id"], 0)
        b["tier"] = tier
        b["earned"] = tier > 0
        b["tierIcon"] = TIER_ICONS.get(tier - 1, "") if tier > 0 else ""
        b["tierName"] = TIER_NAMES.get(tier - 1, "") if tier > 0 else ""
    try:
        mw.deckBrowser.web.eval(
            f"window.Lua && window.Lua.onBadges({json.dumps(all_badges)});"
        )
    except Exception:
        pass


def _apply_setting(payload: str) -> None:
    try:
        data = json.loads(payload)
    except Exception:
        return
    if not isinstance(data, dict):
        return
    config = conf.get()
    for key in ("showHud", "showStatsPanel", "showLevelUpModal",
                "showBadges", "hudCompact", "soundEnabled", "confettiEnabled"):
        if key in data:
            config[key] = bool(data[key])
    if "dailyGoal" in data:
        config["dailyGoal"] = max(1, int(data["dailyGoal"]))
    if "hudPosition" in data:
        config["hudPosition"] = str(data["hudPosition"])
    conf.save(config)
