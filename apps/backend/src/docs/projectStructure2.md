src/
├── features/                     ← ← ← new heart of the project
│   ├── auth/
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   ├── queries.ts           (or data.ts / .repository.ts)
│   │   └── types.ts             (if needed)
│   ├── conversations/
│   │   ├── routes.ts
│   │   ├── service.ts           ← business rules + orchestration
│   │   ├── queries.ts           ← all drizzle queries related to conv
│   │   ├── participants/        ← optional subfeature
│   │   └── types.ts
│   ├── messages/
│   │   ├── routes.ts
│   │   ├── service.ts           ← very important: send, edit, delete, reactions...
│   │   ├── queries.ts
│   │   ├── receipts/            ← read receipts as subfeature
│   │   └── types.ts
│   ├── users/
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   ├── queries.ts
│   │   └── profile/             ← can grow
│   └── ... (typing, reactions, attachments, online-status, etc.)
│
├── core/                         ← things used by many features
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema.ts            ← keep one global schema
│   │   └── drizzle-factory.ts   (or migrations stuff)
│   ├── middlewares/             ← global + reusable
│   ├── socket/                  ← global WS setup + pub/sub
│   │   ├── index.ts
│   │   ├── pubsub.ts
│   │   └── state.ts
│   ├── utils/
│   └── types/                   ← very global types (if any)
│
├── routes/                       ← only glue / composition root
│   └── index.ts                 ← app.route('/auth', auth.routes)
│                                 app.route('/messages', messages.routes)
└── index.ts                     ← main entry
