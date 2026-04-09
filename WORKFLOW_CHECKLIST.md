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
- `[x]` Seller order dashboard list
- `[x]` Seller order detail page
- `[x]` Seller status update flow
- `[x]` Order history UX

### Phase 4B: Seller Dashboard Operations

- `[ ]` Sidebar route coverage for seller dashboard nav
- `[x]` Dashboard product list
- `[x]` Dashboard add-product flow
- `[x]` Dashboard edit-product flow
- `[x]` Customer dashboard
- `[x]` Customer order history
- `[ ]` Shop settings dashboard
- `[ ]` Shop settings update flow
- `[ ]` Account settings dashboard
- `[ ]` Account settings update flow

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

- Keep auth and protected-route access stable
- Use the checklist to resume seller operations work in controlled slices
- Replace placeholder dashboard/store route stubs only as the related features are implemented
- Continue from Phase 4 and Phase 4B without breaking the current login/dashboard flow

### Latest Completed Engineering Work

- `[x]` Added storefront checkout page before WhatsApp
- `[x]` Added validated storefront checkout API
- `[x]` Added order creation service
- `[x]` Added customer reuse by phone number
- `[x]` Added order number generation
- `[x]` Added success page with WhatsApp handoff
- `[x]` Kept existing storefront browse flow intact
- `[x]` Restored working credentials login flow
- `[x]` Restored protected dashboard routing without render hangs
- `[x]` Restored dashboard shell with sidebar + topbar
- `[x]` Replaced empty route/page placeholders with safe module stubs so Next.js can compile the app reliably
- `[x]` Added seller status transition rules
- `[x]` Added authenticated seller order status update API
- `[x]` Added seller order detail status update form
- `[x]` Added seller status history logging for manual updates
- `[x]` Added seller order history search
- `[x]` Added seller order status and payment filters
- `[x]` Added seller order history pagination
- `[x]` Added filtered empty states for order history
- `[x]` Added seller dashboard product list with search, visibility filters, stock filters, and pagination
- `[x]` Added dashboard add-product page and authenticated product creation flow
- `[x]` Added seller-owned dashboard product edit page and authenticated update flow
- `[x]` Added storage-backed product image uploads with `FILE_STORAGE` support for local, S3, and Cloudinary
- `[x]` Added seller customer dashboard with search, relationship filters, summary cards, and latest-order links
- `[x]` Added seller customer detail page with full order history and order drill-down links
- `[ ]` Added storefront cart persistence per shop
- `[ ]` Added add-to-cart flow on storefront product cards
- `[ ]` Added storefront cart page with quantity updates and removal
- `[ ]` Added multi-item checkout flow backed by order persistence
- `[ ]` Added cart clearing after successful checkout

### Current Validation State

- `[x]` Login flow works again with credentials auth
- `[x]` Unauthenticated dashboard and orders routes redirect correctly to `/sign-in`
- `[x]` Authenticated dashboard and orders routes were verified locally with a temporary seller account
- `[x]` Empty route/page placeholders no longer block Next.js route compilation
- `[x]` Manual browser QA passed for seller order dashboard list, detail page, status updates, and order history UX
- `[!]` Some non-auth feature routes currently use temporary safe stubs and should be replaced as their feature slices are implemented
- `[x]` Full repo typecheck baseline re-ran successfully with `npx tsc --noEmit` and `npx next typegen`
- `[x]` Targeted upload route, storage adapter, and product form lint checks passed
- `[!]` Targeted ESLint still reports `no-img-element` warnings on remote product image previews
- `[ ]` Manual browser QA for the remaining not-started cart/dashboard feature slices is still needed
- `[ ]` Git commit still pending

### Next Recommended Step

- `[ ]` Continue Phase 4B with the shop settings dashboard
- `[ ]` Replace placeholder stubs only in the slice you are actively implementing
- `[ ]` Run targeted linting, type checks, and manual QA after each slice before moving to the next checklist item
- `[ ]` Manually test `/dashboard/products` for search, visibility filters, stock filters, pagination, and empty states
- `[ ]` Manually test `/dashboard/products/new` for valid submission, validation errors, storefront visibility, and stock tracking
- `[ ]` Manually test `/dashboard/products/[productId]/edit` for prefills, valid updates, validation errors, and seller ownership guardrails
- `[ ]` Manually test image upload on onboarding, product create, and product edit with `FILE_STORAGE=local`
- `[ ]` Manually test `/dashboard/customers` for search, relationship filters, pagination, latest-order links, and empty states
- `[ ]` Manually test `/dashboard/customers/[customerId]` for seller ownership guardrails, order history accuracy, and order drill-down links

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

## Manual QA Checklist For Seller Status Updates

- `[x]` Open a seller order detail page from `/dashboard/orders`
- `[x]` Change a `NEW` order to `Awaiting Payment` or `Paid`
- `[x]` Confirm the status badge updates after refresh
- `[x]` Confirm a new entry appears in `Status history`
- `[x]` Add an internal note and confirm it is saved in the history log
- `[x]` Try an invalid or repeated transition and confirm the UI blocks it safely
- `[x]` Confirm `Completed` and `Cancelled` orders show as final states

## Manual QA Checklist For Order History UX

- `[x]` Open `/dashboard/orders` and confirm the order history table loads
- `[x]` Search by order number and confirm the matching order appears
- `[x]` Search by customer name or phone and confirm matching results appear
- `[x]` Filter by order status and confirm only matching orders remain
- `[x]` Filter by payment status and confirm only matching orders remain
- `[x]` Combine search with filters and confirm the URL updates with query params
- `[x]` Use pagination and confirm page links preserve the active filters
- `[x]` Clear filters and confirm the full order history returns
- `[x]` Trigger a no-results filter and confirm the filtered empty state appears

## Manual QA Checklist For Multi-Product Cart

- `[ ]` Add two different products to the cart from `/store/[slug]`
- `[ ]` Open `/store/[slug]/cart` and confirm both items appear
- `[ ]` Increase and decrease cart quantities and confirm totals update
- `[ ]` Remove one item and confirm the cart count and subtotal update
- `[ ]` Proceed to checkout from the cart and confirm all remaining items appear in one order summary
- `[ ]` Submit a valid multi-item order and confirm the success page shows one order reference for all items
- `[ ]` Open WhatsApp and confirm the prepared message includes every cart item
- `[ ]` Return to the store after success and confirm the cart was cleared

## Notes

- This checklist should be updated after each feature slice.
- Anything marked done in code but not tested manually should still be treated as pending release confidence.
- If a task touches future phases, note it before implementation so the architecture stays extensible.
- Protected route auth currently depends on the helper in `lib/auth-session.ts` rather than `getServerSession(...)`.
- Dashboard/store routes that are marked not started may currently exist as safe placeholder modules purely to keep the app compiling until those slices are implemented.
