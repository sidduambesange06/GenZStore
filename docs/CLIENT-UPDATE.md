# GENZSTORE — Website Development Update
### Document for Client Review
**Prepared by:** Development Team  
**Date:** October 2026  
**Project:** GENZSTORE — Single-Vendor Clothing E-Commerce Website

---

> This document is written in plain language — no technical jargon. It explains everything we have built so far, how the website works for your customers, what we still need from you to move forward, and what questions remain open.

---

## Section 1: What Is GENZSTORE?

GENZSTORE is your premium clothing website — a complete online store where your customers can:

- Browse your collection of garments (organized by Women, Men, and category)
- View individual product pages with photos and size options
- Add items to their shopping bag
- Check out and pay securely using Razorpay (India's most trusted payment platform)
- Receive an order confirmation instantly

The website has been designed with a **"Quiet Luxury"** aesthetic — warm cream tones, elegant typography, and smooth animations — giving your brand a premium, editorial feel from day one.

---

## Section 2: What Has Been Built (Current Progress)

### ✅ Website Pages Completed

| Page | What It Does |
|------|-------------|
| **Home Page** | Your brand's first impression — editorial hero banner, "Shop by Women / Men" panels, seasonal collections grid, featured products, brand story, press mentions, and newsletter signup |
| **Shop / Catalog** | Full product listing with live search, gender filters (All / Women / Men), category filters (Outerwear / Knitwear / Tailoring / Linen & Silks), sort by price, and 2-column or 4-column grid view |
| **Product Page** | Individual garment view — multiple photos that crossfade on hover, color swatch selector, size picker, care instructions, and "Complete the Look" recommendations |
| **Shopping Bag** | Customer's cart showing all items, quantity controls (+/-), free shipping progress bar (unlocked at ₹1,500), promo code field (GENZSTORE10 = 10% off), and order summary |
| **Checkout** | Clean, focused checkout form — customer contact details, delivery address, and the Razorpay "Pay Now" button |
| **Order Confirmation** | A dedicated "Thank You" page shown after a successful payment, with the order number, payment reference, and a 4-step order tracker |
| **About Us** | Brand heritage, craftsmanship values, material transparency, and sustainability commitment |
| **Contact / Care** | Customer inquiry form, concierge care, FAQ accordions covering shipping, returns, and sizing |

### ✅ Key Features Working

- **Scrolling Announcement Bar** at the top with rotating promotional messages
- **Smart Navigation Header** — hides when scrolling down, reappears when scrolling up
- **Mobile-Friendly Menu** — full-screen slide-out drawer on phones
- **Quick-Add to Bag** — hover over any product card, select a size, and add in one click
- **Dual-Image Hover** — each product card shows a second photo on hover for a richer browsing feel
- **Wishlist Button** — heart icon on each product to save favourites
- **Free Delivery Progress Bar** — shows how much more to add to unlock free shipping
- **Promo Code System** — supports discount codes at checkout
- **Toast Notifications** — small pop-up messages (e.g., "Added to bag")
- **Razorpay Payment Modal** — when "Pay Now" is clicked, Razorpay's secure payment screen opens (supports UPI, Cards, Net Banking, Paytm, PhonePe, CRED)
- **Order Confirmation Page** — after payment, customer sees their payment ID and order status with a 4-step tracker

### ✅ Payment System Architecture (How Money Flows)

Here is what happens when a customer pays:

1. Customer fills in their details and clicks **"Pay with Razorpay"**
2. Our server creates a secure payment request with the **exact amount** (the server always calculates the price — customers cannot manipulate it)
3. Razorpay's payment window opens — customer pays via UPI/Card/etc.
4. After successful payment, Razorpay notifies both the customer browser AND our server directly (even if the customer's internet drops, the order is still captured)
5. Our server verifies the payment is genuine using a special security check (called HMAC signature verification)
6. Order is marked as **PAID** and inventory is updated
7. Customer is redirected to the Order Confirmation page
8. Order confirmation email is sent to the customer

> **Why two notifications?** If a customer's phone dies right after the bank approves the payment, we still capture the order safely via the direct server-to-server notification from Razorpay. Your orders are never lost.

### ✅ Security Built In

- Payments are handled entirely by Razorpay — **we never see or store card numbers**
- All prices are calculated on our server — customers cannot change prices in the browser
- Customer passwords are encrypted before storage (they are unreadable even to us)
- The website uses 256-bit SSL encryption (the padlock in the browser address bar)
- Razorpay payments are verified using a cryptographic signature before any order is confirmed
- Attack-prevention rate limits are in place on the payment and login endpoints

---

## Section 3: How the Website Is Organized (For Your Reference)

Think of the website as having three layers:

### Layer 1: The Front End (What Customers See)
The visual website — the pages, buttons, product photos, and animations. This is fully built and runs in the customer's browser.

### Layer 2: The Back End (The Engine Room)
A secure server that handles:
- User accounts (login, registration, password reset)
- Product catalog management
- Order creation and tracking
- Payment processing with Razorpay
- Inventory management (reduces stock when a purchase is made)
- Sending confirmation emails

### Layer 3: The Database (The Filing Cabinet)
Stores all your data securely:
- Customer accounts
- Product details, variants, stock levels
- All orders and their statuses
- Payment records
- Customer reviews and wishlists

The back end and database need to be hosted on a server — which is why we need your hosting decision (see Section 4).

---

## Section 4: What We Need From You

The following are decisions and information that only you (the client) can provide. **The website cannot go fully live until these are confirmed.**

---

### 🟡 Item 1: Domain Name

> **What is a domain name?** It is the website address your customers will type to visit your store — for example: `GENZSTORE.in` or `shopname.com`

**What we need from you:**
- Have you already registered a domain name? If yes, please share it with us
- If not, please choose your preferred domain name and we will guide you to register it (typically costs ₹700–₹1,500 per year)
- If you already own a domain registered elsewhere, we will need access to the domain control panel to point it to your hosting

**Our recommendation:** A `.in` domain (e.g., `GENZSTORE.in`) or `.com` works best for Indian fashion brands.

---

### 🟡 Item 2: Hosting (Where the Website Lives)

> **What is hosting?** Hosting is a computer (server) that stays on 24/7 and serves your website to customers around the world.

**What we need from you:**
- Do you have an existing hosting plan? If yes, please share the details
- If not, we need you to choose a hosting plan

**Our recommendation:** A VPS (Virtual Private Server) — this gives your website dedicated resources and handles traffic spikes safely. Approximate cost: ₹500–₹1,500/month depending on the provider (DigitalOcean, Hostinger, or AWS).

> A basic shared hosting plan will NOT be sufficient for this website — it needs its own dedicated server space.

---

### 🟡 Item 3: Database

> **What is a database?** It is the digital filing cabinet that stores all your products, orders, and customer information securely.

**What we need from you:**
- If you already have hosting with a control panel (cPanel), we will use **MySQL** — which comes included with most hosting plans
- If you choose a VPS server, we will use **PostgreSQL** — which is slightly more powerful

**Action needed:** Once you confirm your hosting, this decision is automatically made. No separate action needed from you on this one.

---

### 🔴 Item 4: Razorpay Account (Payment Gateway — Most Important)

> **What is Razorpay?** Razorpay is the payment system that allows your customers to pay via UPI (Google Pay, PhonePe), debit/credit cards, net banking, and more. It is currently the most widely used payment gateway in India.

**What we need from you:**

1. **A Razorpay merchant account** — If you do not have one, sign up at [razorpay.com](https://razorpay.com) and complete KYC (business verification). This typically takes 1–3 business days.
2. **Your Razorpay API Keys** — Once your account is approved, go to: Razorpay Dashboard → Settings → API Keys → Generate Live Key. You will get two codes: a **Key ID** and a **Key Secret**. Please share these with us securely.
3. **Webhook Secret** — In Razorpay Dashboard → Settings → Webhooks, create a webhook and share the secret code with us.

> ⚠️ **Important:** Razorpay deducts a **2% transaction fee** from each payment before depositing to your bank account. For example, a ₹1,000 sale results in ₹980 deposited. This fee is standard industry practice.

**Current status:** We have built the entire payment system and tested it in "demo mode." As soon as you provide the live Razorpay keys, payments will be real and live.

---

### 🟡 Item 5: Delivery Partner

> **What is a delivery partner?** When an order is placed, someone needs to physically pick up the garment from your location and deliver it to the customer. A delivery partner (courier integration) automates this process — they generate shipping labels, provide tracking numbers, and update the order status automatically.

**What we need from you:**

- Which courier service do you plan to use? Common options:
  - **Shiprocket** — Aggregates multiple couriers (Blue Dart, Delhivery, Ecom Express). Most popular for Indian D2C brands. Recommended.
  - **Delhivery** — Direct integration, good for high-volume
  - **Self-Managed** — If you plan to handle delivery yourself to start, we will add manual tracking number input for now

**What we will build once you decide:**
- Automatic shipping label generation when an order is placed
- Real-time tracking updates sent to the customer
- Auto-updating of order status (Dispatched → Delivered)

> **Note:** Delivery integration has been intentionally left out of the current build as requested. This will be added as a separate phase once your delivery partner is confirmed.

---

### 🟡 Item 6: Business Email Address

> **What is a business email?** When a customer places an order, they receive a confirmation email. This email is sent "from" your business email address — for example: `orders@GENZSTORE.in`

**What we need from you:**
- Your preferred "From" email address (e.g., `orders@yourdomain.com` or `hello@yourdomain.com`)
- If you do not have a business email, we can set one up as part of the hosting setup

---

### 🟡 Item 7: Product Images & Catalog

**What we need from you:**
- Your actual product photos (high-resolution, portrait orientation preferred — 3:4 ratio works best)
- Each product should have at least 2 photos (front view + back/detail view) for the hover crossfade effect
- Product names, descriptions, prices, available sizes, and stock quantities

**Current status:** The website currently uses sample photos for demonstration. Once you provide your actual product catalog, we will replace all placeholder content.

---

## Section 5: What Comes Next (Development Phases)

### Phase 1: In Progress ✅
All website pages, payment system, cart, and checkout built and tested

### Phase 2: On Hold (Pending Client Decisions)
- Connect live Razorpay account ← **Needs your API keys**
- Upload actual product catalog ← **Needs your product photos and details**
- Configure domain and hosting ← **Needs your domain and hosting confirmation**
- Set up business email for order confirmations ← **Needs email address**

### Phase 3: After Phase 2
- Admin dashboard for you to manage orders, update inventory, and issue refunds
- Delivery partner integration (shipping labels + tracking)
- Customer account area (order history, wishlist, saved addresses)
- Product reviews and ratings

### Phase 4: Launch & Post-Launch
- Full website goes live on your domain
- SEO (Search Engine Optimization) setup so customers can find you on Google
- Analytics setup (Google Analytics) to track visitors and sales
- Ongoing maintenance and updates

---

## Section 6: Questions We Have for You

Please review and answer the following. You can reply to this document or send your answers directly:

1. **Do you have a domain name already?** If yes, what is it?
2. **Do you have existing hosting?** If yes, please share the provider and control panel details
3. **Do you have a Razorpay account?** If yes, are you able to share the Live API Keys?
4. **Which delivery partner do you prefer?** (Shiprocket / Delhivery / Manual for now)
5. **What email address should order confirmations come from?**
6. **Are your product photos ready to upload?** If yes, please share them
7. **Are there any other pages or features you'd like added** that we haven't discussed?

---

## Section 7: What the Finished Website Will Cost the Customer

When a customer makes a purchase on your website, here is the cost breakdown they will see:

- **Product price** — as you set it
- **Shipping fee** — ₹99 (waived automatically if order exceeds ₹1,500)
- **GST** — Included in product price (you will need to confirm if you are GST-registered)
- **Payment processing fee** — Absorbed by Razorpay (2% deducted from your payout, not charged to customer)

---

## Section 8: Summary of Action Items

| # | Item | Who Acts | Priority |
|---|------|----------|----------|
| 1 | Confirm domain name (or share existing one) | **Client** | 🔴 High |
| 2 | Choose and set up hosting plan | **Client** | 🔴 High |
| 3 | Create and verify Razorpay merchant account | **Client** | 🔴 High |
| 4 | Share Razorpay Live API Keys securely | **Client** | 🔴 High |
| 5 | Decide on delivery partner | **Client** | 🟡 Medium |
| 6 | Provide business email address | **Client** | 🟡 Medium |
| 7 | Provide product photos and catalog data | **Client** | 🟡 Medium |
| 8 | Connect domain, configure server, deploy backend | **Development Team** | — Awaiting client inputs |
| 9 | Upload real product catalog | **Development Team** | — Awaiting client inputs |
| 10 | Live Razorpay integration and testing | **Development Team** | — Awaiting client inputs |
| 11 | Delivery partner integration | **Development Team** | Phase 3 |
| 12 | Admin dashboard build | **Development Team** | Phase 3 |
| 13 | Website launch | **Both** | After Phase 2 complete |

---

*This document was prepared by the development team as a progress update. For any questions or clarifications, please reach out directly. We are committed to making GENZSTORE a world-class online presence for your brand.*
