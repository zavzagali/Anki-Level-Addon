"""Badge definitions and checking logic."""

TIER_ICONS = {0: "🥉", 1: "🥈", 2: "🥇"}
TIER_NAMES = {0: "Bronze", 1: "Silver", 2: "Gold"}
MAX_TIER = 3

BADGES = {
    "first_card": {
        "name": "First Step",
        "desc": "Answer your first card",
        "icon": "🎯",
        "tiers": [
            lambda s: s.get("totalCards", 0) >= 1,
        ],
    },
    "cards_100": {
        "name": "Memory Master",
        "desc": "Memorize cards",
        "icon": "🧠",
        "tiers": [
            lambda s: s.get("totalCards", 0) >= 1000,
            lambda s: s.get("totalCards", 0) >= 5000,
            lambda s: s.get("totalCards", 0) >= 20000,
        ],
    },
    "cards_1000": {
        "name": "Legend",
        "desc": "Memorize cards",
        "icon": "⚡",
        "tiers": [
            lambda s: s.get("totalCards", 0) >= 1000,
            lambda s: s.get("totalCards", 0) >= 5000,
            lambda s: s.get("totalCards", 0) >= 10000,
        ],
    },
    "streak_3": {
        "name": "Dedicated",
        "desc": "Study streak",
        "icon": "🔥",
        "tiers": [
            lambda s: s.get("bestStreak", 0) >= 3,
            lambda s: s.get("bestStreak", 0) >= 14,
        ],
    },
    "streak_7": {
        "name": "Weekly Star",
        "desc": "Study streak",
        "icon": "⭐",
        "tiers": [
            lambda s: s.get("bestStreak", 0) >= 7,
            lambda s: s.get("bestStreak", 0) >= 14,
            lambda s: s.get("bestStreak", 0) >= 21,
        ],
    },
    "streak_30": {
        "name": "Monthly Champion",
        "desc": "Study streak",
        "icon": "🏆",
        "tiers": [
            lambda s: s.get("bestStreak", 0) >= 30,
            lambda s: s.get("bestStreak", 0) >= 90,
            lambda s: s.get("bestStreak", 0) >= 180,
        ],
    },
    "streak_100": {
        "name": "Unstoppable",
        "desc": "Study 365 days in a row",
        "icon": "💎",
        "tiers": [
            lambda s: s.get("bestStreak", 0) >= 365,
        ],
    },
    "level_10": {
        "name": "Rising Star",
        "desc": "Reach level",
        "icon": "🌟",
        "tiers": [
            lambda s: s.get("level", 1) >= 10,
            lambda s: s.get("level", 1) >= 30,
            lambda s: s.get("level", 1) >= 50,
        ],
    },
    "level_25": {
        "name": "Powerful",
        "desc": "Reach level",
        "icon": "💪",
        "tiers": [
            lambda s: s.get("level", 1) >= 25,
            lambda s: s.get("level", 1) >= 60,
            lambda s: s.get("level", 1) >= 80,
        ],
    },
    "level_50": {
        "name": "Mega Power",
        "desc": "Reach level",
        "icon": "🔮",
        "tiers": [
            lambda s: s.get("level", 1) >= 50,
            lambda s: s.get("level", 1) >= 75,
            lambda s: s.get("level", 1) >= 100,
        ],
    },
    "daily_goal": {
        "name": "Goal Hunter",
        "desc": "Complete daily goal",
        "icon": "🎯",
        "tiers": [
            lambda s: s.get("todayCards", 0) >= s.get("dailyGoal", 50),
            lambda s: s.get("todayCards", 0) >= s.get("dailyGoal", 50) * 2,
            lambda s: s.get("todayCards", 0) >= s.get("dailyGoal", 50) * 3,
        ],
    },
    "perfect_day": {
        "name": "Perfect Day",
        "desc": "Study cards in a day",
        "icon": "💯",
        "tiers": [
            lambda s: s.get("todayCards", 0) >= 100,
            lambda s: s.get("todayCards", 0) >= 200,
            lambda s: s.get("todayCards", 0) >= 500,
        ],
    },
    "combo_10": {
        "name": "Combo Killer",
        "desc": "Get combos",
        "icon": "⚡",
        "tiers": [
            lambda s: s.get("combo", 0) >= 10,
            lambda s: s.get("combo", 0) >= 25,
            lambda s: s.get("combo", 0) >= 50,
        ],
    },
    "streak_365": {
        "name": "365 Warrior",
        "desc": "Study 365 days in a row",
        "icon": "🏅",
        "tiers": [
            lambda s: s.get("bestStreak", 0) >= 365,
            lambda s: s.get("bestStreak", 0) >= 500,
            lambda s: s.get("bestStreak", 0) >= 730,
        ],
    },
    "combo_easy_100": {
        "name": "Combo God",
        "desc": "Consecutive Easy answers",
        "icon": "💀",
        "tiers": [
            lambda s: s.get("bestEasyCombo", 0) >= 100,
            lambda s: s.get("bestEasyCombo", 0) >= 250,
            lambda s: s.get("bestEasyCombo", 0) >= 500,
        ],
    },
}


def check_badges(store) -> list:
    """Check and earn new badges, returning list of newly earned."""
    s = store.get_summary()
    earned = []
    for badge_id, badge in BADGES.items():
        current_tier = store.get_badge_tier(badge_id)
        if current_tier >= len(badge["tiers"]):
            continue
        if badge["tiers"][current_tier](s):
            if store.earn_badge(badge_id):
                earned.append({
                    "id": badge_id,
                    "name": badge["name"],
                    "desc": badge["desc"],
                    "icon": badge["icon"],
                    "tier": current_tier,
                    "tierIcon": TIER_ICONS[current_tier],
                    "tierName": TIER_NAMES[current_tier],
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
