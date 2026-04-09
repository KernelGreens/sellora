Sellora — Social Commerce Made Simple

Sellora is a modern platform designed to help small and medium-sized businesses (SMEs) manage and scale their sales operations across social channels like WhatsApp and Instagram.

In many emerging markets, businesses rely heavily on chat-based selling, which often leads to disorganized orders, lost customers, and inefficient workflows. Sellora solves this by providing a centralized system to manage orders, track payments, and build lasting customer relationships.

🎯 Problem

Most social sellers today:

Manage orders manually through chat
Lose track of customer requests
Struggle with payment confirmation
Have no structured record of sales or customers

This results in lost revenue, poor customer experience, and limited business growth.

💡 Solution

Sellora transforms informal selling into structured commerce by offering:

🛍️ Storefront Links — Shareable mini shops for customers
📦 Order Management — Track and manage all orders in one place
💰 Payment Tracking — Monitor payment status and confirmations
👥 Customer Management — Build and retain customer data
📊 Basic Analytics — Gain visibility into sales and performance
📲 WhatsApp Integration — Communicate with customers seamlessly
⚙️ Tech Stack
Frontend: Next.js (App Router), TypeScript, Tailwind CSS
Backend: Next.js API Routes / Server Actions
Database: PostgreSQL
ORM: Prisma
Validation: Zod
UI Components: shadcn/ui
🧱 Architecture Overview

Sellora is built with a modular and scalable architecture:

Multi-tenant shop-based system
Transaction-safe order processing
Snapshot-based order items for data integrity
Clean separation of services and API layers
📌 MVP Scope

The initial version focuses on:

Seller onboarding (shop + products)
Public storefront
Order creation via checkout
Seller dashboard for order tracking
Customer records
Manual payment confirmation
🔮 Vision

Sellora aims to evolve into a full business operating system for SMEs, integrating:

Payments and financial services
Inventory management
Logistics integration
AI-driven business insights

## File Upload Storage

Product image uploads are controlled with `FILE_STORAGE` in `.env`.

- `FILE_STORAGE=local`
  Saves uploads to `public/uploads` for local development.
- `FILE_STORAGE=s3`
  Uploads directly to S3-compatible object storage.
- `FILE_STORAGE=cloudinary`
  Uploads directly to Cloudinary.

Recommended usage:

- use `local` during development
- use `s3` or `cloudinary` in production

Supported environment variables:

- `FILE_STORAGE`
- `MAX_UPLOAD_SIZE_MB`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_SESSION_TOKEN`
- `S3_ENDPOINT`
- `S3_PUBLIC_BASE_URL`
- `S3_FORCE_PATH_STYLE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
