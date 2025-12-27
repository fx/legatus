# GitHub Copilot Instructions

## PR Review Checklist (CRITICAL)
<!-- KEEP THIS SECTION UNDER 4000 CHARS - Copilot only reads first ~4000 -->

### Preact Conventions (Do Not Flag)

- **Use `class` not `className`**: Preact uses native HTML `class` attribute. Do not suggest changing to `className`.
- **preact/compat with React libraries**: This project uses preact/compat aliases for React library compatibility (TanStack Query, etc.). This is intentional and well-tested.

### TypeScript Project References

- **composite + emitDeclarationOnly**: When `tsconfig.json` uses `references`, the referenced tsconfig (e.g., `tsconfig.node.json`) requires `composite: true` with `emitDeclarationOnly: true` and `noEmit: false`. This is a TypeScript project references requirement, not an error.

### Code Style

- **Minimal comments**: Do not suggest adding explanatory comments for self-documenting code. We follow a minimal comments philosophy.
- **Semver ranges are intentional**: Using `^x.y.z` in package.json is intentional. Do not suggest pinning to exact resolved versions.
