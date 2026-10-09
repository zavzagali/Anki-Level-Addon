"""Config helpers: read the add-on config merged over defaults."""

from aqt import mw

DEFAULTS = {
    "showHud": True,
    "showStatsPanel": True,
    "showWeekChart": True,
    "showMonthChart": True,
    "showLevelUpModal": True,
    "showBadges": True,
    "dailyGoal": 50,
    "language": "en",
    "hudPosition": "bottom",
    "hudCompact": False,
    "soundEnabled": True,
    "confettiEnabled": True,
    "streakBonusMax": 50,
    "comboThreshold": 10,
    "speedBonusThreshold": 5,
}

_ADDON = None


# Valid ranges for XP-affecting settings. Anki exposes config.json in the
# Add-ons → Config editor, so users can otherwise set e.g. dailyGoal=1
# (permanent +25% bonus) or comboThreshold=1 (2x multiplier after 4 cards)
# and level up ~10x faster. get() clamps every read, so manual edits,
# web UI writes, and award_xp calculations all go through these bounds.
CLAMPS = {
    "dailyGoal": (10, 500),
    "streakBonusMax": (0, 50),
    "comboThreshold": (5, 50),
    "speedBonusThreshold": (0, 10),
}


def _clamp(key: str, value):
    lo, hi = CLAMPS[key]
    try:
        v = int(value)
    except (TypeError, ValueError):
        return DEFAULTS[key]
    return max(lo, min(hi, v))


def _addon_package() -> str:
    global _ADDON
    if _ADDON is None:
        _ADDON = mw.addonManager.addonFromModule(__name__)
    return _ADDON


def get() -> dict:
    conf = dict(DEFAULTS)
    stored = mw.addonManager.getConfig(_addon_package()) or {}
    conf.update({k: v for k, v in stored.items() if v is not None})
    for key in CLAMPS:
        conf[key] = _clamp(key, conf.get(key, DEFAULTS[key]))
    return conf


def save(conf: dict) -> None:
    mw.addonManager.writeConfig(_addon_package(), conf)


def set_value(key: str, value) -> None:
    conf = get()
    conf[key] = value
    save(conf)
