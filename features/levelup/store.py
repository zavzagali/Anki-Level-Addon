"""XP persistence — collection config like habits store.

Storage keys:
    lvlup_state       {"v":1, "xp":0, "level":1, "totalXp":0,
                       "streak":0, "bestStreak":0, "lastDay":null,
                       "todayXp":0, "todayCount":0, "todayCorrect":0,
                       "combo":0, "totalCards":0}
    lvlup_log_YYYY    {day_int: {"xp":n, "cards":n, "correct":n}}
    lvlup_badges      {badge_id: earned_day_int}
"""

import time
from datetime import datetime, timezone

from aqt import gui_hooks, mw

from ...core import conf, leveling

STATE_KEY = "lvlup_state"
LOG_PREFIX = "lvlup_log_"
BADGES_KEY = "lvlup_badges"
WRITE_DELAY_MS = 400

DEFAULT_STATE = {
    "v": 1,
    "xp": 0,
    "level": 1,
    "totalXp": 0,
    "streak": 0,
    "bestStreak": 0,
    "lastDay": None,
    "todayXp": 0,
    "todayCount": 0,
    "todayCorrect": 0,
    "combo": 0,
    "easyCombo": 0,
    "bestEasyCombo": 0,
    "totalCards": 0,
}


def _today_int() -> int:
    now = datetime.now(timezone.utc)
    return int(now.strftime("%Y%m%d"))


def _today_ts() -> int:
    now = datetime.now(timezone.utc)
    return int(now.timestamp())


def _col():
    return mw.col


def _read(key, default):
    col = _col()
    if col is None:
        return default
    try:
        return col.get_config(key, default)
    except Exception:
        return default


def _write(key, value) -> None:
    col = _col()
    if col is None:
        return
    try:
        col.set_config(key, value, undoable=False)
    except Exception as e:
        print(f"[Level] cannot write {key}: {e}")


class LevelStore:
    def __init__(self):
        self._state = None
        self._log_cache = {}
        self._badges = None
        self._dirty = set()
        self._timer = None

    def reset(self):
        self._state = None
        self._log_cache.clear()
        self._badges = None
        self._dirty.clear()

    def flush(self):
        if self._timer is not None:
            self._timer.stop()
        if not self._dirty or _col() is None:
            self._dirty.clear()
            return
        pending, self._dirty = self._dirty, set()

        years = [y for y in pending if isinstance(y, int)]
        for year in years:
            log = {
                str(day): v
                for day, v in sorted(self._log_cache.get(year, {}).items())
            }
            _write(f"{LOG_PREFIX}{year}", log)

        if "state" in pending and self._state is not None:
            _write(STATE_KEY, self._state)
        if "badges" in pending and self._badges is not None:
            _write(BADGES_KEY, self._badges)

    def _touch(self, what):
        self._dirty.add(what)
        self._schedule_flush()

    def _schedule_flush(self):
        try:
            from aqt.qt import QTimer
        except Exception:
            self.flush()
            return
        if self._timer is None:
            self._timer = QTimer()
            self._timer.setSingleShot(True)
            self._timer.timeout.connect(self.flush)
        self._timer.start(WRITE_DELAY_MS)

    def state(self) -> dict:
        if self._state is None:
            raw = _read(STATE_KEY, None)
            if raw is None or not isinstance(raw, dict) or raw.get("v") != 1:
                self._state = dict(DEFAULT_STATE)
            else:
                self._state = {**DEFAULT_STATE, **raw}
        return self._state

    def _save_state(self):
        self._touch("state")

    def log(self, year: int) -> dict:
        if year not in self._log_cache:
            raw = _read(f"{LOG_PREFIX}{year}", {}) or {}
            parsed = {}
            for day_str, data in raw.items():
                try:
                    day_int = int(day_str)
                except (TypeError, ValueError):
                    continue
                if isinstance(data, dict):
                    parsed[day_int] = data
            self._log_cache[year] = parsed
        return self._log_cache[year]

    def badges(self) -> dict:
        if self._badges is None:
            self._badges = _read(BADGES_KEY, {}) or {}
        return self._badges

    def earn_badge(self, badge_id: str) -> bool:
        b = self.badges()
        if badge_id in b:
            return False
        b[badge_id] = _today_int()
        self._badges = b
        self._touch("badges")
        return True

    def award_xp(self, ease: int, answer_time_ms: int) -> dict:
        """Main entry: called on every card answer."""
        s = self.state()
        today = _today_int()
        config = conf.get()

        if s["lastDay"] is not None and s["lastDay"] != today:
            days_diff = _days_between(s["lastDay"], today)
            if days_diff == 1:
                s["streak"] += 1
            elif days_diff > 1:
                s["streak"] = 1
            s["todayXp"] = 0
            s["todayCount"] = 0
            s["todayCorrect"] = 0

        s["lastDay"] = today
        s["todayCount"] += 1
        if ease >= 3:
            s["todayCorrect"] += 1
            s["combo"] += 1
        else:
            s["combo"] = 0

        if ease == 4:
            s["easyCombo"] += 1
            s["bestEasyCombo"] = max(s["bestEasyCombo"], s["easyCombo"])
        else:
            s["easyCombo"] = 0

        xp_result = leveling.calculate_xp(
            ease=ease,
            streak=s["streak"],
            combo=s["combo"],
            answer_time_ms=answer_time_ms,
            reviews_today=s["todayCount"],
            daily_goal=config.get("dailyGoal", 50),
            streak_bonus_max=config.get("streakBonusMax", 50),
            combo_threshold=config.get("comboThreshold", 10),
            speed_threshold=config.get("speedBonusThreshold", 5),
        )

        earned = xp_result["total"]
        s["xp"] += earned
        s["totalXp"] = max(0, s["totalXp"] + earned)
        s["todayXp"] += earned
        s["totalCards"] += 1

        old_level = s["level"]
        new_level = leveling.level_for_xp(s["totalXp"])
        s["level"] = new_level

        s["bestStreak"] = max(s["bestStreak"], s["streak"])

        day_log = self.log(int(datetime.now(timezone.utc).strftime("%Y")))
        day_log[today] = {
            "xp": day_log.get(today, {}).get("xp", 0) + earned,
            "cards": day_log.get(today, {}).get("cards", 0) + 1,
            "correct": day_log.get(today, {}).get("correct", 0) + (1 if ease >= 3 else 0),
        }
        self._touch(int(datetime.now(timezone.utc).strftime("%Y")))

        self._state = s
        self._save_state()

        level_up = new_level > old_level
        return {
            "xp": xp_result,
            "earned": earned,
            "level": new_level,
            "levelUp": level_up,
            "newTitle": leveling.get_title(new_level),
            "oldTitle": leveling.get_title(old_level) if level_up else None,
            "streak": s["streak"],
            "totalXp": s["totalXp"],
            "xpInLevel": leveling.xp_in_level(s["totalXp"]),
            "xpForLevel": leveling.xp_for_level(new_level),
        }

    def get_summary(self) -> dict:
        s = self.state()
        today = _today_int()
        day_log = self.log(int(datetime.now(timezone.utc).strftime("%Y")))
        today_data = day_log.get(today, {})
        return {
            "level": s["level"],
            "totalXp": s["totalXp"],
            "xpInLevel": leveling.xp_in_level(s["totalXp"]),
            "xpForLevel": leveling.xp_for_level(s["level"]),
            "title": leveling.get_title(s["level"]),
            "streak": s["streak"],
            "bestStreak": s["bestStreak"],
            "totalCards": s["totalCards"],
            "todayXp": today_data.get("xp", 0),
            "todayCards": today_data.get("cards", 0),
            "todayCorrect": today_data.get("correct", 0),
            "combo": s["combo"],
            "bestEasyCombo": s["bestEasyCombo"],
            "dailyGoal": conf.get().get("dailyGoal", 50),
            "badges": self.badges(),
        }

    def get_week_stats(self) -> list:
        """Last 7 days: [{day, xp, cards, correct}]"""
        today = _today_int()
        dt = datetime.strptime(str(today), "%Y%m%d")
        days = []
        for i in range(6, -1, -1):
            d = dt - __import__("datetime").timedelta(days=i)
            day_int = int(d.strftime("%Y%m%d"))
            log = self.log(int(d.strftime("%Y")))
            data = log.get(day_int, {})
            days.append({
                "day": d.strftime("%m/%d"),
                "xp": data.get("xp", 0),
                "cards": data.get("cards", 0),
                "correct": data.get("correct", 0),
            })
        return days

    def get_month_stats(self) -> list:
        """Last 30 days: [{day, xp, cards}]"""
        import datetime as _dt
        today_int = _today_int()
        today_dt = _dt.datetime.strptime(str(today_int), "%Y%m%d")
        days = []
        for i in range(29, -1, -1):
            d = today_dt - _dt.timedelta(days=i)
            day_int = int(d.strftime("%Y%m%d"))
            log = self.log(int(d.strftime("%Y")))
            data = log.get(day_int, {})
            days.append({
                "day": d.strftime("%d"),
                "xp": data.get("xp", 0),
                "cards": data.get("cards", 0),
            })
        return days


def _days_between(day1: int, day2: int) -> int:
    d1 = datetime.strptime(str(day1), "%Y%m%d")
    d2 = datetime.strptime(str(day2), "%Y%m%d")
    return (d2 - d1).days


_store = None


def get_store() -> LevelStore:
    global _store
    if _store is None:
        _store = LevelStore()
    return _store


def flush() -> None:
    if _store is not None:
        _store.flush()


def invalidate() -> None:
    if _store is not None:
        _store.flush()
        _store.reset()


def install_hooks() -> None:
    def on_close(*_args):
        invalidate()

    def on_sync_start(*_args):
        flush()

    def on_drop(*_args):
        invalidate()

    for name, handler in (
        ("profile_will_close", on_close),
        ("sync_will_start", on_sync_start),
        ("sync_did_finish", on_drop),
        ("profile_did_open", on_drop),
    ):
        hook = getattr(gui_hooks, name, None)
        if hook is not None:
            hook.append(handler)
