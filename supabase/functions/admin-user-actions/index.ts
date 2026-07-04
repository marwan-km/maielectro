import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

function isMissingColumnError(error: { message?: string; details?: string } | null) {
  return /column|schema cache|PGRST204/i.test(String(error?.message || '') + ' ' + String(error?.details || ''))
}

function isActiveAdmin(admin: Record<string, unknown> | null) {
  if (!admin || !Object.prototype.hasOwnProperty.call(admin, 'is_active')) return true
  return admin.is_active === true
}

async function getAdminBy(supabaseAdmin: any, column: string, value: string) {
  let { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id,email,role,is_active')
    .eq(column, value)
    .limit(1)

  if (error && isMissingColumnError(error) && /is_active/i.test(String(error.message || '') + ' ' + String(error.details || ''))) {
    ;({ data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id,email,role')
      .eq(column, value)
      .limit(1))
  }

  if (error) throw new Error('Table column mismatch: ' + error.message)
  return data?.[0] || null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl) return json({ error: 'Missing env variable: SUPABASE_URL.' }, 500)
    if (!serviceRoleKey) return json({ error: 'Service role missing: SUPABASE_SERVICE_ROLE_KEY.' }, 500)

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const requesterEmail = user.email?.toLowerCase() ?? ''
    const requesterAdmin = await getAdminBy(supabaseAdmin, 'id', user.id) || await getAdminBy(supabaseAdmin, 'email', requesterEmail)

    if (!requesterAdmin) return json({ error: 'Current user not found in admin_users by id or email.' }, 403)
    if (requesterAdmin.role !== 'super_admin') return json({ error: 'Current user role is not super_admin.' }, 403)
    if (!isActiveAdmin(requesterAdmin)) return json({ error: 'Current admin user is not active: is_active is false.' }, 403)

    const { action, email, id, password } = await req.json()

    if (action === 'update_password') {
      if ((!email && !id) || !password) throw new Error('Admin id/email and password are required')
      if (typeof password !== 'string' || password.length < 8) throw new Error('Password must contain at least 8 characters')

      const targetAdmin = id
        ? await getAdminBy(supabaseAdmin, 'id', String(id))
        : await getAdminBy(supabaseAdmin, 'email', String(email).toLowerCase())

      if (!targetAdmin?.id) throw new Error('Target admin_users row was not found by id/email')

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetAdmin.id,
        { password },
      )

      if (updateError) throw updateError
      return json({ message: 'Password updated successfully' })
    }

    return json({ error: 'Invalid action' }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Action failed'
    return json({ error: message }, 500)
  }
})
