# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the McCal Media Website project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help:

- Document why decisions were made
- Preserve context for future developers
- Track the evolution of the architecture
- Support onboarding of new team members

## Format

Each ADR follows this structure:

```markdown
# ADR-XXX: Title

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Date**: YYYY-MM-DD
**Deciders**: Name(s)

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult to do and any risks introduced?

## Alternatives Considered
What other options were evaluated and why were they rejected?
```

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-vite-migration.md) | Migration from Squarespace Widgets to Vite/React | Accepted | 2026-04 |

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
