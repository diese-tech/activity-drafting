# GodForge Drafts

A fast Discord Activity for competitive pick and ban drafting between captains in separate team voice channels.

## Why This Exists

GodForge already has a drafting system, but command-based drafting can be too slow for live competitive matches.

Captains must type commands for every pick and ban, wait for responses, and manually keep the draft moving. The existing flow can look clean, but it creates friction when teams are trying to get into a match quickly.

GodForge Drafts was built to solve that problem.

Instead of typing commands, two captains join a shared draft room and complete the draft through an interactive Discord Activity interface.

## The Core Problem

In competitive play, captains are usually not sitting in the same voice channel.

A typical match setup looks like this:

```txt
Team A Captain -> Team A voice channel
Team B Captain -> Team B voice channel
```

That separation is intentional. Each captain needs to talk privately with their own team while still drafting against the opposing captain.

The challenge is creating one fast shared draft room that both captains can use without requiring them to be in the same call.

## What GodForge Drafts Solves

GodForge Drafts is designed to:

- Replace slow command-by-command drafting with a fast UI.
- Let captains draft from separate team voice channels.
- Give admins and spectators a clear view of the draft.
- Keep pick and ban state synchronized in real time.
- Support competitive multi-game formats like Fearless draft.
- Reduce the time between "ready to draft" and "game launch".

## Solution

GodForge Drafts provides:

- Interactive pick and ban interface
- Real-time draft updates
- Shared draft rooms
- Captain assignment by Discord ID
- Captain-restricted draft actions
- Fearless draft support
- Multi-game draft tracking
- Spectator-friendly viewing

The activity is not meant to force both captains into the same Discord voice channel.

It is meant to act as the shared draft room between two separate team environments.

## Core Design Philosophy

The activity prioritizes:

1. Speed
2. Simplicity
3. Competitive integrity

If two captains can join a draft room and start picks and bans within 30 seconds, the activity is doing its job.

## Typical Match Flow

### Step 1

One captain creates a draft room.

### Step 2

Blue and Red captains are assigned by Discord ID.

### Step 3

The activity generates a draft room identifier or join link.

### Step 4

The room code or link is shared with the opposing captain.

### Step 5

The opposing captain joins the same draft room from their own team voice channel.

### Step 6

Picks and bans are completed through the activity interface.

### Step 7

Admins and spectators can observe the draft state.

### Step 8

The final draft is exported or recorded.

## Current Behavior

The current draft flow is room-based.

Entering a captain's Discord ID assigns that user as a captain, but it does not automatically pull them into the room or open the activity for them.

A captain must still join the draft room through the room code, join link, or activity flow.

## Fearless Draft Support

GodForge Drafts supports Fearless drafting formats.

Once a god has been played, it can be tracked and restricted from future games according to the configured ruleset.

This allows leagues to run multi-game Fearless sets without manually tracking eligibility.

## Current Draft Format

Each game contains:

- 10 bans total
- 10 picks total
- 20 draft actions

Draft order follows the configured competitive ruleset used by the league.

## Intended Users

### Captains

Create or join draft rooms and complete picks and bans quickly.

### League Administrators

Create, monitor, and manage draft sessions.

### Spectators

Follow drafts without interacting.

## Long-Term Vision

GodForge Drafts is part of the broader GodForge ecosystem, but it should also remain useful as a standalone competitive drafting tool.

The long-term goal is to provide a complete competitive drafting platform that can support GodForge leagues, independent communities, tournaments, and organized scrims.

Potential future features include:

- Draft history
- Match archives
- Draft analytics
- Shareable draft results
- Copyable join links
- Spectator mode
- Admin override tools
- Tournament integrations
- League management tools
- Team management tools
- Public spectator views

## Status

Active development.

Feedback, bug reports, and feature requests are welcome.

## License

All rights reserved unless otherwise specified by the repository owner.
