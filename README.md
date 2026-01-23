# Payment Microservice

Payment microservice for GamingZone platform built with NestJS, Stripe, and Clean Architecture.

## Architecture

This service follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases, DTOs, and ports
- **Infrastructure Layer**: External integrations (Stripe, Database, Kafka)
- **Presentation Layer**: REST/GraphQL/gRPC controllers

## Tech Stack

- **Framework**: NestJS
- **Payment Gateway**: Stripe
- **Database**: PostgreSQL with Prisma ORM
- **Message Broker**: Kafka (planned)
- **Language**: TypeScript

## Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Stripe Account

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env.development`:

```bash
cp .env.example .env.development
```

Configure your environment variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/payment_db?schema=public"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3001/checkout/success
STRIPE_CANCEL_URL=http://localhost:3001/checkout/cancel
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

## Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Stripe Webhook Setup

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

This will provide you with a webhook secret to add to your `.env.development` file.

## API Endpoints

### Webhooks

- `POST /webhooks/stripe` - Stripe webhook endpoint

## Project Structure

```
src/
├── application/          # Use cases, DTOs, ports
├── domain/              # Entities, value objects, domain logic
├── infrastructure/      # External services, database, messaging
├── presentation/        # Controllers, resolvers, gateways
└── shared/             # Config, utils, constants
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/PAYMENT-XXX-description`
2. Make changes following clean architecture
3. Write tests (target: 90%+ coverage)
4. Commit with conventional commits
5. Push and create PR

## Conventional Commits

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring

## License

Proprietary - GamingZone Platform
