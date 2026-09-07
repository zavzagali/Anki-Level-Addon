"""Badge definitions and checking logic."""

BADGES = {
    "first_card": {
        "name": "First Step",
        "desc": "Answer your first card",
        "icon": "🎯",
        "check": lambda s: s.get("totalCards", 0) >= 1,
    },
    "cards_100": {
        "name": "Memory Master",
        "desc": "Memorize 100 cards",
        "icon": "🧠",
        "check": lambda s: s.get("totalCards", 0) >= 100,
    },
    "cards_1000": {
        "name": "Legend",
        "desc": "Memorize 1000 cards",
        "icon": "⚡",
        "check": lambda s: s.get("totalCards", 0) >= 1000,
    },
    "cards_10000": {
        "name": "Anki God",
        "desc": "Memorize 10000 cards",
        "icon": "👑",
        "check": lambda s: s.get("totalCards", 0) >= 10000,
    },
    "streak_3": {
        "name": "Dedicated",
        "desc": "Study 3 days in a row",
        "icon": "🔥",
        "check": lambda s: s.get("bestStreak", 0) >= 3,
    },
    "streak_7": {
        "name": "Weekly Star",
        "desc": "Study 7 days in a row",
        "icon": "⭐",
        "check": lambda s: s.get("bestStreak", 0) >= 7,
    },
    "streak_30": {
        "name": "Monthly Champion",
        "desc": "Study 30 days in a row",
        "icon": "🏆",
        "check": lambda s: s.get("bestStreak", 0) >= 30,
    },
    "streak_100": {
        "name": "Unstoppable",
        "desc": "Study 100 days in a row",
        "icon": "💎",
        "check": lambda s: s.get("bestStreak", 0) >= 100,
    },
    "level_10": {
        "name": "Rising Star",
        "desc": "Reach level 10",
        "icon": "🌟",
        "check": lambda s: s.get("level", 1) >= 10,
    },
    "level_25": {
        "name": "Powerful",
        "desc": "Reach level 25",
        "icon": "💪",
        "check": lambda s: s.get("level", 1) >= 25,
    },
    "level_50": {
        "name": "Mega Power",
        "desc": "Reach level 50",
        "icon": "🔮",
        "check": lambda s: s.get("level", 1) >= 50,
    },
    "daily_goal": {
        "name": "Goal Hunter",
        "desc": "Complete daily goal",
        "icon": "🎯",
        "check": lambda s: s.get("todayCards", 0) >= 50,
    },
    "perfect_day": {
        "name": "Perfect Day",
        "desc": "Study 100 cards in a day",
        "icon": "💯",
        "check": lambda s: s.get("todayCards", 0) >= 100,
    },
    "combo_10": {
        "name": "Combo Killer",
        "desc": "Get a 10-combo",
        "icon": "⚡",
        "check": lambda s: s.get("combo", 0) >= 10,
    },
    "streak_365": {
        "name": "365 Warrior",
        "desc": "Study 365 days in a row",
        "icon": "🏅",
        "check": lambda s: s.get("bestStreak", 0) >= 365,
    },
    "combo_easy_100": {
        "name": "Combo God",
        "desc": "100 consecutive Easy answers",
        "icon": "💀",
        "check": lambda s: s.get("bestEasyCombo", 0) >= 100,
    },
}


def check_badges(store) -> list:
    """Check and earn new badges, returning list of newly earned."""
    s = store.get_summary()
    earned = []
    for badge_id, badge in BADGES.items():
        if badge["check"](s):
            if store.earn_badge(badge_id):
                earned.append({
                    "id": badge_id,
                    "name": badge["name"],
                    "desc": badge["desc"],
                    "icon": badge["icon"],
                })
    return earned


def get_all_badges() -> list:
    """Return all badge definitions for settings/stats display."""
    result = []
    for badge_id, badge in BADGES.items():
        result.append({
            "id": badge_id,
            "name": badge["name"],
            "desc": badge["desc"],
            "icon": badge["icon"],
        })
    return result
