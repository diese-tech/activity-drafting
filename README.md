# GodForge Drafts

A fast Discord Activity for competitive pick and ban drafting.

## Why This Exists

Traditional drafting through Discord bot commands works, but it is slow.

Captains must type commands for every pick and ban, wait for responses, and manually track draft state. During competitive matches this creates unnecessary friction and slows down the pre-game process.

GodForge Drafts was built to solve that problem.

Instead of typing commands, captains join a shared draft room and complete the entire draft through an interactive interface designed specifically for competitive team play.

## The Problem

Most organized leagues face a few common issues:

- Drafting through text commands is slow.
- Captains are often in separate team voice channels.
- Teams need a clear view of picks, bans, and draft progression.
- Admins need a reliable draft record.
- Spectators may want to follow the draft without participating.

The goal is to reduce the time between "ready to draft" and "game launch".

## Solution

GodForge Drafts provides:

- Interactive pick and ban interface
- Real-time draft updates
- Fearless draft support
- Multi-game draft tracking
- Shared draft rooms
- Captain-restricted actions
- Spectator-friendly viewing

The activity is designed to work regardless of where players are located within Discord.

Captains can remain in separate team voice channels while participating in the same draft room.

## Core Design Philosophy

The activity prioritizes:

1. Speed
2. Simplicity
3. Competitive integrity

If two captains can join a draft room and begin drafting within 30 seconds, the activity is doing its job.

## Typical Match Flow

### Step 1

A captain creates a draft room.

### Step 2

Blue and Red captains are assigned.

### Step 3

The activity generates a draft room identifier.

### Step 4

The opposing captain joins the draft room.

### Step 5

The draft begins.

### Step 6

Picks and bans are completed through the activity interface.

### Step 7

The final draft is exported and recorded.

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

Complete picks and bans quickly.

### League Administrators

Create, monitor, and manage draft sessions.

### Spectators

Follow drafts without interacting.

## Long-Term Vision

GodForge Drafts is part of the broader GodForge ecosystem.

The long-term goal is to provide a complete competitive drafting platform while remaining useful as a standalone Discord Activity.

Potential future features include:

- Draft history
- Match archives
- Draft analytics
- Shareable draft results
- Tournament integrations
- League management tools
- Team management tools
- Public spectator views

## Status

Active development.

Feedback, bug reports, and feature requests are welcome.

## License

All rights reserved unless otherwise specified by the repository owner.
