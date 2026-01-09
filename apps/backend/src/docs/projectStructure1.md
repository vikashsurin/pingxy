backend/
├── src/
│   ├── features/           # Group by domain/feature
│   │   ├── auth/           # Auth-related (login, register)
│   │   │   ├── controller.ts  # Request handlers
│   │   │   ├── service.ts     # Business logic (e.g., JWT generation)
│   │   │   ├── model.ts       # DB schemas/queries (e.g., using Drizzle)
│   │   │   └── routes.ts      # Hono routes for this feature
│   │   ├── chat/           # Chat-specific (messages, rooms)
│   │   │   ├── controller.ts
│   │   │   ├── service.ts     # Logic for message broadcasting
│   │   │   ├── model.ts       # DB models for messages/users
│   │   │   └── routes.ts      # API routes + WebSocket handlers
│   │   └── ...             # Other features (e.g., users/)
│   ├── db/                 # Database setup
│   │   ├── index.ts        # DB connection pool (using pg)
│   │   ├── migrations/     # SQL migration scripts (use Drizzle or Knex)
│   │   └── schema.ts       # DB schema definitions
│   ├── middleware/         # Reusable middleware (e.g., auth guard, error handler)
│   │   └── auth.ts
│   ├── utils/              # Helpers (e.g., logger, validators)
│   │   └── logger.ts
│   ├── websocket/          # WebSocket-specific (if not embedded in features)
│   │   └── server.ts       # WS setup and event handlers
│   └── index.ts            # Main entry: Setup Hono app, routes, WS, DB
├── tests/                  # Unit/integration tests (use Bun's test runner)
│   ├── features/
│   │   └── auth.test.ts
│   └── setup.ts            # Test setup (e.g., mock DB)
├── .env                    # Backend-specific env (overrides root if needed)
├── bun.lockb               # Bun lockfile
├── package.json            # Dependencies: hono, pg, drizzle-orm, etc.
├── tsconfig.json           # TypeScript config
└── README.md               # Backend-specific docs
