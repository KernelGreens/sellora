# Sellora Workflow Checklist

Use this file to track what has been completed, what is currently in progress, and what should happen next.

## Status Key

- `[x]` Done
- `[-]` In progress
- `[ ]` Not started
- `[!]` Blocked or needs decision

## Product Blueprint Tracker

### Phase 1: Foundation

- `[x]` Auth system
- `[x]` User accounts
- `[x]` Database setup with Prisma + PostgreSQL

### Phase 2: Store Setup

- `[x]` Shop onboarding
- `[x]` Product onboarding
- `[x]` Public storefront at `/store/[slug]`
- `[x]` Onboarding enforcement flow

### Phase 3: Conversion Layer

- `[x]` WhatsApp ordering baseline
- `[x]` Quantity selection per product
- `[x]` Improve order UX
- `[x]` Stabilize order flow
- `[x]` Single-product checkout handoff before WhatsApp
- `[x]` Structured WhatsApp message with order reference

### Phase 4: Order Management

- `[x]` Prisma order schema foundation
- `[x]` Storefront order creation API
- `[x]` Persist order before WhatsApp handoff
- `[ ]` Seller order dashboard list
- `[ ]` Seller order detail page
- `[ ]` Seller status update flow
- `[ ]` Order history UX

### Phase 5: Checkout Evolution

- `[ ]` Multi-product cart
- `[ ]` Lightweight checkout flow for multiple items
- `[x]` Basic delivery details capture
- `[ ]` Optional smarter shipping logic
- `[ ]` Smarter WhatsApp message generation for cart orders

### Phase 6: Payments

- `[ ]` Paystack integration
- `[ ]` Flutterwave integration
- `[ ]` Payment link generation
- `[ ]` Payment verification
- `[ ]` Attach payment state to orders

### Phase 7: Customer Layer

- `[x]` Customer model foundation
- `[x]` Reuse customer by phone during order creation
- `[ ]` Customer dashboard
- `[ ]` Customer order history
- `[ ]` Basic CRM flows

### Phase 8: Growth Features

- `[ ]` Shareable product links
- `[ ]` Analytics dashboard
- `[ ]` Revenue tracking
- `[ ]` Best-selling products
- `[ ]` Conversion insights

### Phase 9: Advanced

- `[ ]` Inventory management
- `[ ]` Discount system
- `[ ]` Coupon codes
- `[ ]` Abandoned order recovery
- `[ ]` AI-assisted product descriptions
- `[ ]` Automated WhatsApp replies

## Delivery Workflow Checklist

Use this section for every feature or bugfix.

### 1. Understand the task

- `[ ]` Confirm the request
- `[ ]` Map it to the correct product phase
- `[ ]` Identify what must not break
- `[ ]` Note future-phase implications

### 2. Inspect the codebase

- `[ ]` Read the relevant route/component/service/schema files
- `[ ]` Check AGENTS.md and local framework guidance
- `[ ]` Look for existing patterns before adding new ones
- `[ ]` Identify placeholders or incomplete files nearby

### 3. Define the implementation slice

- `[ ]` Choose the smallest production-safe slice
- `[ ]` Separate UI, API, validation, and business logic
- `[ ]` Confirm what is intentionally out of scope
- `[ ]` Check whether schema changes are required

### 4. Implement

- `[ ]` Add or update validation in `lib/validations`
- `[ ]` Add or update service logic in `lib/services`
- `[ ]` Add or update route handlers
- `[ ]` Add or update server/client UI
- `[ ]` Keep mobile-first UX in mind

### 5. Verify

- `[ ]` Run targeted linting
- `[ ]` Run type checks if the repo baseline allows it
- `[ ]` Note any existing repo-wide blockers unrelated to the task
- `[ ]` Review diffs for accidental scope creep

### 6. Manual QA

- `[ ]` Test the happy path
- `[ ]` Test validation errors
- `[ ]` Test tampered URLs / invalid inputs
- `[ ]` Test mobile layout
- `[ ]` Test real user flow end to end

### 7. Ship readiness

- `[ ]` Summarize what changed
- `[ ]` List exactly what you should test
- `[ ]` List what not to bother testing yet
- `[ ]` Confirm whether it is ready to commit
- `[ ]` Confirm the next recommended step

## Current Work Snapshot

### Current Objective

- `Phase 3 -> Phase 4 bridge`
- Stabilize WhatsApp ordering
- Introduce order persistence
- Prepare seller-side order management

### Latest Completed Engineering Work

- `[x]` Added storefront checkout page before WhatsApp
- `[x]` Added validated storefront checkout API
- `[x]` Added order creation service
- `[x]` Added customer reuse by phone number
- `[x]` Added order number generation
- `[x]` Added success page with WhatsApp handoff
- `[x]` Kept existing storefront browse flow intact

### Current Validation State

- `[x]` Targeted ESLint check passed
- `[!]` Full `tsc --noEmit` is blocked by existing empty route/page placeholders elsewhere in the repo
- `[ ]` Manual browser QA still needed
- `[ ]` Git commit still pending

### Next Recommended Step

- `[ ]` Manually test the storefront order flow end to end
- `[ ]` Commit the order-persistence slice if QA passes
- `[ ]` Build seller dashboard order listing
- `[ ]` Build seller order detail + status update flow

## Manual QA Checklist For The Current Order Flow

- `[ ]` Open a store page and change quantity on a product card
- `[ ]` Tap `Continue Order`
- `[ ]` Confirm checkout opens with correct product and quantity
- `[ ]` Submit a valid order
- `[ ]` Confirm success page shows order reference
- `[ ]` Tap `Open WhatsApp`
- `[ ]` Confirm message includes item, quantity, total, address, and order number
- `[ ]` Try blank or invalid fields and confirm validation appears
- `[ ]` Try tampering with the checkout URL and confirm it fails safely

## Notes

- This checklist should be updated after each feature slice.
- Anything marked done in code but not tested manually should still be treated as pending release confidence.
- If a task touches future phases, note it before implementation so the architecture stays extensible.
