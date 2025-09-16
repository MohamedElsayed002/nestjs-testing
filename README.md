## Testing Project (NestJS + MongoDB)

A minimal, production-ready NestJS REST API demonstrating authentication with JWT and basic User CRUD using Mongoose. Includes validation, Docker setup, and Jest tests.

### Features
- **Auth**: Register, login, and protected `me` route via JWT
- **Users**: Create, read, update, delete users (MongoDB + Mongoose)
- **Validation**: `class-validator` + global `ValidationPipe`
- **Config**: Environment variables via `@nestjs/config`
- **Testing**: Unit and e2e tests with Jest and Supertest
- **Docker**: `Dockerfile` and `docker-compose.yml` with MongoDB service

### Tech Stack
- **Runtime**: Node.js
- **Framework**: NestJS 11
- **Database**: MongoDB (Mongoose 8)
- **Auth**: Passport JWT, `@nestjs/jwt`
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Jest, Supertest, mongodb-memory-server
- **Lint/Format**: ESLint 9, Prettier 3

### Getting Started
1) Clone and install
```bash
npm install
```

2) Create `.env` in project root
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/testing-project
JWT_SECRET=change_this_secret
```

3) Run the app
```bash
# development
npm run start

# watch mode
npm run start:dev

# production build
npm run build && npm run start:prod
```

### Running with Docker
```bash
# build and start app + mongo
docker compose up --build

# stop
docker compose down
```
The compose file maps port `3000:3000` and starts a `mongo:6` container on `27017` with a named volume.

### NPM Scripts
- `start`, `start:dev`, `start:prod`
- `build`, `lint`, `format`
- `test`, `test:watch`, `test:cov`, `test:e2e`

### API Overview
Base URL: `http://localhost:${PORT}/`

- **Auth** (`/auth`)
  - `POST /auth/register` — create account
    - body: `{ email: string, password: string }`
  - `POST /auth/login` — returns `{ access_token }`
    - body: `{ email: string, password: string }`
  - `GET /auth/me` — current user (requires `Authorization: Bearer <token>`)

- **Users** (`/user`)
  - `POST /user` — create user
    - body: `{ name: string, age: number, tags?: string[] }`
  - `GET /user` — list users
  - `GET /user/:id` — get user by id
  - `PATCH /user/:id` — update user (partial)
  - `DELETE /user/:id` — delete user

### Data Models
- **Auth**
  - `email: string`
  - `password: string` (bcrypt-hashed)

- **User**
  - `name: string`
  - `age: number`
  - `tags?: string[]`

### Security Notes
- Configure `JWT_SECRET` via environment variables in production. The code currently includes `'123'` in `JwtStrategy` and in `AuthService.sign(...)`. For production, align both to use `process.env.JWT_SECRET`.
- Never commit real secrets to version control.

### Validation
- Global `ValidationPipe` is enabled in `main.ts`.
- DTOs enforce types: `CreateUserDto` for `auth` and `user` modules.

### Project Structure
```
src/
  app.module.ts
  main.ts
  auth/
    auth.controller.ts
    auth.service.ts
    auth.module.ts
    dto/create-user.dto.ts
    jwt-auth.guard.ts
    jwt.strategy.ts
    schema/auth.schema.ts
  user/
    user.controller.ts
    user.service.ts
    user.module.ts
    dto/{create-user.dto.ts, update-user.dto.ts}
    schema/user.schema.ts
```

### Testing
```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

### Environment Variables
- **PORT**: App port (default 3000)
- **MONGO_URI**: Mongo connection string
- **JWT_SECRET**: JWT signing secret


