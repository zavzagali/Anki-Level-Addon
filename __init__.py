"""Level — gamification for Anki with XP, levels, streaks, badges."""

import json
import os

from aqt import gui_hooks, mw
from aqt.deckbrowser import DeckBrowser

from .core import conf
from .core import leveling
from .features.levelup import store as level_store
from .ui import bridge

addon_path = os.path.dirname(__file__)
addon_package = mw.addonManager.addonFromModule(__name__)
addon_root = f"/_addons/{addon_package}"
web_root = f"{addon_root}/web"

mw.addonManager.setWebExports(__name__, r"(web|user_files)/.*")


def _asset(*parts: str) -> str:
    try:
        version = int(os.path.getmtime(os.path.join(addon_path, "web", *parts)))
    except OSError:
        version = 0
    return f"{web_root}/{'/'.join(parts)}?v={version}"


def _summary() -> dict:
    try:
        return level_store.get_store().get_summary()
    except Exception:
        return {
            "level": 1, "totalXp": 0, "xpInLevel": 0, "xpForLevel": 50,
            "title": "Novice", "color": "rgb(48, 209, 88)",
            "levelIcon": "levels/novice.svg",
            "streak": 0, "bestStreak": 0, "totalCards": 0,
            "todayXp": 0, "todayCards": 0, "todayCorrect": 0, "combo": 0,
            "bestEasyCombo": 0, "dailyGoal": 50,
            "streakMilestones": {"7": 0, "30": 0, "365": 0},
            "badges": {},
        }


def _month_stats() -> list:
    try:
        return level_store.get_store().get_month_stats()
    except Exception:
        return [{"day": str(i), "xp": 0, "cards": 0, "isToday": False} for i in range(1, 31)]


def _panel_html(s: dict) -> str:
    pct = 0.0
    if s.get("xpForLevel", 0) > 0:
        pct = min(100.0, (s["xpInLevel"] / s["xpForLevel"]) * 100)
    color = leveling.level_color(s["level"])
    icon_src = f"{web_root}/assets/{s.get('levelIcon', 'levels/novice.svg')}"
    return (
        '<div id="lvlup-panel">'
        '<div class="lvlup-panel-inner">'
        f'<img class="lvlup-level-icon" src="{icon_src}" alt="{s["title"]}" width="28" height="28">'
        f'<div class="lvlup-level" style="color:{color}">Lvl {s["level"]}</div>'
        f'<div class="lvlup-title">{s["title"]}</div>'
        '<div class="lvlup-xp-bar">'
        f'<div class="lvlup-xp-fill" style="width:{pct:.1f}%;background:{color}"></div>'
        f'<span class="lvlup-xp-text">{s["xpInLevel"]}/{s["xpForLevel"]} XP</span>'
        '</div>'
        '<div class="lvlup-stats">'
        f'<span class="lvlup-stat"><img src="{web_root}/assets/ui/flame.svg" alt="streak" width="13" height="13"> {s["streak"]} days</span>'
        f'<span class="lvlup-stat"><img src="{web_root}/assets/ui/cards.svg" alt="cards" width="13" height="13"> {s["totalCards"]} cards</span>'
        f'<span class="lvlup-stat"><img src="{web_root}/assets/ui/bolt.svg" alt="xp" width="13" height="13"> {s["totalXp"]} XP</span>'
        '</div>'
        '</div>'
        '</div>'
    )


def on_webview_will_set_content(web_content, context) -> None:
    config = conf.get()
    if not config.get("showHud", True):
        return

    is_deck_browser = isinstance(context, DeckBrowser)
    if not is_deck_browser:
        return

    summary = _summary()

    web_content.head += f'<link rel="stylesheet" href="{_asset("levelup.css")}">'
    month_stats = _month_stats() if config.get("showMonthChart", True) else []
    lua_config = {
        "showWeekChart": config.get("showWeekChart", True),
        "showMonthChart": config.get("showMonthChart", True),
        "showBadges": config.get("showBadges", True),
    }
    web_content.head += f'<script>window.LUA_DATA = {json.dumps(summary)};</script>'
    web_content.head += f'<script>window.LUA_ASSET_ROOT = {json.dumps(f"{web_root}/assets")};</script>'
    web_content.head += f'<script>window.LUA_CONFIG = {json.dumps(lua_config)};</script>'
    web_content.head += f'<script>window.LUA_MONTH_STATS = {json.dumps(month_stats)};</script>'
    web_content.head += f'<script src="{_asset("shared.js")}"></script>'
    web_content.head += f'<script src="{_asset("levelup.js")}"></script>'
    web_content.body += _panel_html(summary)

    if config.get("showStatsPanel", True):
        web_content.head += f'<script src="{_asset("stats.js")}"></script>'


def on_profile_open() -> None:
    level_store.get_store().reset()


level_store.install_hooks()

gui_hooks.webview_will_set_content.append(on_webview_will_set_content)
gui_hooks.webview_did_receive_js_message.append(bridge.handle_message)
gui_hooks.profile_did_open.append(on_profile_open)

from .screens import reviewer

reviewer.install()
