import { supabase } from '@/lib/supabase/client'
import type { Coupon, CouponValidationResult } from '@/lib/types/coupon'

export async function getCoupons() {
  return await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function getCouponById(id: string) {
  return await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single()
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>) {
  return await supabase
    .from('coupons')
    .insert([coupon])
    .select()
    .single()
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>) {
  return await supabase
    .from('coupons')
    .update(coupon)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteCoupon(id: string) {
  return await supabase
    .from('coupons')
    .delete()
    .eq('id', id)
}

export async function validateCoupon(code: string, userId: string | null, cartTotal: number): Promise<CouponValidationResult> {
  const { data, error } = await supabase.rpc('validate_coupon', {
    coupon_code_input: code,
    user_id_input: userId,
    cart_total: cartTotal
  })

  if (error) {
    console.error('Coupon validation error:', error)
    return {
      valid: false,
      error: 'Failed to validate coupon'
    }
  }

  return data as CouponValidationResult
}

export async function getCouponUsage(couponId: string) {
  return await supabase
    .from('coupon_usage')
    .select(`
      *,
      user_profiles!coupon_usage_user_id_fkey (
        full_name
      ),
      orders!coupon_usage_order_id_fkey (
        order_number
      )
    `)
    .eq('coupon_id', couponId)
    .order('used_at', { ascending: false })
}

export async function incrementCouponUsage(couponId: string) {
  const { data: coupon } = await getCouponById(couponId)
  if (!coupon) return

  return await supabase
    .from('coupons')
    .update({ used_count: (coupon.used_count || 0) + 1 })
    .eq('id', couponId)
}

export async function recordCouponUsage(couponId: string, userId: string | null, orderId: string, discountAmount: number) {
  return await supabase
    .from('coupon_usage')
    .insert([{
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount
    }])
}
