# GENZSTORE Project Memory

## Project
Single-vendor clothing e-commerce. Brand: GENZSTORE. Style: Quiet Luxury / Canyon Neutrals.

## Stack
- Frontend: Vanilla HTML/CSS/JS (no framework, runs in browser directly)
- Backend: Node.js + Express + MySQL/PostgreSQL + Redis (architecture documented, not yet deployed)
- Payments: Razorpay Standard Checkout
- Images: Cloudinary (planned)
- Email: SendGrid / Nodemailer (planned)

## Files Built
```
index.html                    Homepage
shop.html                     Catalog (gender + category filters, search, sort)
product.html                  Product detail page
cart.html                     Cart with promo code + shipping tracker
checkout.html                 Checkout + Razorpay modal
order-confirmation.html       Post-payment confirmation page (NEW)
about.html                    Brand story
contact.html                  Contact + FAQ
css/variables.css             Design tokens (Canyon Neutrals palette)
css/base.css                  Reset + typography + reveal animations
css/components.css            All reusable UI components
js/main.js                    Shared: CartManager with unified calculateTotals, formatPrice, IntersectionObserver, event delegation
js/shop.js                    Unified catalog engine (gender, category, search, sort, col toggle)
js/checkout.js                Razorpay modal config (using shared CartManager financials)
docs/BACKEND-ARCHITECTURE.md  Full backend spec (complete)
docs/RAZORPAY-INTEGRATION.md  Full Razorpay guide (complete)
docs/CLIENT-UPDATE.md         Plain-language client progress doc
LLM_CONTEXT.md                LLM handoff context
MEMORY.md                     This file
```

## Key Design Decisions
- Cart stored in localStorage (key: `genzstore_cart`)
- After payment: redirect to `order-confirmation.html?payment_id=&order_id=&amount=`
- Free shipping threshold: Rs.1,500
- Promo code: GENZ10 = 10% off
- Delivery integration: intentionally skipped (Phase 3)
- Deployment target: MilesWeb cPanel (Apache / LiteSpeed static `public_html` or Node.js via Phusion Passenger)

## Pending From Client
1. Domain name
2. MilesWeb cPanel credentials / active domain setup
3. Razorpay Live API Keys (Key ID + Key Secret + Webhook Secret)
4. Delivery partner (Shiprocket recommended)
5. Business email for order confirmations
6. Real product photos + catalog data

## What Is NOT Built Yet
- Real backend server (spec done, code not deployed)
- Admin dashboard
- Customer login / accounts
- Delivery partner integration
- Product reviews / wishlist (backend schema ready, no frontend)
- Real product images (using Unsplash placeholders currently)
