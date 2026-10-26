# GENZSTORE — Modern Luxury Clothing E-Commerce

> Quiet luxury, sculpted silhouette. Mumbai's definitive fashion storefront.

## Live Demo
Run locally: `node server.js` then open `http://localhost:3000`

## Stack
- **Frontend**: Vanilla HTML5 / CSS3 / JavaScript (zero dependencies)
- **Backend**: Node.js (zero npm dependencies — pure standard library)
- **Payments**: Razorpay Standard Checkout (INR)
- **Hosting**: Any Node.js-compatible VPS (DigitalOcean, Hostinger, AWS)

## Pages
| Page | Route |
|------|-------|
| Home | `/index.html` |
| Shop / Catalog | `/shop.html` |
| Product Detail | `/product.html` |
| Shopping Cart | `/cart.html` |
| Checkout | `/checkout.html` |
| Order Confirmation | `/order-confirmation.html` |
| About | `/about.html` |
| Contact | `/contact.html` |

## Run Locally
```bash
node server.js
# Open http://localhost:3000
```
No `npm install` needed — zero dependencies.

## Environment Variables
Create a `.env` file (never commit it) for production:
```
PORT=3000
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

## Razorpay Setup
1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC
2. Go to Settings ? API Keys ? Generate Live Key
3. Add Key ID and Key Secret to your `.env` file
4. Update `js/checkout.js` line 104: replace `rzp_test_YourTestKeyId123` with your live key

## Deployment
```bash
# On your VPS:
git clone https://github.com/sidduambesange06/GenZStore.git
cd GenZStore
node server.js
# Or use PM2 for production:
npm install -g pm2
pm2 start server.js --name genzstore
pm2 save
```

## Project Structure
```
+-- index.html              # Homepage
+-- shop.html               # Catalog with filters
+-- product.html            # Product detail
+-- cart.html               # Shopping cart
+-- checkout.html           # Checkout + Razorpay
+-- order-confirmation.html # Post-payment page
+-- about.html              # Brand story
+-- contact.html            # Contact + FAQ
+-- server.js               # Node.js server
+-- css/
¦   +-- variables.css       # Design tokens (Canyon Neutrals palette)
¦   +-- base.css            # Reset + typography
¦   +-- components.css      # All UI components
+-- js/
¦   +-- main.js             # CartManager, WishlistManager, search, mobile nav
¦   +-- shop.js             # Catalog filter/sort engine
¦   +-- checkout.js         # Razorpay payment handler
+-- docs/
    +-- CLIENT-UPDATE.md        # Plain-language client progress doc
    +-- BACKEND-ARCHITECTURE.md # Full backend spec
    +-- RAZORPAY-INTEGRATION.md # Payment integration guide
    +-- PROPOSAL-FOR-CLIENT.md  # Project proposal
```

## Pending Before Full Launch
- [ ] Client provides Razorpay Live API Keys
- [ ] Client confirms domain name
- [ ] Client provides real product photos and catalog data
- [ ] VPS hosting setup and domain DNS configuration
- [ ] Business email address for order confirmations

---
*Built for GENZSTORE Mumbai — Autumn/Winter 2026 Collection*