"""Leveling formulas: XP thresholds, titles, bonus multipliers."""

import math

TITLES = [
    (1, "Novice"),
    (11, "Apprentice"),
    (26, "Master"),
    (51, "Wizard"),
    (76, "Legend"),
    (100, "Anki God"),
]

XP_EASE = {1: -8, 2: 0, 3: 5, 4: 8}


def xp_for_level(level: int) -> int:
    return int(50 * (level ** 1.5))


def level_for_xp(total_xp: int) -> int:
    level = 1
    while total_xp >= xp_for_level(level):
        total_xp -= xp_for_level(level)
        level += 1
    return level


def xp_in_level(total_xp: int) -> int:
    level = 1
    while total_xp >= xp_for_level(level):
        total_xp -= xp_for_level(level)
        level += 1
    return total_xp


def get_title(level: int) -> str:
    title = "Novice"
    for min_lvl, title_text in reversed(TITLES):
        if level >= min_lvl:
            return title_text
    return title


def streak_multiplier(streak: int, max_bonus: int = 50) -> float:
    return 1.0 + min(streak, max_bonus // 10) * 0.1


def combo_multiplier(combo: int, threshold: int = 10) -> float:
    steps = combo // threshold
    return min(1.0 + steps * 0.25, 2.0)


def speed_bonus(answer_time_ms: int, threshold_sec: int = 5) -> int:
    if answer_time_ms < threshold_sec * 1000:
        return 2
    return 0


def daily_goal_bonus(reviews_today: int, goal: int) -> float:
    if reviews_today >= goal:
        return 0.25
    return 0.0


def calculate_xp(
    ease: int,
    streak: int = 0,
    combo: int = 0,
    answer_time_ms: int = 10000,
    reviews_today: int = 0,
    daily_goal: int = 50,
    streak_bonus_max: int = 50,
    combo_threshold: int = 10,
    speed_threshold: int = 5,
) -> dict:
    base = XP_EASE.get(ease, 1)
    s_mult = streak_multiplier(streak, streak_bonus_max)
    c_mult = combo_multiplier(combo, combo_threshold)
    s_bonus = speed_bonus(answer_time_ms, speed_threshold)
    d_bonus = daily_goal_bonus(reviews_today, daily_goal)

    total = base * s_mult * c_mult + s_bonus
    total += total * d_bonus

    return {
        "base": base,
        "total": int(total),
        "streak_mult": round(s_mult, 2),
        "combo_mult": round(c_mult, 2),
        "speed_bonus": s_bonus,
        "daily_bonus_pct": int(d_bonus * 100),
    }
