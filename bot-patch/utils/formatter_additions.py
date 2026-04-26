# Append these two functions to the bottom of utils/formatter.py in smite2-bot.
# They depend on DRAFT_COLOR and _pad_list already defined in that file.

def format_board_from_snapshot(snapshot: dict) -> discord.Embed:
    """Living embed built from an Activity StateSnapshot dict."""
    draft_id = snapshot.get("draftId", "?")
    game_number = snapshot.get("gameNumber", 1)
    phase = snapshot.get("phase", "")
    blue_captain = snapshot.get("blueCaptain", {}).get("name", "Blue")
    red_captain = snapshot.get("redCaptain", {}).get("name", "Red")

    turn = snapshot.get("currentTurn")
    if turn:
        team = turn.get("team", "blue")
        action = turn.get("action", "")
        captain_name = blue_captain if team == "blue" else red_captain
        team_emoji = "🔵" if team == "blue" else "🔴"
        status = f"{team_emoji} **{captain_name}** — {action}"
    else:
        status = "✅ Game complete!"

    title = f"📋 Draft {draft_id} — Game {game_number} — {phase}"
    embed = discord.Embed(title=title, color=DRAFT_COLOR)

    bans = snapshot.get("bans", {"blue": [], "red": []})
    picks = snapshot.get("picks", {"blue": [], "red": []})

    blue_bans = _pad_list(bans.get("blue", []), 5)
    red_bans = _pad_list(bans.get("red", []), 5)
    embed.add_field(name="🔵 Blue Bans", value="\n".join(blue_bans), inline=True)
    embed.add_field(name="⠀", value="⠀", inline=True)
    embed.add_field(name="🔴 Red Bans", value="\n".join(red_bans), inline=True)

    blue_picks = _pad_list(picks.get("blue", []), 5)
    red_picks = _pad_list(picks.get("red", []), 5)
    embed.add_field(name="🔵 Blue Picks", value="\n".join(blue_picks), inline=True)
    embed.add_field(name="⠀", value="⠀", inline=True)
    embed.add_field(name="🔴 Red Picks", value="\n".join(red_picks), inline=True)

    fearless_pool = snapshot.get("fearlessPool", [])
    if fearless_pool:
        embed.add_field(name="🚫 Fearless Pool", value=", ".join(fearless_pool), inline=False)

    embed.add_field(name="⏳ Current Turn", value=status, inline=False)
    embed.set_footer(text=f"GodForge v1.6 • Draft {draft_id}")
    return embed


def format_draft_end_from_export(export: dict) -> discord.Embed:
    """Final summary embed built from an Activity DraftExport dict."""
    draft_id = export.get("draftId", "?")
    blue_captain = export.get("blueCaptain", {}).get("name", "Blue")
    red_captain = export.get("redCaptain", {}).get("name", "Red")

    embed = discord.Embed(
        title=f"🏁 Draft {draft_id} — Complete",
        color=0x2ECC71,
    )
    embed.add_field(
        name="Captains",
        value=f"🔵 {blue_captain}  vs  🔴 {red_captain}",
        inline=False,
    )

    for game_data in export.get("games", []):
        bp = ", ".join(game_data["picks"]["blue"]) or "None"
        rp = ", ".join(game_data["picks"]["red"]) or "None"
        bb = ", ".join(game_data["bans"]["blue"]) or "None"
        rb = ", ".join(game_data["bans"]["red"]) or "None"
        is_complete = (len(game_data["picks"]["blue"]) == 5
                       and len(game_data["picks"]["red"]) == 5)
        status = "✅" if is_complete else "⚠️ Incomplete"
        embed.add_field(
            name=f"Game {game_data['game_number']} {status}",
            value=(
                f"🔵 Picks: {bp}\n"
                f"🔴 Picks: {rp}\n"
                f"🔵 Bans: {bb}\n"
                f"🔴 Bans: {rb}"
            ),
            inline=False,
        )

    fearless_pool = export.get("fearlessPool", [])
    if fearless_pool:
        embed.add_field(name="🚫 Fearless Pool", value=", ".join(fearless_pool), inline=False)

    embed.set_footer(text=f"GodForge v1.6 • Draft {draft_id}")
    return embed
