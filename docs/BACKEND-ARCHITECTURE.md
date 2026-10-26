# Production Backend Architecture: ATELIER Clothing E-Commerce
**Framework:** Node.js & Express  
**Primary Database:** MySQL (via hosting panel) or PostgreSQL — *Final choice pending client confirmation*  
**Caching & Session Layer:** Redis  
**Payment Gateway:** Razorpay  
**Email Notifications:** Nodemailer / SendGrid  
**File Storage:** Cloudinary (product images)  
**Process Manager:** PM2  
**Reverse Proxy:** Nginx  

---

## 1. System Architecture Overview

```
[ Client Browser / Mobile ]
          |
          | HTTPS (443)
          v
[ Nginx Reverse Proxy + SSL Certificate ]
          |
          v
[ Node.js + Express App Server (PM2 Cluster) ]
          |
     +-----------+-----------+-----------+-----------+
     |           |           |           |           |
     v           v           v           v           v
[ Auth API ] [Products]  [Cart/Order] [Payments] [Admin API]
(JWT+Refresh) (Redis Cache) (Transactions) (Razorpay) (Dashboard)
     |           |           |           |           |
     +-----+-----+-----+-----+-----+-----+-----+-----+
           |                 |                 |
           v                 v                 v
    [ MySQL / PgSQL ]   [ Redis Cache ]   [ Cloudinary ]
    (Main Data Store)   (Sessions/Cache)  (Product Images)
           |
           v
    [ Razorpay Webhooks ] --> [ Webhook Handler ] --> [ Email Service ]
```

---

## 2. Directory & Modular File Structure

```
clothing_backend/
├── .env.example                   # Environment variable template
├── .gitignore                     # Excludes node_modules, .env, uploads
├── Dockerfile                     # Container definition
├── docker-compose.yml             # Local dev stack (db + redis + api)
├── package.json
├── src/
│   ├── app.js                     # Express app: middlewares, routes registration
│   ├── server.js                  # HTTP server bootstrap & DB connection
│   ├── config/
│   │   ├── db.js                  # Database pool connection (MySQL/PgSQL)
│   │   ├── redis.js               # Redis client instance
│   │   ├── razorpay.js            # Razorpay SDK initialization
│   │   └── cloudinary.js          # Cloudinary SDK configuration
│   ├── constants/
│   │   ├── orderStatus.js         # PENDING_PAYMENT, PAID, PROCESSING, DISPATCHED, DELIVERED, CANCELLED, REFUNDED
│   │   └── roles.js               # customer, admin, staff
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, login, refresh token, password reset
│   │   ├── product.controller.js  # Catalog listing, filters, single product, variants
│   │   ├── cart.controller.js     # Add, update, remove, merge guest cart into user cart
│   │   ├── order.controller.js    # Create order, initiate Razorpay, verify signature
│   │   ├── webhook.controller.js  # Razorpay server-to-server events (payment.captured, etc.)
│   │   ├── review.controller.js   # Product reviews & star ratings
│   │   ├── wishlist.controller.js # Save/remove wishlist items per user
│   │   └── admin.controller.js    # Inventory updates, shipment tracking, refund triggers
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Verify Bearer JWT token
│   │   ├── role.middleware.js     # Enforce user role ('customer', 'admin', 'staff')
│   │   ├── validate.middleware.js # Request validation (Zod or Joi schemas)
│   │   ├── rateLimiter.middleware.js # express-rate-limit + Redis store
│   │   ├── upload.middleware.js   # Multer + Cloudinary for product image uploads
│   │   └── errorHandler.middleware.js # Global centralized error handler
│   ├── models/
│   │   ├── User.js               # Customer & admin schema
│   │   ├── Product.js            # Apparel: title, category, description, care
│   │   ├── ProductVariant.js     # SKU, color, size, stock, images
│   │   ├── Order.js              # Order snapshot, pricing, items, address
│   │   ├── OrderItem.js          # Line items within an order
│   │   ├── Payment.js            # Razorpay order ID, payment ID, signature, status
│   │   ├── Cart.js               # Persistent cart for logged-in users
│   │   ├── Review.js             # Star rating + review text per product
│   │   ├── Wishlist.js           # User's saved/favourited products
│   │   └── WebhookEvent.js       # Idempotency deduplication log
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── webhook.routes.js     # NOTE: Must use express.raw() body parser
│   │   └── admin.routes.js
│   └── services/
│       ├── razorpay.service.js   # Orders API, Refund API, Signature verification
│       ├── inventory.service.js  # Atomic stock lock & decrement logic
│       ├── email.service.js      # Transactional receipts via Nodemailer / SendGrid
│       └── cloudinary.service.js # Image upload helpers
└── tests/
    ├── auth.test.js
    ├── order.test.js
    └── payment.test.js
```

---

## 3. Database Schema (MySQL / PostgreSQL — Relational Model)

```sql
-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Apparel Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(60) NOT NULL, -- 'outerwear', 'knitwear', 'tailoring', 'linen'
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('women', 'men', 'unisex')),
    description TEXT NOT NULL,
    composition_and_care TEXT,
    base_price_inr INT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product Variants (Color, Size, SKU & Inventory)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(80) UNIQUE NOT NULL,         -- e.g. "TRENCH-BONE-M"
    color_name VARCHAR(50) NOT NULL,         -- e.g. "Bone Greige"
    color_hex VARCHAR(7),                    -- e.g. "#DDD5CA"
    size VARCHAR(20) NOT NULL,              -- 'XS', 'S', 'M', 'L', 'XL'
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_urls TEXT[] NOT NULL               -- Array of Cloudinary image URLs
);

-- 4. Cart (Persistent — for logged-in users)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

-- 5. Customer Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. "ATL-2026-8841"
    user_id UUID REFERENCES users(id),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_street VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_pincode VARCHAR(20) NOT NULL,
    subtotal_inr INT NOT NULL,
    shipping_fee_inr INT NOT NULL DEFAULT 0,
    discount_inr INT NOT NULL DEFAULT 0,
    total_amount_inr INT NOT NULL,
    promo_code VARCHAR(50),
    delivery_partner VARCHAR(60),           -- e.g. "Shiprocket", "Delhivery" — pending client
    tracking_number VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING_PAYMENT'
        CHECK (status IN ('PENDING_PAYMENT','PAID','PROCESSING','DISPATCHED','DELIVERED','CANCELLED','REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items Snapshot (frozen at time of order)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    product_title VARCHAR(255) NOT NULL,
    sku VARCHAR(80) NOT NULL,
    color_name VARCHAR(50),
    size VARCHAR(20),
    unit_price_inr INT NOT NULL,
    quantity INT NOT NULL
);

-- 7. Razorpay Payment Ledger
CREATE TABLE razorpay_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount_in_paise INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'CREATED'
        CHECK (status IN ('CREATED','AUTHORIZED','CAPTURED','FAILED','REFUNDED')),
    error_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Webhook Idempotency Log
CREATE TABLE processed_webhook_events (
    event_id VARCHAR(120) PRIMARY KEY,    -- x-razorpay-event-id header
    event_name VARCHAR(60) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Product Reviews
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Wishlist
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

---

## 4. Full REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register customer, hash password (bcrypt 12 rounds) |
| POST | `/api/v1/auth/login` | Returns JWT (15 min) + HTTP-only refresh cookie (7 days) |
| POST | `/api/v1/auth/refresh` | Issue fresh access token via refresh token rotation |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |
| POST | `/api/v1/auth/forgot-password` | Send password reset link via email |
| POST | `/api/v1/auth/reset-password` | Validate token and set new password |

### Products & Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | Filter by gender, category, price range, size; Redis cached (TTL: 10 min) |
| GET | `/api/v1/products/:slug` | Full details, colorways, available sizes, live stock |
| POST | `/api/v1/admin/products` | Create product (admin only) |
| PATCH | `/api/v1/admin/products/:id` | Update product details (admin only) |
| DELETE | `/api/v1/admin/products/:id` | Soft-delete product (admin only) |
| POST | `/api/v1/admin/products/:id/images` | Upload images to Cloudinary |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Retrieve user's cart |
| POST | `/api/v1/cart` | Add item to cart |
| PATCH | `/api/v1/cart/:itemId` | Update quantity |
| DELETE | `/api/v1/cart/:itemId` | Remove item |
| DELETE | `/api/v1/cart` | Clear entire cart |

### Orders & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders/create` | Validate cart, verify stock, compute total, create Razorpay order |
| POST | `/api/v1/orders/verify-payment` | Validate HMAC-SHA256 signature, mark order PAID, decrement stock |
| GET | `/api/v1/orders` | List customer's order history |
| GET | `/api/v1/orders/:id` | Get single order details |
| POST | `/api/v1/webhook/razorpay` | Server-to-server webhook (raw body, idempotent) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/orders` | List all orders with filters |
| PATCH | `/api/v1/admin/orders/:id/status` | Update order status + tracking number |
| POST | `/api/v1/admin/orders/:id/refund` | Issue full or partial refund via Razorpay |
| GET | `/api/v1/admin/dashboard` | Revenue, order counts, top products |

### Reviews & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/products/:id/reviews` | Submit a product review |
| GET | `/api/v1/products/:id/reviews` | Get approved reviews for a product |
| POST | `/api/v1/wishlist` | Add product to wishlist |
| GET | `/api/v1/wishlist` | Get user's wishlist |
| DELETE | `/api/v1/wishlist/:productId` | Remove from wishlist |

---

## 5. Critical Production Security Practices

1. **Never Trust Client Prices:** Server always recalculates totals from the database.
2. **Atomic Stock Decrement:** Wrap in DB transaction to prevent overselling:
   ```sql
   UPDATE product_variants 
   SET stock_quantity = stock_quantity - :qty 
   WHERE id = :variantId AND stock_quantity >= :qty;
   ```
3. **Raw Body Webhook:** Define webhook route before `express.json()`:
   ```javascript
   app.post('/api/v1/webhook/razorpay', express.raw({ type: 'application/json' }), handler);
   app.use(express.json()); // All other routes
   ```
4. **JWT + Refresh Token Rotation:** Short-lived access tokens, refresh in HTTP-only cookie.
5. **Helmet + CORS:**
   ```javascript
   app.use(helmet());
   app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
   ```
6. **Rate Limiting:** Protect login and order creation endpoints.
7. **Input Validation:** Validate all request bodies with Zod schemas before hitting controllers.
8. **Environment Variables:** All secrets in `.env`, never committed to git.

---

## 6. Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com        # ← Needs client domain confirmation

# Database (hosting panel will provide these)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=atelier_db
DB_USER=atelier_user
DB_PASSWORD=your-db-password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-jwt-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-jwt-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Razorpay (from Razorpay Dashboard > Settings > API Keys)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX    # ← Needs client's Razorpay account
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXX

# Email (SendGrid or Gmail SMTP)
EMAIL_SERVICE=sendgrid
EMAIL_FROM=orders@yourdomain.com             # ← Needs client email confirmation
SENDGRID_API_KEY=SG.XXXXXXXXX

# Cloudinary (Product Image Hosting)
CLOUDINARY_CLOUD_NAME=your-cloud-name        # ← Needs Cloudinary account
CLOUDINARY_API_KEY=000000000
CLOUDINARY_API_SECRET=XXXXXXXXXXXXXXXXXX
```

---

## 7. Deployment Stack Recommendation

| Layer | Technology | Notes |
|-------|-----------|-------|
| Hosting | VPS (DigitalOcean / AWS / Hostinger VPS) | **Pending client confirmation** |
| Process Manager | PM2 | Auto-restart on crashes, cluster mode |
| Reverse Proxy | Nginx | SSL termination, static file serving |
| SSL | Let's Encrypt (Certbot) | Free, auto-renews |
| Database | MySQL (via cPanel) or PostgreSQL (VPS) | **Pending client preference** |
| Cache | Redis | Session and product cache |
| Image Storage | Cloudinary | Free tier: 25GB storage, 25GB bandwidth/month |
| Email | SendGrid Free Tier | 100 emails/day free |
| Payment | Razorpay Live Account | **Needs client's KYC-verified Razorpay account** |
| Domain | Client to register/transfer | **Needs domain name confirmation from client** |
| Delivery | Shiprocket / Delhivery API | **Pending client delivery partner selection** |

---

## 8. What We Need From the Client (Action Items)

1. **Domain Name** — The website address (e.g., `atelier.in` or `shopname.com`)
2. **Hosting Plan** — Shared hosting vs. VPS. We recommend VPS for this setup
3. **Database Preference** — MySQL (if using cPanel hosting) or PostgreSQL
4. **Razorpay Account** — A live, KYC-verified Razorpay merchant account with API keys
5. **Razorpay Webhook Secret** — Generated in Razorpay Dashboard → Settings → Webhooks
6. **Business Email** — For sending order confirmations (e.g., `orders@yourdomain.com`)
7. **Delivery Partner** — Which courier service to use (Shiprocket, Delhivery, etc.)
8. **Cloudinary Account** — For product image hosting (free account is fine to start)
