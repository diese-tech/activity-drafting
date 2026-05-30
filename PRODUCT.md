# GodForge Drafts Product Specification

## Product Mission

Allow two captains to join a shared draft room and complete a competitive draft in under 30 seconds of setup time.

The activity exists to remove friction from competitive drafting.

## The Problem

Traditional command-based drafting is slow.

Every pick and ban requires:

- A command
- A bot response
- User confirmation
- Waiting for the next turn

This is functional, but inefficient during live competitive matches.

## Primary Use Case

A typical match looks like this:

```txt
Captain A -> Team A Voice Channel
Captain B -> Team B Voice Channel
```

Both captains need to:

- Communicate privately with their teams
- See the same draft state
- Complete picks and bans quickly

The draft room becomes the shared workspace between two otherwise separate team environments.

## Primary Users

### Captains

Primary user.

Everything should be optimized around the captain experience.

### League Administrators

Secondary user.

Admins need visibility and control but should not create friction for captains.

### Spectators

Tertiary user.

Spectators should be able to observe without impacting the draft.

## Success Criteria

The product is successful when:

- Two captains can join the same draft room.
- Both captains are recognized correctly.
- Picks and bans occur without confusion.
- The draft completes quickly.
- Teams can remain in separate voice channels.

Success statement:

"Two captains can join a draft room and start picks and bans in under 30 seconds."

## Core User Flow

```txt
Create Draft Room
        ↓
Assign Captains
        ↓
Share Room
        ↓
Both Captains Join
        ↓
Draft Begins
        ↓
Complete Picks/Bans
        ↓
Export Results
```

## Product Priorities

### Priority 1

Fast drafting.

### Priority 2

Simple room sharing.

### Priority 3

Reliable synchronization.

### Priority 4

Spectator support.

### Priority 5

Administrative tooling.

## Current Pain Points

- Room discovery is unclear.
- Captain joining flow needs improvement.
- Draft sharing should be easier.
- Users expect Discord IDs to automatically connect captains.

## Recommended Near-Term Features

### Room Join Links

Allow direct room joining through shared links.

### Copy Room Code

One-click room sharing.

### Waiting Room State

Clearly show when the opposing captain has not joined.

### Spectator Mode

Allow read-only observers.

### Server-Side Permission Enforcement

Ensure only the correct captain can act on their turn.

## Non-Goals (Current Phase)

These are intentionally not priorities right now:

- Full tournament platform
- Team management suite
- Voice replacement
- Matchmaking system
- Large-scale league administration

## Relationship To GodForge

GodForge Drafts is part of the larger GodForge ecosystem.

However, the activity should remain useful as a standalone drafting product.

A user should be able to understand and use the activity without needing the broader GodForge platform.

## Product Principle

Whenever a design decision is unclear, choose the option that makes it easier for two captains in separate voice channels to complete a draft quickly.
