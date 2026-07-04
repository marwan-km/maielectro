import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPER_ADMIN_EMAIL = 'kirammarwan@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Authenticate the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }

    const requesterEmail = user.email?.toLowerCase() ?? ''

    // 2. Check if the requester is the active super_admin in public.admin_users.
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('email, role, active')
      .eq('email', requesterEmail)
      .eq('role', 'super_admin')
      .eq('active', true)
      .maybeSingle()

    if (
      adminError ||
      !adminProfile ||
      requesterEmail !== SUPER_ADMIN_EMAIL
    ) {
      return new Response(JSON.stringify({ error: 'Forbidden: only super_admin can do this' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 })
    }

    const { action, email, password } = await req.json()

    if (action === 'update_password') {
      if (!email || !password) throw new Error('Email and password are required')
      if (typeof password !== 'string' || password.length < 8) throw new Error('Password must contain at least 8 characters')
      const targetEmail = String(email).toLowerCase()
      
      // Get the target user ID using admin API
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError
      
      const targetUser = users.find(u => u.email?.toLowerCase() === targetEmail)
      if (!targetUser) throw new Error('User not found in Auth system')

      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password: password }
      )
      
      if (updateError) throw updateError

      return new Response(JSON.stringify({ message: 'Password updated successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Action failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
