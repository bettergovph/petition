# Client-Side Types

This directory contains TypeScript types that are safe to use on the client-side (in React components, services, etc.).

## Important Separation

- **Client-side types**: Located in `src/types/` - can be imported by React components
- **Server-side types**: Located in `src/db/schemas/` - should ONLY be used in Cloudflare functions

## Why This Separation?

The database schemas and service files contain server-only code that should never be bundled with the client. By separating the types, we ensure:

1. **Bundle Size**: Client doesn't download server-only code
2. **Security**: Database implementation details stay server-side
3. **Performance**: Faster client-side builds
4. **Clarity**: Clear separation between client and server concerns

## File Organization

```
src/
├── types/           # Client-safe types
│   ├── api.ts       # API request/response types
│   └── README.md    # This file
└── db/              # Server-only database code
    ├── schemas/
    │   └── types.ts # Database types (server-only)
    └── service.ts   # Database service (server-only)
```

## Adding New Types

- **For client use**: Add to `src/types/api.ts`
- **For server use**: Add to `src/db/schemas/types.ts`
- **If needed by both**: Define in both files (they can be identical)

This duplication is intentional to maintain the client/server boundary.
