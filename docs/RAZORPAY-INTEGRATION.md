# Complete Razorpay Payment Gateway Integration Guide
**Application:** E-Commerce Apparel / Clothing Store  
**Runtime:** Node.js & Express  
**SDK:** `razorpay` npm package & `checkout.js`  

---

## 1. Razorpay Integration Architecture Flow

```
[ Customer Browser ]                 [ Express Server ]                 [ Razorpay Gateway ]
         |                                   |                                   |
  1. Add garments to bag                     |                                   |
  2. Click "Pay with Razorpay"               |                                   |
         |------- POST /api/orders --------->|                                   |
         |       { items, customer, addr }   |                                   |
         |                                   |--- POST /v1/orders -------------->|
         |                                   |    (amount in paise, receipt)     |
         |                                   |<-- Returns order_id --------------|
         |<-- Returns {orderId, amount, key}-|                                   |
         |                                                                       |
  3. Initialize Razorpay(options)                                                |
     rzp.open()                                                                  |
  4. Customer enters UPI ID / Card & Approves OTP ------------------------------>|
         |                                                                       |
         |     [Payment Successful]                                              |
         |<----------------------------------------------------------------------|
         |                                                                       |
  5. handler callback fires:                                                     |
     POST /api/verify-payment                                                    |
     { order_id, payment_id, signature } --->|                                   |
                                             |--- Verify HMAC-SHA256 ------------|
                                             |--- Mark Order as PAID             |
                                             |--- Decrement apparel stock        |
         |<-- 200 OK (Payment Verified) -----|                                   |
         |                                                                       |
         |                                           [Simultaneous Webhook Event]|
         |                                   |<------ POST /api/webhook/razorpay-|
         |                                   |       (payment.captured)          |
         |                                   |--- Verify Webhook Signature       |
         |                                   |--- Deduplicate by Event ID        |
         |                                   |--- Guarantee Order Fulfillment    |
         |                                   |---> Return 200 OK                 |
```

> **CRITICAL RULE:** **Never rely exclusively on the frontend `handler` callback.** If the customer's phone loses signal or battery right after bank approval, the client callback will not fire. **The server-to-server Webhook is compulsory** to guarantee you never take money without fulfilling an order.

---

## 2. Environment Configuration (`.env`)

```env
# Server Port
PORT=5000
CLIENT_URL=http://localhost:3000

# Razorpay API Credentials (Dashboard -> Settings -> API Keys)
# In test mode: starts with rzp_test_
# In live mode: starts with rzp_live_
RAZORPAY_KEY_ID=rzp_test_YourTestKeyId123
RAZORPAY_KEY_SECRET=YourTestKeySecret456

# Razorpay Webhook Secret (Dashboard -> Settings -> Webhooks)
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecret789
```

---

## 3. Production Node.js Server Implementation

Install dependencies:
```bash
npm install express razorpay dotenv cors crypto
```

`server.js`:
```javascript
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

// =========================================================================
// 1. CRITICAL MIDDLEWARE SETUP FOR WEBHOOKS
// =========================================================================
// Webhook route MUST receive the raw Buffer body for signature calculation.
// Do NOT parse it with express.json() before signature verification!
app.post(
  '/api/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

// Standard JSON parser for all application routes
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// In-memory demo data store (Replace with PostgreSQL/MongoDB in production)
const OrderDB = new Map();
const ProcessedWebhookEvents = new Set(); // For idempotency deduplication

// =========================================================================
// 2. CREATE ORDER ENDPOINT
// =========================================================================
app.post('/api/orders/create', async (req, res) => {
  try {
    const { items, customer, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Bag is empty' });
    }

    // A. Recalculate price on backend (NEVER trust client amount)
    const subtotal = items.reduce((sum, item) => sum + (item.priceInINR * item.qty), 0);
    const shippingFee = subtotal >= 1500 ? 0 : 99; // Free shipping over ₹1500
    const totalAmountInINR = subtotal + shippingFee;

    // Convert to currency subunit: 1 INR = 100 paise
    const amountInPaise = Math.round(totalAmountInINR * 100);

    const internalOrderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: internalOrderId,
      payment_capture: 1, // 1 = Auto-capture payment on success
      notes: {
        internalOrderId,
        customerEmail: customer.email,
        itemCount: items.length.toString(),
      },
    });

    // Save initial order in DB
    OrderDB.set(rzpOrder.id, {
      internalOrderId,
      razorpayOrderId: rzpOrder.id,
      amountInINR: totalAmountInINR,
      amountInPaise,
      items,
      customer,
      shippingAddress,
      status: 'PENDING_PAYMENT',
      createdAt: new Date(),
    });

    // Return order details to frontend for Checkout.js
    res.status(201).json({
      success: true,
      order: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID, // Send public Key ID only!
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Could not create order' });
  }
});

// =========================================================================
// 3. PAYMENT VERIFICATION ENDPOINT (Client Callback)
// =========================================================================
app.post('/api/orders/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment signature parameters' });
    }

    // Expected signature: HMAC_SHA256(order_id + "|" + payment_id, secret)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // Constant-time buffer comparison to prevent timing attacks
    const isAuthentic = safeTimingCompare(expectedSignature, razorpay_signature);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cryptographic signature. Verification failed.',
      });
    }

    // Update order status in database
    const order = OrderDB.get(razorpay_order_id);
    if (order && order.status !== 'PAID') {
      order.status = 'PAID';
      order.paymentId = razorpay_payment_id;
      order.paidAt = new Date();
      OrderDB.set(razorpay_order_id, order);

      console.log(`[Order Paid via Client Callback] ${order.internalOrderId}`);
      // Decrement inventory stock & trigger warehouse notification
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// =========================================================================
// 4. SECURE WEBHOOK HANDLER
// =========================================================================
async function handleRazorpayWebhook(req, res) {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const eventId = req.headers['x-razorpay-event-id'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSignature) {
    return res.status(400).send('Missing signature header');
  }

  // 1. Verify Webhook HMAC Signature against Raw Buffer Body
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body) // req.body is raw Buffer
    .digest('hex');

  const isAuthentic = safeTimingCompare(expectedSignature, webhookSignature);
  if (!isAuthentic) {
    console.error('Invalid Razorpay webhook signature');
    return res.status(400).send('Invalid webhook signature');
  }

  // 2. Parse JSON only after signature verification
  const event = JSON.parse(req.body.toString());

  // 3. Idempotency Check: Prevent duplicate processing on retries
  if (eventId && ProcessedWebhookEvents.has(eventId)) {
    console.log(`[Webhook] Duplicate event skipped: ${eventId}`);
    return res.status(200).json({ status: 'duplicate_ignored' });
  }

  try {
    console.log(`[Webhook Event] ${event.event} (ID: ${eventId})`);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        const order = OrderDB.get(razorpayOrderId);
        if (order && order.status !== 'PAID') {
          order.status = 'PAID';
          order.paymentId = payment.id;
          order.paidAt = new Date();
          OrderDB.set(razorpayOrderId, order);
          console.log(`[Order Marked PAID via Webhook] ${order.internalOrderId}`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const order = OrderDB.get(razorpayOrderId);
        if (order && order.status === 'PENDING_PAYMENT') {
          order.status = 'PAYMENT_FAILED';
          order.failureReason = payment.error_description;
          OrderDB.set(razorpayOrderId, order);
        }
        break;
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity;
        console.log(`[Refund Processed] Refund ID: ${refund.id}, Amount: ₹${refund.amount / 100}`);
        break;
      }
    }

    if (eventId) {
      ProcessedWebhookEvents.add(eventId);
    }

    // Always respond with 2xx fast (within 5 seconds) to prevent retries
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing failure:', err);
    return res.status(500).json({ error: 'Processing error' });
  }
}

// =========================================================================
// 5. REFUND ENDPOINT (Apparel Returns & Exchanges)
// =========================================================================
app.post('/api/orders/:orderId/refund', async (req, res) => {
  try {
    const { paymentId, amountInINR, reason } = req.body;
    const idempotencyKey = crypto.randomUUID(); // Unique key for idempotent refund

    const refundOptions = {
      speed: 'optimum', // Razorpay routes to instant refund if available, else normal
      notes: {
        reason: reason || 'Garment size exchange / return',
      },
    };

    if (amountInINR) {
      refundOptions.amount = Math.round(amountInINR * 100); // Amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions, {
      'X-Refund-Idempotency': idempotencyKey,
    });

    res.status(200).json({ success: true, refund });
  } catch (error) {
    console.error('Refund creation failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Timing-safe comparison helper
function safeTimingCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Atelier Store Server running on port ${PORT}`));
```

---

## 4. Test Mode Credentials

Use these in Test Mode (`rzp_test_...`):

### Test UPI VPAs
* **Successful Payment:** `success@razorpay`
* **Failed Payment:** `failure@razorpay`

### Test Card Numbers (Expiry: Any future date e.g. `12/28`, CVV: `123`, OTP: `123456`)
| Scenario | Card Network | Card Number |
| :--- | :--- | :--- |
| **Success (Domestic)** | Visa | `4100 2800 0000 1007` |
| **Success (Domestic)** | Mastercard | `5555 5100 0008 1006` |
| **Success (Domestic)** | RuPay | `6527 6589 0000 1005` |
| **Success (International)**| Mastercard | `5104 0155 5555 5558` |
| **User Cancelled** | Visa | `4100 2800 0007 0002` |
| **Insufficient Funds** | Visa | `4100 2800 0008 0001` |
| **Card Declined** | Visa | `4100 2800 0006 0003` |

---

## 5. Top 5 Pitfalls & Gotchas to Avoid

1. **Paise Subunit Math Bug:** Razorpay expects amounts in paise (`₹1,850 = 185000 paise`). If you send `1850`, the customer will be billed ₹18.50. Always use `Math.round(inrAmount * 100)`.
2. **Global Body Parser Breaking Webhooks:** If `app.use(express.json())` executes before your webhook route, the webhook signature will fail because JSON stringification alters whitespace and key order. Use `express.raw({ type: 'application/json' })` strictly on `/api/webhook/razorpay`.
3. **Relying Only on Frontend Handlers:** If the user closes their browser tab after bank OTP confirmation, the frontend handler never fires. Rely on webhooks as the definitive source of truth.
4. **Auto-Capture Timeout:** Set `payment_capture: 1` during order creation. If manual capture (`0`) is set, you have only 72 hours before Razorpay auto-refunds the payment.
5. **Secret Exposure:** Never put `RAZORPAY_KEY_SECRET` in frontend code or git repositories. Keep only `RAZORPAY_KEY_ID` in the browser.
