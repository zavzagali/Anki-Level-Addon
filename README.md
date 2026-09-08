# Level

Level system add-on for [Anki](https://apps.ankiweb.net/). Earn XP, level up, maintain streaks, and collect badges as you study.

![Anki 23.10+](https://img.shields.io/badge/Anki-23.10+-blue)
![Version](https://img.shields.io/badge/version-0.2-green)

## Installation


1. Download the latest `.ankiaddon` release
2. Open Anki → Tools → Add-ons → Install from file
3. Select the downloaded file
4. Restart Anki

## Configuration

Open Anki → Tools → Add-ons → Level → Config

| Key | Default | Description |
|-----|---------|-------------|
| `showHud` | `true` | Show XP progress bar |
| `showStatsPanel` | `true` | Show stats panel on deck browser |
| `showLevelUpModal` | `true` | Show level up animation |
| `showBadges` | `true` | Show badge notifications |
| `dailyGoal` | `50` | Daily review target |
| `confettiEnabled` | `true` | Enable confetti on level up |
| `soundEnabled` | `true` | Enable sounds |
| `streakBonusMax` | `50` | Max streak bonus percentage |
| `comboThreshold` | `10` | Cards needed for combo steps |
| `speedBonusThreshold` | `5` | Seconds for speed bonus |


## XP Calculation
| Ease | Base XP |
|------|---------|
| Again | -8 |
| Hard | 0 |
| Good | 5 |
| Easy | 8 |


**Level formule:** `50 × level^1.5` XP required per level
