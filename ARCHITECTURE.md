# GodForge Drafts Architecture

## Overview

GodForge Drafts is a Discord Activity designed to provide a fast real-time drafting experience for competitive matches.

The architecture separates the user interface, networking layer, and draft state management into independent components.

## High-Level Architecture

```txt
Captain A
    |
Discord Activity Client
    |
WebSocket Connection
    |
Draft Server
    |
Draft Manager
    |
Draft State
    |
WebSocket Connection
    |
Discord Activity Client
    |
Captain B
```

## Components

### Discord Activity Client

Responsibilities:

- Render draft board
- Display picks and bans
- Show turn order
- Capture user interactions
- Display draft results

The client should never be considered the source of truth.

### WebSocket Layer

Responsibilities:

- Real-time synchronization
- Join room requests
- Draft actions
- State updates
- Spectator updates

The WebSocket layer acts as the transport mechanism between clients and the draft server.

### Draft Server

Responsibilities:

- Validate actions
- Manage draft rooms
- Track connected users
- Broadcast state changes

The server acts as the authoritative source of truth.

### Draft Manager

Responsibilities:

- Create draft rooms
- Track picks
- Track bans
- Track turn order
- Validate captain permissions
- Enforce draft rules

## Room Model

A draft room represents a single draft session.

```txt
Draft Room
├── Match ID
├── Blue Captain
├── Red Captain
├── Spectators
├── Draft State
└── Current Turn
```

The room model is intentionally independent from Discord voice channels.

Captains are expected to remain in separate team voice channels while sharing the same draft room.

## Captain Assignment

Captains are identified by Discord User IDs.

Only assigned captains should be allowed to perform draft actions.

Future server validation should enforce turn ownership and captain permissions.

## Spectator Model

Future versions should support:

- Read-only spectators
- League administrators
- Match observers

Spectators should never be able to modify draft state.

## Current Product Goal

The primary goal is not to build a full tournament platform.

The primary goal is to allow two captains to:

1. Join the same draft room
2. Remain in separate team voice channels
3. Complete picks and bans quickly
4. Start their match

Everything else is secondary to that workflow.

## Future Roadmap

Potential future architectural additions:

- Persistent storage
- Draft history
- Match archives
- Shareable links
- Spectator mode
- Tournament integrations
- GodForge ecosystem integration
- Admin tooling
- Draft analytics
