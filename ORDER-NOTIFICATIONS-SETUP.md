# Order Notifications & User Tracking Setup Guide

## Overview
This guide explains how to implement automated email and WhatsApp notifications for order status updates, and how to properly track which user placed each order.

---

## Problem 1: Track User Email with Orders

### Current Issue
Orders are being created but the user's login email is not being stored or tracked properly. We need to know:
1. Which logged-in user placed the order
2. What email they used to login
3. What contact info they provided in the checkout form

### Solution: Add Email Field to Orders Table

#### Step 1: Update Database Schema
Run this SQL in Supabase SQL Editor:

```sql
-- Add user_email column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- Add comment
COMMENT ON COLUMN orders.user_email IS 'Email address of the logged-in user who placed the order';
```

#### Step 2: Update TypeScript Types
File: `/admin/src/lib/types/database.ts`

```typescript
export interface Order {
  id: string
  order_number: string
  user_id: string | null
  user_email: string | null  // ADD THIS LINE
  status: string
  payment_method: string
  subtotal: number
  shipping_fee: number
  discount_amount: number
  total: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal_code: string | null
  tracking_number: string | null
  tracking_url: string | null
  customer_notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
}
```

#### Step 3: Update Checkout Page (Website)
File: `/website/app/checkout/page.tsx`

When creating the order, include the user's email:

```typescript
// Get the current user
const { data: { user } } = await supabase.auth.getUser()

// When creating order
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    order_number: orderNumber,
    user_id: user?.id || null,
    user_email: user?.email || null,  // ADD THIS LINE
    status: 'pending',
    payment_method: formData.paymentMethod,
    subtotal: cartTotal,
    shipping_fee: shippingFee,
    discount_amount: 0,
    total: cartTotal + shippingFee,
    shipping_name: formData.fullName,
    shipping_phone: formData.phone,
    shipping_address: formData.address,
    shipping_city: formData.city,
    shipping_province: formData.province,
    shipping_postal_code: formData.postalCode,
    customer_notes: formData.notes || null,
  })
  .select()
  .single()
```

Now you'll have:
- `user_id`: UUID of logged-in user
- `user_email`: Email they used to login
- `shipping_name`, `shipping_phone`: Contact info they provided
- Complete audit trail of who ordered what

---

## Problem 2: Automated Notifications

### Overview of Notification Flow

```
Order Status          Email Notification              WhatsApp Notification
────────────────────────────────────────────────────────────────────────────
pending          ✅ Order Confirmation          ✅ Order Received
                    - Order details                 - Order number
                    - Expected processing time      - Thank you message

processing       ✅ Order Processing            ✅ Being Prepared
                    - Order is being prepared       - Estimated ship date
                    - Estimated ship date          

shipped          ✅ Order Shipped               ✅ On the Way
                    - Tracking number              - Tracking link
                    - Tracking URL                 - Expected delivery
                    - Expected delivery            

delivered        ✅ Order Delivered             ✅ Delivered Successfully
                    - Review request               - Review link
                    - Feedback form                - Thank you message

cancelled        ✅ Order Cancelled             ✅ Cancellation Confirmation
                    - Reason (if provided)         - Refund information
                    - Refund information           - Support contact
```

---

## Implementation Options

### Option 1: Supabase Edge Functions (Recommended)
**Best for**: Production use, scalable, serverless

#### Advantages:
- ✅ Built into Supabase
- ✅ Automatic triggers on database changes
- ✅ TypeScript support
- ✅ Free tier available
- ✅ Secure (API keys not exposed)

#### Setup Steps:

1. **Install Supabase CLI**
```bash
npm install -g supabase
supabase login
```

2. **Initialize Functions**
```bash
cd /home/skaps/dekord
supabase functions new send-order-notification
```

3. **Create Edge Function**
File: `supabase/functions/send-order-notification/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY')
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')

serve(async (req) => {
  try {
    const { order, status, trackingInfo } = await req.json()
    
    // Send Email
    await sendEmail(order, status, trackingInfo)
    
    // Send WhatsApp
    await sendWhatsApp(order, status, trackingInfo)
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendEmail(order, status, trackingInfo) {
  const emailTemplates = {
    pending: {
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${order.shipping_name},</p>
        <p>We've received your order <strong>${order.order_number}</strong></p>
        <p><strong>Total:</strong> Rs. ${order.total}</p>
        <p>We'll start processing it shortly and keep you updated.</p>
      `
    },
    processing: {
      subject: `Order Processing - ${order.order_number}`,
      html: `
        <h1>Your order is being prepared</h1>
        <p>Hi ${order.shipping_name},</p>
        <p>Your order <strong>${order.order_number}</strong> is now being processed.</p>
        <p>We'll notify you once it ships.</p>
      `
    },
    shipped: {
      subject: `Order Shipped - ${order.order_number}`,
      html: `
        <h1>Your order is on the way!</h1>
        <p>Hi ${order.shipping_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${trackingInfo?.tracking_number || 'N/A'}</p>
        ${trackingInfo?.tracking_url ? `<p><a href="${trackingInfo.tracking_url}">Track Your Order</a></p>` : ''}
      `
    },
    delivered: {
      subject: `Order Delivered - ${order.order_number}`,
      html: `
        <h1>Your order has been delivered!</h1>
        <p>Hi ${order.shipping_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been delivered.</p>
        <p>We hope you love your products!</p>
        <p><a href="https://dekord.online/reviews">Leave a Review</a></p>
      `
    },
    cancelled: {
      subject: `Order Cancelled - ${order.order_number}`,
      html: `
        <h1>Order Cancellation Confirmation</h1>
        <p>Hi ${order.shipping_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been cancelled.</p>
        <p>If you have any questions, please contact our support team.</p>
      `
    }
  }
  
  const template = emailTemplates[status]
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'dekord <orders@dekord.online>',
      to: [order.user_email],
      subject: template.subject,
      html: template.html
    })
  })
  
  return await response.json()
}

async function sendWhatsApp(order, status, trackingInfo) {
  const whatsappTemplates = {
    pending: `Hi ${order.shipping_name}! 🎉\n\nThank you for your order ${order.order_number}.\n\nTotal: Rs. ${order.total}\n\nWe'll process it shortly and keep you updated!\n\n- dekord Team`,
    processing: `Hi ${order.shipping_name}! 📦\n\nYour order ${order.order_number} is being prepared.\n\nWe'll notify you once it ships.\n\n- dekord Team`,
    shipped: `Hi ${order.shipping_name}! 🚚\n\nYour order ${order.order_number} has shipped!\n\nTracking: ${trackingInfo?.tracking_number || 'N/A'}\n${trackingInfo?.tracking_url ? `\nTrack: ${trackingInfo.tracking_url}` : ''}\n\n- dekord Team`,
    delivered: `Hi ${order.shipping_name}! ✅\n\nYour order ${order.order_number} has been delivered!\n\nWe hope you love it! Please share your feedback.\n\n- dekord Team`,
    cancelled: `Hi ${order.shipping_name},\n\nYour order ${order.order_number} has been cancelled.\n\nIf you need help, contact our support team.\n\n- dekord Team`
  }
  
  const message = whatsappTemplates[status]
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: order.shipping_phone.replace(/[^0-9]/g, ''), // Clean phone number
      type: 'text',
      text: { body: message }
    })
  })
  
  return await response.json()
}
```

4. **Create Database Trigger**
File: `supabase/migrations/order_notifications_trigger.sql`

```sql
-- Function to send notification when order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Call Edge Function
    PERFORM
      net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'order', row_to_json(NEW),
          'status', NEW.status,
          'trackingInfo', jsonb_build_object(
            'tracking_number', NEW.tracking_number,
            'tracking_url', NEW.tracking_url
          )
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS order_status_notification ON orders;
CREATE TRIGGER order_status_notification
  AFTER INSERT OR UPDATE OF status
  ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();
```

5. **Deploy Edge Function**
```bash
supabase functions deploy send-order-notification --no-verify-jwt

# Set environment variables
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set WHATSAPP_API_KEY=your_whatsapp_key
supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
```

---

### Option 2: Next.js API Routes (Simpler)
**Best for**: Quick setup, development

#### Setup Steps:

1. **Create API Route**
File: `/website/app/api/send-order-notification/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { order, status, trackingInfo } = await req.json()
    
    // Send Email
    await resend.emails.send({
      from: 'dekord <orders@dekord.online>',
      to: [order.user_email],
      subject: getEmailSubject(status, order.order_number),
      html: getEmailTemplate(status, order, trackingInfo)
    })
    
    // Send WhatsApp
    await sendWhatsAppMessage(order, status, trackingInfo)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getEmailSubject(status: string, orderNumber: string) {
  const subjects = {
    pending: `Order Confirmation - ${orderNumber}`,
    processing: `Order Processing - ${orderNumber}`,
    shipped: `Order Shipped - ${orderNumber}`,
    delivered: `Order Delivered - ${orderNumber}`,
    cancelled: `Order Cancelled - ${orderNumber}`
  }
  return subjects[status] || `Order Update - ${orderNumber}`
}

// ... rest of the implementation
```

2. **Update Order Service**
File: `/admin/src/lib/services/orders.ts`

Add this function:

```typescript
export async function sendOrderNotification(order: Order, status: string, trackingInfo?: any) {
  try {
    const response = await fetch('/api/send-order-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, status, trackingInfo })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send notification')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, error: error.message }
  }
}
```

3. **Call in Order Status Update**
File: `/admin/src/app/orders/[id]/page.tsx`

```typescript
async function handleStatusUpdate(newStatus: string) {
  // Update status in database
  await updateOrderStatus(order.id, newStatus, trackingInfo)
  
  // Send notification
  await sendOrderNotification(order, newStatus, trackingInfo)
  
  // Refresh data
  await loadOrder()
}
```

---

## Email Service Setup

### Option A: Resend (Recommended)
**Website**: https://resend.com
**Pricing**: Free tier: 100 emails/day, $20/month for 50K emails

#### Setup:
1. Sign up at https://resend.com
2. Verify your domain (dekord.online)
3. Get API key from dashboard
4. Add to environment variables:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

#### Install Package:
```bash
npm install resend
```

### Option B: SendGrid
**Website**: https://sendgrid.com
**Pricing**: Free tier: 100 emails/day

### Option C: AWS SES
**Website**: https://aws.amazon.com/ses/
**Pricing**: $0.10 per 1000 emails (cheapest)

---

## WhatsApp Business API Setup

### Official WhatsApp Business API
**Website**: https://business.facebook.com/products/whatsapp

#### Steps:
1. Create Meta Business Account
2. Go to https://developers.facebook.com/
3. Create new app → Business → WhatsApp
4. Get Phone Number ID and Access Token
5. Verify your business

#### Setup:
```bash
WHATSAPP_API_KEY=your_access_token
WHATSAPP_PHONE_ID=your_phone_number_id
```

#### Send Message Code:
```typescript
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      })
    }
  )
  
  return await response.json()
}
```

### Alternative: Twilio WhatsApp
**Website**: https://www.twilio.com/whatsapp
**Pricing**: Pay per message

---

## Implementation Checklist

### Database Changes
- [ ] Add `user_email` column to orders table
- [ ] Create index on `user_email`
- [ ] Update TypeScript types

### Website Checkout
- [ ] Get current user email
- [ ] Include `user_email` in order creation
- [ ] Test order creation flow

### Notification System
- [ ] Choose implementation (Edge Functions or API Routes)
- [ ] Set up email service (Resend/SendGrid/SES)
- [ ] Set up WhatsApp Business API
- [ ] Create email templates for each status
- [ ] Create WhatsApp message templates
- [ ] Implement notification function
- [ ] Add error handling and logging

### Admin Panel Integration
- [ ] Call notification function on status update
- [ ] Show notification success/failure
- [ ] Add retry mechanism for failed notifications
- [ ] Log notification history

### Testing
- [ ] Test pending order notification
- [ ] Test processing notification
- [ ] Test shipped notification (with tracking)
- [ ] Test delivered notification
- [ ] Test cancelled notification
- [ ] Test with real email and phone number

---

## Cost Estimation (Monthly)

### For 1000 orders/month:
```
Email (Resend):        Free (under 3000/month)
WhatsApp (Meta):       ~$50-100 (varies by country)
Edge Functions:        Free (within limits)
Total:                 ~$50-100/month
```

### For 10,000 orders/month:
```
Email (Resend):        $20
WhatsApp (Meta):       ~$500-1000
Edge Functions:        Free
Total:                 ~$520-1020/month
```

---

## Recommended Approach

For **dekord**, I recommend:

1. **Start with Option 2 (Next.js API Routes)** - Easier to test and debug
2. **Use Resend for Email** - Best developer experience, reliable
3. **Use Meta WhatsApp Business API** - Official, reliable, scalable
4. **Later migrate to Edge Functions** - When you need better scalability

### Implementation Order:
1. ✅ Add `user_email` to orders (30 mins)
2. ✅ Set up Resend account (15 mins)
3. ✅ Create email templates (1 hour)
4. ✅ Set up WhatsApp Business API (2 hours - includes verification)
5. ✅ Create Next.js API route (1 hour)
6. ✅ Integrate with admin panel (30 mins)
7. ✅ Test everything (1 hour)

**Total Time**: ~6-7 hours

---

## Need Help?

If you want me to implement any of these:
1. Say "implement email notifications" - I'll create the full email system
2. Say "implement whatsapp notifications" - I'll create WhatsApp integration
3. Say "fix user tracking" - I'll update the database and checkout flow
4. Say "implement everything" - I'll do the complete setup

Let me know which parts you want me to implement!
