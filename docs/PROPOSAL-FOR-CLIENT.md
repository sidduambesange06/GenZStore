# Single-Vendor Clothing E-Commerce — Website Scope & Features
### For Client Review
**Prepared by:** Arova Solutions  
**Document type:** Website Feature Overview (refer to separate Quotation document for pricing)

---

> This document explains what your website will do, how it works for your business, and what we need from you to get started. All pricing and hosting charges are covered separately in the Quotation document.

---

## Part 1: What Your Website Will Do

### For Your Customers

| Feature | What the Customer Experiences |
|---------|-------------------------------|
| **Homepage** | A premium landing page with your hero banner, curated collections, featured products, brand story, and newsletter sign-up |
| **Shop / Catalog** | Browse all products — filter by gender (Women / Men), category (Outerwear, Knitwear, Tailoring, Linen & Silks), search by name, sort by price |
| **Product Page** | Full product details — multiple photos, color selector, size picker, care instructions, and "Complete the Look" suggestions |
| **Shopping Bag** | All added items in one place — adjust quantities, see free shipping progress, apply discount codes |
| **Checkout** | Clean checkout form — delivery address, contact details, and secure payment via Razorpay (UPI, Cards, Net Banking, Wallets all supported) |
| **Order Confirmation** | Instant "Thank You" page after payment with order reference number and a 4-step status tracker |
| **About Page** | Your brand story, values, and craftsmanship |
| **Contact & FAQ** | Customer enquiry form, shipping and returns FAQ |

---

### For You (As the Store Owner)

| Feature | What You Get |
|---------|-------------|
| **Admin Dashboard** | View all orders, update order status (Processing → Dispatched → Delivered), add courier tracking numbers |
| **Product Management** | Add, edit, and remove products with sizes, colors, and stock quantities |
| **Inventory Tracking** | Stock automatically reduces when an order is placed |
| **Payment Records** | Every payment logged — date, amount, Razorpay reference, and status (Paid / Refunded / Failed) |
| **Refund Control** | Issue full or partial refunds directly from the admin panel |
| **Discount Codes** | Create and manage promo codes (percentage or fixed discount) |
| **Automated Emails** | Customers receive order confirmation and dispatch notification emails automatically |
| **Analytics Ready** | Google Analytics can be connected to track visitors, top products, and sales |

---

## Part 2: How It Works Behind the Scenes

Your website has three layers — customers only see the front, but the other two layers are what make it reliable and secure.

**Layer 1 — The Website (What Customers See)**  
The pages, photos, buttons, and checkout form. Works on all devices — phones, tablets, and desktops.

**Layer 2 — The Server (The Engine)**  
A secure computer that handles orders, verifies payments, manages stock, and sends emails. Runs 24/7.

**Layer 3 — The Database (The Records)**  
Stores all your products, customer information, and order history securely. Only accessible by your server.

---

### How a Customer Payment Works

```
Customer clicks "Pay"
        ↓
Server confirms stock is available
        ↓
Server calculates the correct total (customers cannot change prices)
        ↓
Razorpay payment screen opens — customer pays via UPI / Card / Wallet
        ↓
Razorpay notifies our server directly (works even if customer's internet drops)
        ↓
Server verifies the payment is genuine
        ↓
Order marked PAID → stock reduced → confirmation email sent to customer
        ↓
Customer lands on Order Confirmation page with their reference number
```

> **Important:** Even if a customer's phone loses internet right after the bank approves the payment, the order is still safely captured on our server. You will never lose a paid order.

---

### How Your Data Is Protected

- Customer passwords are **encrypted** — unreadable to anyone, including us
- **No card numbers are stored** on our server — Razorpay holds all card data under their PCI compliance
- The website uses **SSL encryption** — the padlock customers see in their browser (required for online payments)
- Prices are always calculated on the server — no one can manipulate amounts in the browser
- Payments are verified with a **cryptographic signature** before any order is confirmed

---

### Your Data Ownership

| What Is Stored | Where |
|---------------|-------|
| Customer accounts | Your database |
| Products, sizes, stock | Your database |
| Order history and statuses | Your database |
| Payment records | Your database |
| Product photos | Cloudinary (secure image hosting service) |

All data belongs to you. We do not share or sell it to any third party.

---

## Part 3: Complete Feature List (Delivered After Contract)

### Website Pages — 8 Total
1. Homepage
2. Shop / Catalog
3. Product Detail Page
4. Shopping Bag / Cart
5. Checkout (Razorpay integrated)
6. Order Confirmation
7. About Us
8. Contact & FAQ

### Payment System
- Razorpay Standard Checkout (UPI, Cards, Net Banking, Wallets, Buy Now Pay Later)
- Server-side payment verification (secure, cannot be bypassed)
- Automatic order capture even on customer network drops
- Refund capability from admin panel

### Admin Panel
- Order management with status updates and tracking numbers
- Product and inventory management
- Discount code creation and management
- Basic sales overview

### Customer Accounts
- Registration, login, and order history
- Wishlist / saved products
- Product reviews and star ratings
- Saved delivery addresses

### Automated Transactional Emails
- Order confirmation (on payment success)
- Order dispatched (with tracking number)
- Password reset
- Account verification

> Refer to the Quotation document for email service conditions and limits.

### Delivery Partner Integration
- Automatic shipping label generation
- Real-time tracking updates to customers
- Auto-updating order status (Dispatched → Delivered)

> Refer to the Quotation document for third-party charges.

### Security
- Encrypted customer passwords
- Cryptographic payment verification
- SSL certificate (free, auto-renewed)
- Rate limiting on login and payment endpoints to prevent abuse

---

## Part 4: What We Need From You to Start

| # | What We Need | Why It Is Needed |
|---|-------------|-----------------|
| 1 | Brand name and logo | Website header, favicon, and branding throughout |
| 2 | Product photos (high resolution) | Minimum 2 per product — front and back/detail view |
| 3 | Product details | Name, price, available sizes, colors, stock quantity, description |
| 4 | Razorpay merchant account (KYC verified) | To accept real customer payments |
| 5 | Razorpay Live API Keys | Provided from your Razorpay dashboard — needed to go live |
| 6 | Domain name decision | Use our free subdomain OR purchase your own domain |
| 7 | Business email address | Used as the "From" address for all order emails |
| 8 | Delivery partner decision | Shiprocket / Delhivery / manual — for tracking integration |
| 9 | Return and refund policy | Displayed on the website for customer trust |
| 10 | GST number (if registered) | For invoice and legal compliance |

---

## Part 5: Development Timeline

| Phase | Deliverable | Estimated Time |
|-------|------------|----------------|
| Phase 1 | Frontend pages complete, Razorpay connected, deployed on subdomain | 1–2 weeks |
| Phase 2 | Real product catalog uploaded, live payment testing, domain connection | 3–5 days |
| Phase 3 | Admin dashboard, customer accounts, delivery partner integration | 1–2 weeks |
| Phase 4 | Final review, SEO setup, go-live | 3–5 days |
| **Total** | **Full website live and operational** | **~4–5 weeks** |

---

## Part 6: Third-Party Services (Client Responsibility)

The following are services you interact with directly — they are not included in the development fee and are billed to you by the respective provider:

| Service | Who You Pay | Approximate Cost |
|---------|------------|-----------------|
| Domain name (e.g., `yourstore.in`) | Domain registrar (e.g., GoDaddy, Namecheap) | ₹700–₹1,500 / year |
| Razorpay transaction fees | Razorpay | 2% per successful payment |
| SMS / OTP notifications | SMS provider (e.g., MSG91) | Based on usage |
| Paid email plans (if free tier limit exceeded) | Email provider (e.g., SendGrid) | Based on volume |
| Additional hosting resources (if traffic grows) | Hosting provider | Based on plan |

> All pricing and hosting charges from Arova Solutions are detailed in the separate Quotation document.

---

*This document covers website scope and features only. For pricing, hosting charges, maintenance plans, and payment terms — please refer to the Quotation document from Arova Solutions.*

*Quotation valid for 15 days from date of issue. All deliverables and scope to be agreed before project commencement.*
