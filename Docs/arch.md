# HOMi — Complete System Architecture

> **Diagram-as-Code** using [Mermaid](https://mermaid.js.org/).  
> Render in GitHub, VS Code (Mermaid Preview), or any Mermaid-compatible viewer.

---

## 1. High-Level System Overview

```mermaid
graph TB
    subgraph CLIENT["🖥️  Client — React + Vite (port 5173)"]
        direction TB
        UI["Pages / Features"]
        SVC["Client Services\n(auth, property, contract,\nmessage, maintenance,\nadmin, payment, rental…)"]
        SOCK_C["socket.service.ts\n(Socket.IO client)"]
        UI --> SVC
        UI --> SOCK_C
    end

    subgraph SERVER["⚙️  Server — Express + Node.js (port 3000)"]
        direction TB
        MW["Middleware Layer\n(Helmet · CORS · Cookie-Parser)"]
        RL["Global Rate-Limiter\n(globalRateLimiter)"]
        ROUTES["API Routes\n/api/*"]
        CTRL["Controllers"]
        SVCS["Services (Business Logic)"]
        SOCK_S["Socket.IO Server\n(real-time events)"]
        MW --> RL --> ROUTES --> CTRL --> SVCS
    end

    subgraph INFRA["☁️  External Infrastructure"]
        DB[("🐘 PostgreSQL\n(Supabase)")]
        REDIS[("⚡ Upstash Redis\n(REST API)")]
        PAYMOB["💳 Paymob\n(Payment Gateway)"]
        GOOGLE["🔍 Google OAuth\n(UserInfo API)"]
        GEMINI["🤖 Google Gemini AI\n(Roommate Matching)"]
        SMTP["📧 Gmail SMTP\n(Email Service)"]
    end

    SVC -- "HTTP / REST (Axios)" --> MW
    SOCK_C -- "WebSocket" --> SOCK_S
    SOCK_S --- SVCS

    SVCS -- "Sequelize ORM" --> DB
    SVCS -- "Cache / Session / History" --> REDIS
    RL -- "@upstash/ratelimit" --> REDIS
    SVCS -- "Payment API" --> PAYMOB
    SVCS -- "Token verify" --> GOOGLE
    SVCS -- "AI inference" --> GEMINI
    SVCS -- "Nodemailer" --> SMTP
```

---

## 2. Backend Module Map

```mermaid
graph LR
    subgraph AUTH["Auth Module"]
        A1[register / login / logout]
        A2[Google OAuth]
        A3[WebAuthn / Passkeys]
        A4[Email Verification]
        A5[Password Reset]
        A6[JWT Access + Refresh Tokens]
    end

    subgraph PROP["Properties Module"]
        P1[CRUD listings]
        P2[Photo upload]
        P3[Search & Filter]
        P4[Amenities / House Rules]
    end

    subgraph RENTAL["Rental Requests Module"]
        R1[Submit request]
        R2[Landlord approve/decline]
        R3[Status tracking]
    end

    subgraph CONTRACT["Contracts Module"]
        C1[Generate contract]
        C2[Sign & activate]
        C3[Terminate]
        C4[PDF export]
    end

    subgraph PAY["Payment Methods"]
        PM1[Wallet top-up]
        PM2[Paymob integration]
        PM3[HMAC verification]
    end

    subgraph MSG["Messages Module"]
        M1[Start conversation]
        M2[Send / receive messages]
        M3[Read receipts]
        M4[Real-time via Socket.IO]
        M5[Chat history → Redis]
    end

    subgraph MAINT["Maintenance Module"]
        MA1[Create requests]
        MA2[Assign providers]
        MA3[Status updates]
    end

    subgraph NOTIFY["Notifications Module"]
        N1[In-app notifications]
        N2[Real-time push via Socket.IO]
    end

    subgraph ADMIN["Admin Module"]
        AD1[Property verification]
        AD2[User management / Banning]
        AD3[Activity logs]
        AD4[Support inbox]
    end

    subgraph ROOM["Roommate Matching"]
        RM1[Habit questionnaire]
        RM2[AI scoring via Gemini]
        RM3[Match results]
    end

    subgraph SAVED["Saved Properties"]
        S1[Save / unsave listings]
        S2[List saved]
    end
```

---

## 3. Redis Caching Layer (Upstash)

```mermaid
flowchart TD
    REQ["Incoming HTTP Request"]

    subgraph RL_MW["Rate-Limit Middleware"]
        RL_CHECK{"RATE_LIMIT\n_ENABLED?"}
        RL_CALL["checkRateLimit(ip)\n@upstash/ratelimit\nSlidingWindow(100 req / 600 s)"]
        RL_BLOCK["429 Too Many Requests"]
        RL_PASS["→ next()"]
    end

    subgraph CACHE_LAYER["Cache Service (cache.service.ts)"]
        C_GET["redis.get(key)"]
        C_HIT{Cache Hit?}
        C_MISS["→ PostgreSQL query"]
        C_STORE["redis.set(key, data, ex: TTL)"]
        C_RET["Return cached data"]
    end

    subgraph CHAT_LAYER["Chat History (chat-history.service.ts)"]
        CH_SAVE["redis.lpush(chat-history:userId, msg)\nredis.ltrim(..., 0, 99)"]
        CH_READ["redis.lrange(chat-history:userId, 0, 49)"]
    end

    subgraph SESSION_LAYER["Session (session.service.ts)"]
        SES_GET["redis.hget(s:sessionId, field)"]
        SES_SET["redis.hset(s:sessionId, data)\nredis.expire(..., 900)"]
    end

    UPSTASH[("⚡ Upstash Redis\nhttps://intent-doe-40832.upstash.io")]

    REQ --> RL_CHECK
    RL_CHECK -- "disabled (dev)" --> RL_PASS
    RL_CHECK -- "enabled (prod)" --> RL_CALL
    RL_CALL -- "limit exceeded" --> RL_BLOCK
    RL_CALL -- "ok" --> RL_PASS

    RL_PASS --> C_GET
    C_GET --> UPSTASH
    UPSTASH --> C_HIT
    C_HIT -- "yes" --> C_RET
    C_HIT -- "no" --> C_MISS --> C_STORE --> UPSTASH
    C_STORE --> C_RET

    CH_SAVE --> UPSTASH
    CH_READ --> UPSTASH

    SES_GET --> UPSTASH
    SES_SET --> UPSTASH
```

---

## 4. Authentication & Security Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Express
    participant AuthService
    participant JWT as JWT Util
    participant DB as PostgreSQL
    participant Email as Gmail SMTP
    participant Google as Google OAuth API

    Browser->>Express: POST /api/auth/login
    Express->>AuthService: login(identifier, password)
    AuthService->>DB: findUser(email/phone)
    DB-->>AuthService: User + Profile
    AuthService->>AuthService: bcrypt.compare(password)
    AuthService->>JWT: generateTokenPair(userId, email, role)
    JWT-->>AuthService: { accessToken (15m), refreshToken (7d) }
    AuthService-->>Browser: 200 OK + tokens + Set-Cookie(refreshToken)

    Browser->>Express: POST /api/auth/google
    Express->>AuthService: loginWithGoogle(googleToken)
    AuthService->>Google: GET /oauth2/v3/userinfo
    Google-->>AuthService: { email, name, picture }
    AuthService->>DB: findOrCreate(user)
    AuthService->>JWT: generateTokenPair(...)
    AuthService-->>Browser: 200 OK + tokens

    Browser->>Express: POST /api/auth/register
    Express->>AuthService: register(input)
    AuthService->>DB: create User + Profile (transaction)
    AuthService->>Email: sendVerificationEmail()
    AuthService-->>Browser: 201 Created

    Browser->>Express: POST /api/auth/refresh
    Express->>JWT: verifyRefreshToken(cookie)
    JWT-->>Express: new accessToken
    Express-->>Browser: 200 OK + new accessToken
```

---

## 5. Property Listing & Caching Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Cache as CacheService (Upstash)
    participant DB as PostgreSQL (Supabase)

    Client->>Server: GET /api/properties?city=Cairo&minPrice=5000
    Server->>Cache: get("properties:Cairo:5000:...")
    alt Cache HIT
        Cache-->>Server: cached JSON
        Server-->>Client: 200 OK (from cache)
    else Cache MISS
        Cache-->>Server: null
        Server->>DB: Sequelize query (findAndCountAll)
        DB-->>Server: rows + count
        Server->>Cache: set("properties:...", data, ex: 600)
        Server-->>Client: 200 OK (fresh from DB)
    end

    Client->>Server: POST /api/properties (create/update)
    Server->>DB: insert / update
    Server->>Cache: deleteByPattern("properties:*")
    Note over Cache: Invalidates all property list caches
    Server-->>Client: 201 / 200 OK
```

---

## 6. Real-Time Messaging Flow

```mermaid
sequenceDiagram
    participant TenantBrowser as Tenant Browser
    participant LandlordBrowser as Landlord Browser
    participant SocketIO as Socket.IO Server
    participant MessageService
    participant DB as PostgreSQL
    participant Redis as Upstash Redis

    TenantBrowser->>SocketIO: connect() + join("user:<id>")
    LandlordBrowser->>SocketIO: connect() + join("user:<id>")

    TenantBrowser->>MessageService: POST /api/messages/send
    MessageService->>DB: Message.create(...)
    MessageService->>Redis: lpush(chat-history:<tenantId>, msg)
    MessageService->>Redis: ltrim(..., 0, 99)
    MessageService->>SocketIO: emit("message:new", payload)
    SocketIO->>TenantBrowser: message:new
    SocketIO->>LandlordBrowser: conversation:updated

    LandlordBrowser->>MessageService: POST /api/messages/read
    MessageService->>DB: Message.update(read_at)
    MessageService->>SocketIO: emit("conversation:read")
    SocketIO->>TenantBrowser: conversation:read
```

---

## 7. Payment Flow (Paymob)

```mermaid
flowchart TD
    Client["Client Browser"]
    Server["Express Server"]
    DB[("PostgreSQL")]
    Paymob["Paymob API\naccept.paymob.com"]

    Client -- "POST /api/payment-methods/topup" --> Server
    Server -- "1. Authenticate (API Key)" --> Paymob
    Paymob -- "auth_token" --> Server
    Server -- "2. Create order" --> Paymob
    Paymob -- "order_id" --> Server
    Server -- "3. Get payment key\n(integrationId, amount, billing)" --> Paymob
    Paymob -- "payment_key" --> Server
    Server -- "4. Return iFrame URL" --> Client
    Client -- "5. Complete payment in iFrame" --> Paymob
    Paymob -- "6. HMAC-signed webhook callback" --> Server
    Server -- "7. Verify HMAC signature" --> Server
    Server -- "8. Update wallet balance" --> DB
    Server -- "9. Redirect to client" --> Client
```

---

## 8. Environment & Configuration Layering

```mermaid
graph TD
    ENV[".env file\n(secrets + base values)"]
    DEFAULT["config/default.ts\n(reads process.env)"]
    DEV["config/development.ts\n(Redis: OFF)"]
    PROD["config/production.ts\n(Redis: ON)"]
    SCHEMA["src/config/env.ts\n(Zod schema + deep-merge)"]
    APP["appConfig / env\n(exported, typed)"]

    ENV --> DEFAULT
    DEFAULT --> SCHEMA
    DEV -- "NODE_ENV=development" --> SCHEMA
    PROD -- "NODE_ENV=production" --> SCHEMA
    SCHEMA --> APP

    APP --> REDIS_CLIENT["redis.client.ts"]
    APP --> CACHE["cache.service.ts"]
    APP --> RL["upstash-ratelimit.service.ts"]
    APP --> SESSION["session.service.ts"]
    APP --> CHAT["chat-history.service.ts"]
```

---

## 9. Infrastructure & Deployment Overview

```mermaid
graph TB
    subgraph BROWSER["User Devices"]
        TENANT["Tenant Browser"]
        LANDLORD["Landlord Browser"]
        ADMIN_UI["Admin Browser"]
    end

    subgraph HOSTING["Hosting (Production)"]
        VITE_BUILD["React SPA\n(Static CDN / Vercel)"]
        NODE_SERVER["Node.js Express Server\n(Railway / Render)"]
    end

    subgraph DATA["Managed Data Stores"]
        SUPABASE[("Supabase\nPostgreSQL\n(aws-0-eu-west-1)")]
        UPSTASH[("Upstash Redis\n(intent-doe-40832)\nREST API")]
    end

    subgraph THIRD_PARTY["Third-Party APIs"]
        PAYMOB_API["Paymob Payment"]
        GOOGLE_API["Google OAuth"]
        GEMINI_API["Gemini AI"]
        GMAIL["Gmail SMTP"]
    end

    TENANT & LANDLORD & ADMIN_UI --> VITE_BUILD
    VITE_BUILD -- "HTTPS REST + WSS" --> NODE_SERVER

    NODE_SERVER -- "Sequelize / TLS" --> SUPABASE
    NODE_SERVER -- "HTTPS REST" --> UPSTASH
    NODE_SERVER --> PAYMOB_API & GOOGLE_API & GEMINI_API & GMAIL
```

---

## Key Architecture Decisions

| Concern | Solution |
|---|---|
| **Caching** | Upstash Redis `SET`/`GET` — property lists, popular items, query results |
| **Chat History** | Upstash `LPUSH`/`LTRIM` — last 100 messages per user, O(1) writes |
| **Rate Limiting** | `@upstash/ratelimit` Sliding Window — 100 req / 600 s per IP |
| **Sessions** | Upstash `HSET`/`HGET`/`EXPIRE` — 15-min sliding TTL hash store |
| **Real-time** | Socket.IO over `ws://` — conversation rooms + user rooms |
| **Auth** | JWT (15 m access + 7 d refresh in HttpOnly cookie) + Google OAuth + WebAuthn |
| **ORM** | Sequelize v6 with PostgreSQL via Supabase Session Pooler |
| **Dev vs Prod** | Redis **disabled** in `development.ts`, **enabled** in `production.ts` |
