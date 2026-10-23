# Design direction

Owner: Jose Vicente Orts Romero. Answers given on 2026-10-23, transcribed as given. Lines marked *Constraint* are not style choices; they come from accessibility rules and apply on top of the direction.

Dial: ENERGY 1 / RHYTHM 1 / MOTION 1

## Purpose

A visitor should leave having done at least one of these:

1. Looked at the code (repositories and GitHub activity).
2. Understood the professional track record well enough to consider hiring.
3. Got in touch.

## Personality

Serious and sober.

## Focus

Work and code carry the site. Personal interests (mountains, cats, games) may stay, but they come after the professional content.

## Mood and motion

Calm. Content first, little decoration. Motion is limited to hover and focus transitions.

## Palette

- Neutral greys for surfaces and text.
- Yellow is the only accent. Teal is removed.
- *Constraint:* the accent must meet WCAG AA wherever it colours text. The current `yellow-500` on white measures 1.92:1, so light mode needs a darker shade for text or must keep yellow to non-text marks.

## Theme

Light and dark, with the current light / dark / system selector. Both modes must be complete.

## Typography

IBM Plex Sans for text and headings, IBM Plex Mono for code-related content (repository names, dates and similar). Reason: Plex was drawn for technical documentation, it is sober, and the mono gives code its own voice without imitating a terminal.

## Avoid

- Memes and joke imagery on public pages.
