# AureaCMS — Blog Platform with CMS Features

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2025.0.1-blue.svg)](https://spring.io/projects/spring-cloud)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-blue.svg)](https://www.mysql.com/)

A full-stack blog / CMS platform: a Spring Boot microservices backend (auth, users, posts, categories & tags, comments, notifications, gateway, service discovery) paired with a React + TypeScript dashboard and public blog frontend.

```
Blog-Platform-with-CMS-Features/
├── Api-Gateway/               ← Spring Cloud Gateway, JWT filter, routing       :8089
├── Eureka-server/             ← Service registry                                :8761
├── Auth-service/              ← Login, JWT issue/validate                       :8081
├── User-Service/              ← User profiles, roles, status                    :8082
├── Post-Service/              ← Posts, publishing workflow, likes               :8083
├── Categories-&-Tag-service/  ← Category tree, tag auto-create/resolve          :8084
├── Comment-service/           ← Comments, moderation                            :8085
├── Notification-service/      ← Kafka-driven email notifications                :8088
└── frontend/                  ← React 19 + Vite dashboard & public site         :5173
```

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Architecture](#architecture)
- [Backend](#backend)
  - [Services](#services)
  - [Technology Stack](#backend-technology-stack)
  - [Feature Matrix](#feature-matrix)
  - [API Routes](#api-routes)
  - [Database Design](#database-design)
  - [Configuration](#backend-configuration)
  - [Running the Backend](#running-the-backend)
- [Frontend](#frontend)
  - [Technology Stack](#frontend-technology-stack)
  - [Project Structure](#frontend-project-structure)
  - [Routes & Roles](#routes--roles)
  - [Auth Flow](#auth-flow)
  - [API Layer](#api-layer)
  - [Configuration](#frontend-configuration)
  - [Running the Frontend](#running-the-frontend)
- [Running the Full Stack Locally](#running-the-full-stack-locally)
- [Sample API Requests](#sample-api-requests)
- [Error Handling & Status Codes](#error-handling--status-codes)
- [Troubleshooting](#troubleshooting)
- [Known Quirks](#known-quirks)
- [Testing](#testing)
- [Deployment Notes](#deployment-notes)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Install and have running before you touch either half of the stack:

| Tool | Version used in this project | Check with |
| --- | --- | --- |
| Java (JDK) | 21 | `java -version` |
| Maven | not required globally — each service ships `mvnw`/`mvnw.cmd` | — |
| Node.js | 18+ (frontend uses Vite 8 / TS 6, which want a recent Node) | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL | 8.x | `mysql --version` |
| Redis | 6+ | `redis-cli ping` → `PONG` |
| Apache Kafka | 3.x (with Zookeeper, or KRaft mode) | `kafka-topics.sh --version` |

You don't need Docker to run this locally — every backend service also ships a `Dockerfile` and `docker-compose.yml` if you'd rather containerize instead of running `mvnw` by hand, but the instructions below assume the plain local-process route since that's what this project was actually developed and tested against.

Create the database once before starting any JPA-backed service (each service will create/update its own tables via `ddl-auto=update`, but the schema itself has to exist first):

```sql
CREATE DATABASE blogs_db;
```

## Quickstart

The fastest path from a clean checkout to a working login screen:

```bash
# 1. infra
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS blogs_db;"
redis-server &
# start Kafka + Zookeeper however you normally do (kafka-server-start.sh / KRaft)

# 2. backend — one terminal tab per service, in this order
cd Eureka-server               && .\mvnw spring-boot:run &
sleep 20   # give Eureka a head start before anything tries to register with it
cd Auth-service                 && infisical run -- .\mvnw spring-boot:run &
cd User-Service                  && infisical run -- .\mvnw spring-boot:run &
cd Post-Service                   && infisical run -- .\mvnw spring-boot:run &
cd "Categories-&-Tag-service"      && infisical run -- .\mvnw spring-boot:run &
cd Comment-service                  && infisical run -- .\mvnw spring-boot:run &
cd Notification-service              && .\mvnw spring-boot:run &
cd Api-Gateway                        && .\mvnw spring-boot:run &

# 3. sanity check — every service should show up here before you touch the frontend
open http://localhost:8761

# 4. frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open `http://localhost:5173`, hit **Register**, create an account, and log in. If step 3 doesn't show all 7 client services registered, don't bother starting the frontend yet — you'll just get "cannot reach the server" or 401s that have nothing to do with the frontend code.

On Windows, run the `.cmd` variant of each command (`mvnw.cmd spring-boot:run`) in separate PowerShell windows instead of backgrounding with `&`.

## Architecture

```text
Browser (React app, :5173)
  |
  v
Api-Gateway :8089  ──── validates JWT on protected routes ────
  |-- /api/v1/auth/**       -> Auth-service :8081
  |-- /api/v1/users/**      -> User-Service :8082
  |-- /api/v1/posts/**      -> Post-Service :8083
  |-- /api/v1/categories/** -> Categories-&-Tag-service :8084
  |-- /api/v1/tags/**       -> Categories-&-Tag-service :8084
  |-- /api/v1/comments/**   -> Comment-service :8085

Eureka-server :8761   registers and discovers every service above.
Kafka                 distributes user, post, and comment events to Notification-service.
Redis                 caches frequently read resources (posts, categories, tags, users).
MySQL                 backs every service's own schema in blogs_db.
```

The frontend never talks to individual services directly — every request goes through the gateway at `http://localhost:8089`, which forwards to the right service via Eureka and applies JWT validation on protected routes.

## Backend

### Services

| Service | Purpose | Port | Application Name |
| --- | --- | ---: | --- |
| `Api-Gateway` | Public gateway, route forwarding, JWT validation filter | `8089` | `Api-Gateway` |
| `Eureka-server` | Service registry | `8761` | `Eureka-server` |
| `Auth-service` | Login, token generation, token validation, credential storage | `8081` | `Auth-service` |
| `User-Service` | User profile lifecycle and user events | `8082` | `users-service` |
| `Post-Service` | Blog post lifecycle, publishing status, likes | `8083` | `posts-service` |
| `Categories-&-Tag-service` | Category tree and tag management | `8084` | `CATEGORY-TAG-SERVICE` |
| `Comment-service` | Comments, moderation, post-comment cleanup | `8085` | `Comment-service` |
| `Notification-service` | Email notifications from Kafka events | `8088` | `Notification-service` |

### Backend Technology Stack

| Layer | Technology |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 3.5.x |
| Cloud Runtime | Spring Cloud 2025.0.1 |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Security | Spring Security, JWT (`jjwt` 0.11.5) |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL |
| Cache | Redis via Spring Data Redis |
| Messaging | Apache Kafka via Spring Kafka |
| Inter-Service Calls | OpenFeign |
| Resilience | Resilience4j rate limiting |
| Email | Spring Boot Mail, Gmail SMTP |
| Build Tool | Maven wrapper per service |
| Boilerplate Reduction | Lombok |

### Feature Matrix

| Area | Features |
| --- | --- |
| Authentication | Login by email, token generation, JWT validation, BCrypt password checks |
| Authorization | Stateless Spring Security, method-level `@PreAuthorize`, role-to-permission mapping |
| User Management | Create user, update current profile, find by username/id, list users, delete user, update status |
| Blog Posts | Create, update, delete, update status, read by id, list all posts, list by author, like/unlike, like count |
| Publishing Workflow | `PUBLISHED`, `ARCHIVED`, `REVIEW`, `DRAFT`, `DELETED` post states with permission checks |
| CMS Categories | Create, update, delete, validate, list with paging and sorting, parent/child categories |
| Tags | Auto-resolve/create tags, list all tags, popular tags, delete tag |
| Comments | Add comment, update comment, delete comment, list by post, moderate status |
| Notifications | Kafka consumers for user, post, and comment events; SMTP email sending |
| Caching | Redis cache configuration across user, post, category, tag, comment, auth services |
| Service Discovery | Eureka server and Eureka clients |
| Rate Limiting | Resilience4j rate limiter on user, post, category, tag, and comment operations |

### API Routes

All routes below are reached through the gateway at `http://localhost:8089`. Routes marked **open** don't require a JWT.

| Method | Path | Service | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Auth-service | Login by email + password, returns JWT |
| POST | `/api/v1/auth/token` | Auth-service | Token generation by username/password |
| GET | `/api/v1/auth/validate` | Auth-service | Token validation |
| POST | `/api/v1/users/createuser` | User-Service | **Open** — registration |
| PUT | `/api/v1/users/me` | User-Service | Update current profile |
| GET | `/api/v1/users/findbyname/{username}` | User-Service | |
| GET | `/api/v1/users/{userId}` | User-Service | |
| GET | `/api/v1/users` | User-Service | List all users |
| PATCH | `/api/v1/users/{userId}/status` | User-Service | Update user status |
| DELETE | `/api/v1/users/{userId}` | User-Service | |
| GET | `/api/v1/posts` | Post-Service | **Open** — every post on the platform |
| GET | `/api/v1/posts/{postId}` | Post-Service | **Open** — single post |
| GET | `/api/v1/posts/findpostsbyuserid/{userId}` | Post-Service | Posts by author |
| POST | `/api/v1/posts` | Post-Service | Create post |
| PUT | `/api/v1/posts/{postId}` | Post-Service | Update post |
| PATCH | `/api/v1/posts/{postId}/status` | Post-Service | Publish/archive/review/draft |
| DELETE | `/api/v1/posts/{postId}` | Post-Service | |
| POST | `/api/v1/posts/{postId}/like` | Post-Service | Toggle like |
| GET | `/api/v1/posts/{postId}/likes` | Post-Service | Like count |
| GET | `/api/v1/categories` | Categories-&-Tag-service | List, paged/sorted |
| POST | `/api/v1/categories` | Categories-&-Tag-service | Create |
| PUT | `/api/v1/categories/{id}` | Categories-&-Tag-service | Update |
| DELETE | `/api/v1/categories/{id}` | Categories-&-Tag-service | |
| GET | `/api/v1/tags` | Categories-&-Tag-service | List all tags |
| GET | `/api/v1/tags/popular` | Categories-&-Tag-service | Popular tags |
| POST | `/api/v1/tags` | Categories-&-Tag-service | Auto-create/resolve tags |
| DELETE | `/api/v1/tags/{id}` | Categories-&-Tag-service | |
| GET | `/api/v1/comments/posts/{postId}/comments` | Comment-service | **Open** — comments on a post |
| POST | `/api/v1/comments` | Comment-service | Add comment |
| PUT | `/api/v1/comments/{id}` | Comment-service | Update comment |
| PATCH | `/api/v1/comments/{id}/status` | Comment-service | Moderate |
| DELETE | `/api/v1/comments/{id}` | Comment-service | |

Every non-open response is wrapped as:

```json
{ "statuscode": 200, "status": "SUCCESS", "message": "...", "data": {}, "list": [] }
```

`data` holds a single object; `list` holds arrays — the two are mutually exclusive per response depending on which constructor overload the controller happens to call.

### Database Design

MySQL, `spring.jpa.hibernate.ddl-auto=update`. Key entities:

| Entity | Service | Table | Notes |
| --- | --- | --- | --- |
| `UserCredential` | Auth-service | `Users` | Login identity, BCrypt password, role claim for JWT |
| `User` | User-Service | `users_profiles` | Display name, bio, social links, status, role, post IDs |
| `Post` | Post-Service | `posts` | Title, slug, content, status, author/category IDs, view/like counts |
| `PostLike` | Post-Service | `post_like` | Many-to-one to `Post` |
| `Category` | Categories-&-Tag-service | `categories` | Parent/child hierarchy |
| `Tag` | Categories-&-Tag-service | `tags` | Auto-resolved on write, usage count |
| `Comment` | Comment-service | `comments` | Linked to post ID, moderation status |

User, post, and comment writes publish Kafka events that Auth-service and Notification-service consume (credential sync and email dispatch respectively).

### Backend Configuration

Each service's `src/main/resources/application.properties` needs (values are examples):

```properties
server.port=<service-port>
spring.datasource.url=jdbc:mysql://localhost:3306/blogs_db
spring.datasource.username=root
spring.datasource.password=<your-password>
spring.jpa.hibernate.ddl-auto=update
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.kafka.bootstrap-servers=localhost:9092
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
jwt.secret.key=<JWT_SECRET_KEY>
resilience4j.ratelimiter.instances.myRateLimiter.limitForPeriod=30
resilience4j.ratelimiter.instances.myRateLimiter.limitRefreshPeriod=10s
resilience4j.ratelimiter.instances.myRateLimiter.timeoutDuration=0s
```

Notification-service additionally needs `spring.mail.*` SMTP settings. For production, move all of the above into environment variables rather than committing them.

> **Rate limiter note:** `limitForPeriod` is shared across every caller of that service instance, not per-user, and `timeoutDuration=0s` means anything over the limit is rejected instantly rather than queued. `30` per 10s comfortably covers normal single-developer/browser usage; raise it further if you're load-testing or running multiple concurrent users.

### Running the Backend

Start infrastructure first, then services in this order:

1. MySQL
2. Redis
3. Kafka
4. `Eureka-server`
5. `Auth-service`
6. `User-Service`
7. `Post-Service`
8. `Categories-&-Tag-service`
9. `Comment-service`
10. `Notification-service`
11. `Api-Gateway`

Each service is an independent Maven project:

```bash
cd Eureka-server
.\mvnw spring-boot:run      # mvnw.cmd on Windows

cd ../Auth-service
nfisical run -- .\mvnw spring-boot:run
# ...repeat for each remaining service
```

Build a deployable JAR per service:

```bash
.\mvnw clean package
```

## Frontend

### Frontend Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Server State | TanStack React Query 5 |
| Forms & Validation | React Hook Form + Zod |
| HTTP Client | Axios |
| UI Primitives | Radix UI |
| Icons | lucide-react |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |
| Animation | Framer Motion |
| Toasts | react-hot-toast |
| Lint | oxlint |

### Frontend Project Structure

```text
frontend/
├── src/
│   ├── api/            # axios calls per domain: auth, posts, comments, taxonomy, users, client.ts
│   ├── components/
│   │   ├── auth/        # ProtectedRoute, auth-related UI
│   │   ├── editor/       # post editor components
│   │   ├── layout/       # dashboard shell, header, sidebar
│   │   └── ui/            # Radix-based design system primitives
│   ├── constants/       # API base URL, routes map, role/status label maps
│   ├── contexts/        # auth-context (JWT/session), theme-context
│   ├── hooks/           # React Query hooks: use-posts, use-comments, use-taxonomy, use-users
│   ├── lib/             # utils, zod validation schemas
│   ├── pages/
│   │   ├── auth/         # login, register
│   │   ├── public/        # landing page, single-post view
│   │   └── dashboard/     # posts, taxonomy (categories/tags), comments, users, profile, settings
│   ├── types/           # shared TS types, ResponseMessage<T> wrapper type
│   ├── App.tsx           # route table
│   └── main.tsx           # entry point
├── .env.example
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

### Routes & Roles

| Route | Page | Access |
| --- | --- | --- |
| `/` | Landing page | Public |
| `/posts/:id` | Single post view | Public (backend post/comment reads are open endpoints) |
| `/login`, `/register` | Auth pages | Public |
| `/dashboard` | Dashboard home | Authenticated |
| `/dashboard/posts`, `/dashboard/posts/new`, `/dashboard/posts/:id/edit` | Post management & editor | Authenticated |
| `/dashboard/categories` | Category management | Authenticated |
| `/dashboard/tags` | Tag management | Authenticated (create/delete gated to `SUPER_ADMIN` / `ADMIN`) |
| `/dashboard/comments` | Comment moderation | Authenticated |
| `/dashboard/users` | User management | Authenticated |
| `/dashboard/profile`, `/dashboard/settings` | Account pages | Authenticated |

Roles come from the JWT `role` claim and map to `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `READER`, `GUEST` (see `ROLE_LABELS` in `src/constants/index.ts`). Dashboard routes are wrapped in `<ProtectedRoute>`; individual actions inside a page (e.g. tag creation/deletion) are further gated by role.

### Auth Flow

1. `authApi.login` / `authApi.token` hits Auth-service through the gateway and returns a JWT.
2. The token is stored in `localStorage` under `blogcms.token` and decoded client-side (`sub` → username, `role` claim, `exp`/`iat`) to build the in-memory `SessionUser` — no server round trip needed to know who's logged in.
3. `apiClient` (axios) attaches `Authorization: Bearer <token>` to every request via a request interceptor.
4. A response interceptor watches for `401` — clears the stored token and fires an `auth:logout` window event that `AuthProvider` listens for, redirecting through `ProtectedRoute` back to `/login`.
5. There is no refresh-token endpoint on the backend; tokens are valid for 1 hour with no rotation, so sessions expire and require re-login.

### API Layer

`src/api/client.ts` centralizes the axios instance, base URL, JWT header injection, and error-message normalization (401 → session expired, 403 → permission denied, 429 → rate limited, network/timeout → gateway-down messaging). Each domain file (`posts.ts`, `comments.ts`, `taxonomy.ts`, `users.ts`, `auth.ts`) wraps the matching backend controller and unwraps the backend's `{ data }` / `{ list }` response shape into plain TypeScript values, since the backend's `ResponseMessage` constructor overload resolution puts arrays in `list` rather than `data`. Each function maps 1:1 to a backend endpoint — no endpoints are called that don't exist on a controller.

### Frontend Configuration

`.env` (copy from `.env.example`):

```bash
# Base URL of the Api-Gateway — everything routes through this.
VITE_API_BASE_URL=http://localhost:8089
```

The gateway's CORS config (`Api-Gateway/application.properties`) whitelists `http://localhost:5173` and `http://localhost:3000` by default — update `allowedOriginPatterns` there if you serve the frontend from a different origin.

### Running the Frontend

```bash
cd frontend
npm install
cp .env.example .env    # adjust VITE_API_BASE_URL if needed
npm run dev              # http://localhost:5173
```

Other scripts:

```bash
npm run build      # tsc -b && vite build
npm run preview     # preview the production build
npm run lint          # oxlint
```

## Running the Full Stack Locally

1. Start MySQL, Redis, and Kafka.
2. Start the backend services in the order listed in [Running the Backend](#running-the-backend), ending with `Api-Gateway` on `:8089`.
3. Confirm all services registered with Eureka at `http://localhost:8761`.
4. `cd frontend && npm install && npm run dev`.
5. Open `http://localhost:5173`, register a user (`POST /api/v1/users/createuser` is open), then log in.

## Sample API Requests

Everything goes through the gateway on `:8089`. A few real request/response pairs to sanity-check your setup without opening the frontend at all:

**Register a user** (open endpoint, no token needed):

```bash
curl -X POST http://localhost:8089/api/v1/users/createuser \
  -H "Content-Type: application/json" \
  -d '{
        "username": "vinod",
        "displayName": "Vinod Ambarapu",
        "email": "vinod@example.com",
        "password": "ChangeMe123!",
        "role": "AUTHOR"
      }'
```

**Log in:**

```bash
curl -X POST http://localhost:8089/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "vinod@example.com", "password": "ChangeMe123!" }'
```

Response (trimmed):

```json
{
  "statuscode": 200,
  "status": "SUCCESS",
  "message": "Login successful",
  "data": { "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aW5vZCIsInJvbGUiOiJBVVRIT1IiLCJpYXQiOjE3NTIzNDAwMDAsImV4cCI6MTc1MjM0MzYwMH0.xxxxx" }
}
```

**Create a post** (needs the token from above):

```bash
curl -X POST http://localhost:8089/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
        "title": "Hello, AureaCMS",
        "slug": "hello-aureacms",
        "content": "First post through the API.",
        "authorId": 1
      }'
```

**List every post** (open endpoint — this is the one that was originally missing from the frontend's API layer, see [API Layer](#api-layer)):

```bash
curl http://localhost:8089/api/v1/posts
```

If any of these hang or return `ECONNREFUSED`, the gateway or the target service isn't up yet — check Eureka (`http://localhost:8761`) before assuming anything is wrong with your request.

## Error Handling & Status Codes

| Status | Meaning | Where it comes from |
| --- | --- | --- |
| `400` | Validation / domain error (e.g. post not found, slug exists) | Service-level `GlobalExceptionHandler` |
| `401` | Missing/expired/invalid JWT | Gateway `AuthenticationFilter` or downstream `JwtAuthenticationFilter` |
| `403` | Authenticated but not permitted | `@PreAuthorize` checks |
| `429` | Rate limit exceeded (`myRateLimiter`) | Resilience4j, per service instance |

Typical error body:

```json
{ "timeStamp": "2026-01-01T10:00:00", "statusCode": 400, "message": "Post not found", "path": "uri=/api/v1/posts/99" }
```

The frontend's axios response interceptor turns all of these into a single human-readable `Error` message shown via toast — see [API Layer](#api-layer).

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| "Cannot reach the server" toast | `Api-Gateway` not running, or `VITE_API_BASE_URL` wrong | Confirm gateway is up on `:8089`, check `.env` |
| "An error occurred during login" | Auth-service down, wrong credentials, or Eureka hasn't registered it yet | Check Auth-service logs; confirm it's registered in Eureka |
| "Too many requests — please try again later" (429) | Resilience4j `myRateLimiter` cap hit | Raise `limitForPeriod` in the relevant service's `application.properties` and restart it (see [Backend Configuration](#backend-configuration)) |
| CORS error in browser console | Frontend origin not in gateway's `allowedOriginPatterns` | Add your origin to `Api-Gateway/application.properties` |
| 401 right after login / immediate logout | Clock skew between client and Auth-service (JWT `exp` check) or wrong `jwt.secret.key` across services | Sync system clocks; ensure every service shares the same `jwt.secret.key` |
| `TS2339: Property 'X' does not exist on type ... post-view-page` (or similar for any lazy-loaded page) | The named export in the page file doesn't match what `App.tsx`'s `lazy(() => import(...).then((m) => ({ default: m.X })))` expects — usually from a rename or a switch to `export default` | Open the page file and confirm it uses `export function X()` matching the name referenced in `App.tsx`, or update the `App.tsx` import to match whatever it's actually called |
| `npm install` / `npm run dev` fails with path-related errors on Windows | Project checked out under a path with spaces (e.g. `OneDrive\Desktop\my folder\...`) | Works most of the time, but if you hit path-length or quoting issues, move the checkout to a short, space-free path like `C:\dev\blog-platform` |
| Frontend builds locally but 404s on every API call once deployed | `VITE_API_BASE_URL` was baked in at build time pointing at `localhost` | Set the env var before running `npm run build` for the target environment — Vite inlines `import.meta.env.*` at build time, not at runtime |

## Known Quirks

Things about this codebase that look like bugs on first read but are actually deliberate/known:

- **Backend responses split between `data` and `list`.** `ResponseMessage` has overloaded constructors — pass a single object and it lands in `data`, pass a `List<?>` and Java picks the list overload, landing it in `list` instead. Every frontend `api/*.ts` file unwraps whichever one applies rather than assuming `data` always has the payload.
- **The rate limiter is per service instance, not per user.** `resilience4j.ratelimiter.instances.myRateLimiter` is a shared bucket — one busy browser tab can 429 every other user hitting that service in the same window. See [Backend Configuration](#backend-configuration) if the default feels too tight for your usage pattern.
- **No refresh tokens.** JWTs are valid for exactly 1 hour from `iat`, with no rotation endpoint on Auth-service. Long editing sessions can get logged out mid-task — this is current backend behavior, not a frontend timeout bug.
- **`GET /api/v1/posts` is public/open**, unlike almost every other posts endpoint, which requires a JWT. It's explicitly whitelisted in the gateway's `RouteValidator` alongside `GET /api/v1/posts/{id}`.
- **`src/api/users.ts.tmp` in the frontend is dead code** — an identical leftover copy of `users.ts` that nothing imports. Safe to delete; kept out of this cleanup only because it wasn't part of the requested scope.


## Deployment Notes

- Dockerfile + `docker-compose.yml` exist per backend service — review and adapt them for your infrastructure (registry, secrets, networking) before using them as-is.
- Externalize database, Redis, Kafka, JWT secret, and SMTP credentials via environment variables — none of these should be committed.
- Put the gateway behind a public load balancer; keep every other backend service private/internal.
- Build the frontend for production with `npm run build` and serve the `dist/` output from a static host or CDN, pointing `VITE_API_BASE_URL` at your production gateway URL.

## Future Enhancements

- Add a root Maven parent/aggregator build for the backend.
- Add OpenAPI/Swagger documentation.
- Add a refresh-token flow so sessions outlive the current 1-hour JWT.
- Add database migration tooling (Flyway/Liquibase).
- Add end-to-end tests spanning frontend + gateway + services.
- Centralized logging, tracing, and metrics.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Keep backend changes scoped to the relevant service, and frontend changes scoped to `frontend/`.
4. Add or update tests for behavior changes.
5. Run `./mvnw test` (changed backend services) and `npx tsc -b --noEmit` (frontend) before opening a PR.
6. Open a pull request with a clear description, testing notes, and any configuration changes.

## License

Copyright (c) 2026 Ambarapu Vinod.

Contact: ambarapuvinod@gmail.com

License terms can be added in a dedicated `LICENSE` file.
