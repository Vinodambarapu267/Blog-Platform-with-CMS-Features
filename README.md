# MallivinTech - Blog Platform with CMS Features

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2025.0.1-blue.svg)](https://spring.io/projects/spring-cloud)
[![Build](https://img.shields.io/badge/Build-Maven-red.svg)](https://maven.apache.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-blue.svg)](https://www.mysql.com/)

Modern Spring Boot microservices platform for blog publishing, CMS category and tag management, user profiles, JWT authentication, comments, likes, email notifications, and event-driven service communication.

## Project Overview

Blog Platform with CMS Features is a backend-only microservices system for building a content publishing platform. It separates authentication, users, posts, comments, categories/tags, notifications, service discovery, and API routing into independent Spring Boot services.

The system supports:

- User registration, profile management, status management, and role assignment
- Authentication with JWT token generation and validation
- Role and permission based access control using Spring Security
- Blog post creation, updates, publishing workflow, deletion, and likes
- Category hierarchy management and tag resolution
- Comment creation, update, deletion, moderation, and post-linked retrieval
- Kafka-driven propagation of user, post, and comment events
- Redis-backed caching for common reads and updates
- Eureka service discovery and Spring Cloud Gateway routing

## Services

| Service | Purpose | Port | Application Name |
| --- | --- | ---: | --- |
| `Api-Gateway` | Public gateway and JWT validation filter | `8089` | `Api-Gateway` |
| `Eureka-server` | Service registry | `8761` | `Eureka-server` |
| `Auth-service` | Login, token generation, token validation, credential storage | `8081` | `Auth-service` |
| `User-Service` | User profile lifecycle and user events | `8082` | `users-service` |
| `Post-Service` | Blog post lifecycle, publishing status, likes | `8083` | `posts-service` |
| `Categories-&-Tag-service` | Category tree and tag management | `8084` | `CATEGORY-TAG-SERVICE` |
| `Comment-service` | Comments, moderation, post-comment cleanup | `8085` | `Comment-service` |
| `Notification-service` | Email notifications from Kafka events | `8088` | `Notification-service` |

## Feature Matrix

| Area | Features |
| --- | --- |
| Authentication | Login by email, token generation by username/password, JWT validation, BCrypt password checks |
| Authorization | Stateless Spring Security, method-level `@PreAuthorize`, role-to-permission mapping |
| User Management | Create user, update current profile, find by username/id, list users, delete user, update user status |
| Blog Posts | Create, update, delete, update status, read by id, like/unlike, like count |
| Publishing Workflow | `PUBLISHED`, `ARCHIVED`, `REVIEW`, `DRAFT`, `DELETED` post states with permission checks |
| CMS Categories | Create, update, delete, validate, list with paging and sorting, parent/child categories |
| Tags | Auto-resolve/create tags, list all tags, popular tags, delete tag |
| Comments | Add comment, update comment, delete comment, list by post, moderate status |
| Notifications | Kafka consumers for user, post, and comment events; SMTP email sending |
| Caching | Redis cache configuration across user, post, category, tag, comment, auth services |
| Service Discovery | Eureka server and Eureka clients |
| API Gateway | Route forwarding and secured-route JWT validation |
| Rate Limiting | Resilience4j rate limiter on selected user, post, category, tag, and comment operations |

## Technology Stack

| Layer | Technology |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 3.5.x |
| Cloud Runtime | Spring Cloud 2025.0.1 |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Web | Spring Web, Spring WebFlux in gateway |
| Security | Spring Security, JWT with `jjwt` 0.11.5 |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL |
| Cache | Redis via Spring Data Redis |
| Messaging | Apache Kafka via Spring Kafka |
| Inter-Service Calls | OpenFeign |
| Resilience | Resilience4j rate limiting / circuit breaker dependency |
| Email | Spring Boot Mail, Gmail SMTP configuration |
| Build Tool | Maven wrapper per service |
| Boilerplate Reduction | Lombok |
| Testing | Spring Boot Test, Spring Security Test, Spring Kafka Test |

## Architecture

```text
Blog-Platform-with-CMS-Features
├── Api-Gateway
│   └── filter, util
├── Eureka-server
│   └── service registry
├── Auth-service
│   └── config, controller, dto, entity, exception, kafka, repository, service
├── User-Service
│   └── config, controller, dto, entity, exception, kafka, repository, security, service, utility
├── Post-Service
│   └── controller, dto, entity, exception, feignclients, kafka, repository, security, service, utility
├── Categories-&-Tag-service
│   └── controller, dto, entity, exception, repository, security, service, utility
├── Comment-service
│   └── controller, dto, entity, exception, feignclients, kafka, repository, security, service, utility
├── Notification-service
│   └── dto, emailService, feignclients, kafka, utility
└── service-specific Maven projects
```

### Runtime Flow

```text
Client
  |
  v
Api-Gateway :8089
  |-- /api/v1/auth/**       -> Auth-service :8081
  |-- /api/v1/users/**      -> User-Service :8082
  |-- /api/v1/posts/**      -> Post-Service :8083
  |-- /api/v1/categories/** -> Categories-&-Tag-service :8084
  |-- /api/v1/tags/**       -> Categories-&-Tag-service :8084
  |-- /api/v1/comments/**   -> Comment-service :8085

Eureka-server :8761 registers and discovers services.
Kafka distributes user, post, and comment events.
Redis caches frequently accessed resources.
MySQL stores service data in blogs_db.
```

## Database Design

The services use MySQL with `spring.jpa.hibernate.ddl-auto=update`.

### UserCredential

Auth-service entity mapped to table `Users`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `Long` | Primary key |
| `username` | `String` | Login identity used for token subject |
| `email` | `String` | Login lookup for `/login` |
| `password` | `String` | BCrypt encoded when received from Kafka user events |
| `role` | `String` | Role claim written into JWT |
| `isActive` | `boolean` | Defaults to `true` |
| `is_email_verified` | `boolean` | Email verification flag |
| `createdAt` | `LocalDateTime` | Hibernate creation timestamp |
| `updatedAt` | `LocalDateTime` | Hibernate update timestamp |

### User

User-Service entity mapped to table `users_profiles`.

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | `Long` | Primary key |
| `username` | `String` | Unique lookup is enforced in service logic |
| `displayName` | `String` | Public display name |
| `bio` | `String` | Profile biography |
| `socialLinks` | `Map<String, String>` | Element collection in `user_social_links` |
| `status` | `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `BLOCKED` |
| `email` | `String` | User email |
| `password` | `String` | Published to auth service through Kafka |
| `createdAt` | `LocalDateTime` | Hibernate creation timestamp |
| `updatedAt` | `LocalDateTime` | Hibernate update timestamp |
| `role` | `UserRole` | Role used for auth event payloads |
| `postIds` | `List<Long>` | Element collection in `user_post_ids` |

Relationships:

- One user profile stores many post IDs through `user_post_ids`.
- User registration, update, and deletion publish Kafka events consumed by Auth-service.

### Post

Post-Service entity mapped to table `posts`.

| Field | Type | Notes |
| --- | --- | --- |
| `postId` | `Long` | Primary key |
| `title` | `String` | Required |
| `slug` | `String` | Required and unique |
| `content` | `String` | Required |
| `excerpt` | `String` | Optional |
| `status` | `PostStatus` | Defaults to `PUBLISHED` |
| `authorId` | `Long` | Required, resolved from user service |
| `categoryId` | `Long` | Optional |
| `viewCount` | `Integer` | View counter |
| `likeCount` | `Integer` | Like counter |
| `publishedAt` | `LocalDateTime` | Creation timestamp |
| `createdAt` | `LocalDateTime` | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Update timestamp |

### PostLike

Post-Service entity mapped to table `post_like`.

| Field | Type | Notes |
| --- | --- | --- |
| `likeId` | `Long` | Primary key |
| `post` | `Post` | Many-to-one relation to post |
| `userId` | `Long` | User who liked the post |
| `createdAt` | `Instant` | Creation timestamp |

Relationship:

- Many `PostLike` records belong to one `Post`.

### Category

Categories-&-Tag-service entity mapped to table `categories`.

| Field | Type | Notes |
| --- | --- | --- |
| `categoryId` | `Long` | Primary key |
| `categoryName` | `String` | Category name |
| `categorySlug` | `String` | Unique slug |
| `description` | `String` | Category description |
| `parent` | `Category` | Optional parent category |
| `children` | `List<Category>` | Child categories |

Relationship:

- One category can have one parent and many children.

### Tag

Categories-&-Tag-service entity mapped to table `tag`.

| Field | Type | Notes |
| --- | --- | --- |
| `tagId` | `Long` | Primary key |
| `tagName` | `String` | Unique tag name |
| `tagSlug` | `String` | Unique tag slug |
| `postCount` | `int` | Used for popular tag ordering |

### PostTagRef

Categories-&-Tag-service entity mapped to table `post_tag_refs`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `PostTagRefId` | Embedded id for post/tag reference |

### Comment

Comment-service entity mapped to table `comments`.

| Field | Type | Notes |
| --- | --- | --- |
| `commentId` | `Long` | Primary key |
| `postId` | `Long` | Associated post id |
| `authorId` | `Long` | Author user id |
| `parentId` | `Long` | Parent comment id |
| `content` | `String` | Required comment text |
| `status` | `CommentStatus` | Defaults to `PENDING` |
| `createdAt` | `Instant` | Creation timestamp |
| `updatedAt` | `Instant` | Update timestamp |

## API Documentation

All routes are available through the gateway on `http://localhost:8089` when the gateway and downstream services are running.

### Authentication

#### POST `/api/v1/auth/token`

Generates a JWT from username and password through Spring Security authentication.

Request:

```json
{
  "username": "vinod",
  "password": "password"
}
```

Response:

```text
jwt-token
```

#### POST `/api/v1/auth/login`

Logs in by email and password, then returns a JWT.

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```text
jwt-token
```

#### GET `/api/v1/auth/validate?token={token}`

Validates a JWT.

Response:

```text
Token is valid
```

### Users

#### POST `/api/v1/users/createuser`

Creates a user profile and publishes a `user-registered` Kafka event for credential creation.

Request:

```json
{
  "username": "vinod",
  "displayName": "Vinod",
  "bio": "Java developer",
  "socialLinks": {
    "github": "https://github.com/example"
  },
  "email": "user@example.com",
  "password": "password",
  "role": "AUTHOR"
}
```

#### PUT `/api/v1/users/updateuser/me`

Updates the currently authenticated user's profile.

Authorization: Bearer token required.

#### GET `/api/v1/users/findbyname/{username}`

Finds a user by username.

#### GET `/api/v1/users/{userId}`

Finds a user by id.

Required authority: `USER_READ`.

#### GET `/api/v1/users`

Returns all users.

#### PUT `/api/v1/users/updateStatus?username={username}&status={status}`

Updates a user's status.

Required authority: `USER_UPDATE`.

Supported status values:

- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `BLOCKED`

#### DELETE `/api/v1/users/deleteuser/{username}`

Deletes a user and publishes a `user-deleted` Kafka event.

Required authority: `USER_DELETE`.

### Posts

#### POST `/api/v1/posts/createpost`

Creates a post for the authenticated user.

Required authority: `POST_CREATE`.

Request:

```json
{
  "title": "My First Blog",
  "slug": "my-first-blog",
  "content": "Full article content",
  "excerpt": "Short summary",
  "categoryId": 1
}
```

#### PUT `/api/v1/posts/updatepost/{id}`

Updates a post.

Required authority: `POST_UPDATE_OWN`.

#### PUT `/api/v1/posts/updatestatus/{id}?status={status}`

Updates post workflow status.

Authorization: authenticated user required. Fine-grained permission checks run in service code.

Supported status values:

- `PUBLISHED`
- `ARCHIVED`
- `REVIEW`
- `DRAFT`
- `DELETED`

#### DELETE `/api/v1/posts/{id}`

Deletes a post.

Required authority: `POST_DELETE_ANY` or `POST_DELETE_OWN`.

#### POST `/api/v1/posts/{id}/like`

Toggles a like for the authenticated user.

Required authority: `POST_LIKE`.

#### GET `/api/v1/posts/{postId}`

Returns a post by id.

#### GET `/api/v1/posts/{id}/likes`

Returns total likes for a post.

Required authority: `POST_LIKES`.

### Categories

#### POST `/api/v1/categories/createcategory`

Creates a category.

Required authority: `CATEGORY_CREATE`.

Request:

```json
{
  "categoryName": "Spring Boot",
  "categorySlug": "spring-boot",
  "description": "Spring Boot articles",
  "parentId": null
}
```

#### PUT `/api/v1/categories/updateCategory/{categoryId}`

Updates a category.

Required authority: `CATEGORY_UPDATE`.

#### GET `/api/v1/categories?page={page}&sortBy={field}`

Returns paged categories sorted by the provided field.

#### GET `/api/v1/categories/{category-id}/validate`

Validates that a category exists.

Rate limited by `myRateLimiter`.

#### DELETE `/api/v1/categories/deletebyid/{id}`

Deletes a category.

Required authority: `CATEGORY_DELETE`.

### Tags

#### POST `/api/v1/tags/autocreate`

Normalizes, resolves, and creates missing tags.

Authorization: authenticated user required.

Request:

```json
{
  "names": ["spring", "java", "cms"]
}
```

Validation:

- `names` must not be null
- `names` must contain between 1 and 50 items

#### GET `/api/v1/tags`

Returns all tags.

#### GET `/api/v1/tags/popular?page=0&size=20`

Returns tags ordered by `postCount` descending.

#### DELETE `/api/v1/tags/delete/{tag-id}`

Deletes a tag.

Required authority: `TAG_DELETE`.

### Comments

#### POST `/api/v1/comments/posts/{postId}/comments`

Adds a comment to a post.

Required authority: `COMMENT_CREATE`.

Request:

```json
{
  "parentId": 0,
  "content": "Great article!"
}
```

#### GET `/api/v1/comments/posts/{postId}/comments`

Returns comments for a post.

#### PUT `/api/v1/comments/posts/{id}/comments`

Updates a comment.

Required authority: `COMMENT_UPDATE_ANY` or `COMMENT_UPDATE_OWN`.

#### PATCH `/api/v1/comments/{id}/status?status={status}`

Updates comment moderation status.

Required authority: `COMMENT_MODERATE`.

#### DELETE `/api/v1/comments/{id}`

Deletes a comment.

Required authority: `COMMENT_DELETE_ANY` or `COMMENT_DELETE_OWN`.

## Authentication and Security

### JWT Flow

```text
1. User profile is created in User-Service.
2. User-Service publishes a user-registered Kafka event.
3. Auth-service consumes the event and stores BCrypt-encoded credentials.
4. Client calls /api/v1/auth/login or /api/v1/auth/token.
5. Auth-service issues a JWT with:
   - subject: username
   - claim: role
   - expiration: 1 hour
6. Client sends Authorization: Bearer <token>.
7. Api-Gateway validates the token before forwarding secured routes.
8. Downstream services read username and role from JWT, expand role permissions, and enforce @PreAuthorize rules.
```

### Roles

Roles are defined in service-local `Role` enums:

- `SUPER_ADMIN`
- `ADMIN`
- `EDITOR`
- `AUTHOR`
- `READER`
- `GUEST`

### Permission Groups

Permission enums include:

- User permissions: `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `USER_MANAGE_ROLES`
- Role permissions: `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`
- Category permissions: `CATEGORY_READ`, `CATEGORY_CREATE`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`
- Tag permissions: `TAG_READ`, `TAG_CREATE`, `TAG_UPDATE`, `TAG_DELETE`
- Post permissions: `POST_READ`, `POST_READ_OWN_DRAFTS`, `POST_READ_ALL`, `POST_CREATE`, `POST_UPDATE_OWN`, `POST_UPDATE_ANY`, `POST_DELETE_OWN`, `POST_DELETE_ANY`, `POST_SUBMIT_DRAFT`, `POST_APPROVE`, `POST_REJECT`, `POST_PUBLISH`, `POST_UNPUBLISH`, `POST_LIKE`, `POST_LIKES`
- Comment permissions: `COMMENT_READ`, `COMMENT_CREATE`, `COMMENT_UPDATE_OWN`, `COMMENT_UPDATE_ANY`, `COMMENT_DELETE_OWN`, `COMMENT_DELETE_ANY`, `COMMENT_MODERATE`
- Profile and system permissions: `PROFILE_UPDATE_OWN`, `PROFILE_UPDATE_ANY`, `CONTENT_SEARCH`, `SYSTEM_CONFIG_READ`, `SYSTEM_CONFIG_UPDATE`, `SYSTEM_MAINTENANCE`

### Gateway Open Routes

The gateway treats selected GET routes as open when they match configured patterns:

- `/api/v1/auth/**`
- `/api/v1/users/*`
- `/api/v1/users/*/posts`
- `/api/v1/posts`
- `/api/v1/posts/*`
- `/api/v1/categories/**`
- `/api/v1/tags/**`
- `/api/v1/comments/posts/*/comments`

Other secured gateway routes require an `Authorization` header with a `Bearer` token.

## Kafka Events

| Producer | Topic | Consumer / Effect |
| --- | --- | --- |
| User-Service | `user-registered` | Auth-service creates credentials |
| User-Service | `user-updated` | Auth-service updates credentials |
| User-Service | `user-deleted` | User deletion event published |
| Post-Service | `post-published` | User-Service adds post id to author profile |
| Post-Service | `post-updated` | Notification-service can consume post update events |
| Post-Service | `post-deleted` | Comment-service deletes comments for deleted post |
| Comment-service | `comment-created` | Notification-service can consume comment creation events |
| Comment-service | `comment-moderated` | Notification-service can consume moderation events |

Kafka broker configuration points to:

```properties
spring.kafka.bootstrap-servers=localhost:9092
```

## Getting Started

### Prerequisites

- Java 21
- Maven or the included Maven wrappers
- MySQL running locally
- Redis running locally on port `6379`
- Kafka running locally on port `9092`
- Eureka-server running before client services

### Clone Repository

```bash
git clone https://github.com/Vinodambarapu267/Blog-Platform-with-CMS-Features.git
cd Blog-Platform-with-CMS-Features
```

### Create Database

The services are configured for one MySQL database:

```sql
CREATE DATABASE blogs_db;
```

### Configure Application Properties

Each service has its own `src/main/resources/application.properties`.

The repository currently contains local defaults such as:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blogs_db
spring.datasource.username=root
spring.datasource.password=vinod267
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.kafka.bootstrap-servers=localhost:9092
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

For production or shared development, move secrets and environment-specific values into environment variables or externalized configuration.

### Start Order

Start infrastructure first:

1. MySQL
2. Redis
3. Kafka
4. Eureka-server
5. Auth-service
6. User-Service
7. Post-Service
8. Categories-&-Tag-service
9. Comment-service
10. Notification-service
11. Api-Gateway

### Run Services Locally

Each service is an independent Maven project. From each service directory:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Example:

```bash
cd Eureka-server
mvnw.cmd spring-boot:run

cd ..\Auth-service
mvnw.cmd spring-boot:run
```

## Build for Production

Build each service from its directory:

```bash
mvnw.cmd clean package
```

The packaged JAR will be generated under the service's `target` directory.

## Testing

Each service includes a Spring Boot context test under `src/test/java`.

Run tests per service:

```bash
mvnw.cmd test
```

Test dependencies present in the repository include:

- `spring-boot-starter-test`
- `spring-security-test` in auth/user services
- `spring-kafka-test` in Kafka-enabled services
- `reactor-test` in the gateway

## API Testing

Swagger/OpenAPI configuration was not found in the repository.

Use the gateway base URL for manual testing:

```text
http://localhost:8089
```

Authorization header format:

```text
Authorization: Bearer <jwt-token>
```

## Error Handling

Services define global exception handlers for domain errors and security failures.

| Service | Error Types |
| --- | --- |
| Api-Gateway | Missing authorization header, invalid token, runtime errors |
| Auth-service | Invalid credentials, invalid token, invalid access, user not found |
| User-Service | User already exists, user not found, rate limit exceeded |
| Post-Service | Post already exists, post not found, user not found, rate limit exceeded |
| Categories-&-Tag-service | Slug exists/not found, category not found, tag not found, user not found, access denied |
| Comment-service | Comment not found, post not found, user not found |

Common response shapes include:

```json
{
  "timeStamp": "2026-01-01T10:00:00",
  "statusCode": 400,
  "message": "Post not found",
  "path": "uri=/api/v1/posts/99"
}
```

Security errors may return:

```json
{
  "statusCode": 403,
  "status": "FAILURE",
  "message": "You do not have permission to perform this action"
}
```

Rate limiting returns HTTP `429` with:

```text
Too many requests - please try again later.
```

## Configuration Reference

| Property | Used By | Description |
| --- | --- | --- |
| `server.port` | All runnable services | Service HTTP port |
| `spring.application.name` | All services | Service registration/application name |
| `spring.datasource.driver-class-name` | Auth, User, Post, Category/Tag, Comment | MySQL JDBC driver |
| `spring.datasource.url` | Auth, User, Post, Category/Tag, Comment | MySQL connection URL |
| `spring.datasource.username` | Auth, User, Post, Category/Tag, Comment | MySQL username |
| `spring.datasource.password` | Auth, User, Post, Category/Tag, Comment | MySQL password |
| `spring.jpa.hibernate.ddl-auto` | JPA services | Schema update strategy |
| `spring.jpa.properties.hibernate.dialect` | JPA services | MySQL Hibernate dialect |
| `spring.jpa.show-sql` | Auth, User, Post, Category/Tag | SQL logging |
| `spring.jackson.default-property-inclusion` | User, Post, Category/Tag, Comment | Exclude null JSON fields |
| `spring.cache.type` | Auth, User, Post, Category/Tag, Comment | Cache provider, configured as Redis |
| `spring.cache.cache-names` | Auth, User, Post, Category/Tag, Comment | Named Redis caches |
| `spring.data.redis.host` | Auth, User, Post, Category/Tag, Comment | Redis host |
| `spring.data.redis.port` | Auth, User, Post, Category/Tag, Comment | Redis port |
| `spring.kafka.bootstrap-servers` | User, Post, Comment, Notification | Kafka broker address |
| `spring.kafka.producer.key-serializer` | User, Post, Comment | Kafka producer key serializer |
| `spring.kafka.producer.value-serializer` | User, Post, Comment | Kafka producer JSON serializer |
| `spring.kafka.consumer.group-id` | Auth, User, Post, Comment | Kafka consumer group |
| `spring.kafka.consumer.auto-offset-reset` | Kafka consumers | Offset reset strategy |
| `spring.kafka.consumer.properties.spring.json.trusted.packages` | Kafka consumers | Trusted JSON packages |
| `eureka.client.service-url.defaultZone` | Gateway and client services | Eureka server URL |
| `eureka.client.register-with-eureka` | Eureka and client services | Registration toggle |
| `eureka.client.fetch-registry` | Eureka and client services | Registry fetch toggle |
| `resilience4j.ratelimiter.instances.myRateLimiter.limitForPeriod` | User, Post, Category/Tag, Comment | Rate limit request count |
| `resilience4j.ratelimiter.instances.myRateLimiter.limitRefreshPeriod` | User, Post, Category/Tag, Comment | Rate limit refresh window |
| `resilience4j.ratelimiter.instances.myRateLimiter.timeoutDuration` | User, Post, Category/Tag, Comment | Rate limiter wait timeout |
| `spring.cloud.gateway.routes[*]` | Api-Gateway | Route definitions |
| `spring.mail.host` | Notification-service | SMTP host |
| `spring.mail.port` | Notification-service | SMTP port |
| `spring.mail.username` | Notification-service | SMTP username |
| `spring.mail.password` | Notification-service | SMTP password |
| `spring.mail.properties.mail.smtp.*` | Notification-service | SMTP auth and TLS settings |

## Deployment Notes

Docker files were not found in the repository, so deployment is currently Maven/JAR based.

Recommended production hardening:

- Externalize database, Redis, Kafka, JWT secret, and SMTP credentials.
- Use a secrets manager or environment variables instead of committing secrets.
- Run MySQL, Redis, Kafka, and Eureka as managed services or separately supervised processes.
- Package every microservice with `mvnw.cmd clean package`.
- Start services in the same order documented above.
- Place the gateway behind the public load balancer and keep internal services private.

## Future Enhancements

- Add a root Maven parent or aggregator build for easier multi-service builds.
- Add Dockerfiles and Docker Compose for local infrastructure and service orchestration.
- Add OpenAPI/Swagger documentation for generated endpoint docs.
- Move hard-coded JWT and SMTP credentials into environment variables.
- Add integration tests for Kafka event flows and gateway route authentication.
- Add database migration tooling such as Flyway or Liquibase.
- Standardize package names and service naming conventions.
- Add centralized logging, tracing, and metrics dashboards.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Keep changes scoped to the relevant service.
4. Add or update tests for behavior changes.
5. Run `mvnw.cmd test` in the changed service.
6. Open a pull request with a clear description, testing notes, and any configuration changes.

## License

Copyright (c) 2026 Ambarapu Vinod.

Contact: ambarapuvinod@gmail.com

License terms can be added in a dedicated `LICENSE` file.
