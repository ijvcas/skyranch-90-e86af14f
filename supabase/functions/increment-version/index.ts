
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request body
    const { notes } = await req.json()

    // Get current version
    const { data: currentVersion, error: fetchError } = await supabaseClient
      .from('app_version')
      .select('*')
      .eq('is_current', true)
      .single()

    if (fetchError) {
      console.error('Error fetching current version:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch current version' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Parse version and increment patch number
    const versionParts = currentVersion.version.split('.')
    const newPatch = parseInt(versionParts[2] || '0', 10) + 1
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${newPatch}`
    const newBuildNumber = currentVersion.build_number + 1

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let userId = null
    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      userId = user?.id
    }

    // Mark current version as not current
    const { error: updateError } = await supabaseClient
      .from('app_version')
      .update({ is_current: false })
      .eq('is_current', true)

    if (updateError) {
      console.error('Error updating current version:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update current version' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Insert new version
    const { data: newVersionData, error: insertError } = await supabaseClient
      .from('app_version')
      .insert({
        version: newVersion,
        build_number: newBuildNumber,
        created_by: userId,
        notes: notes || 'Nueva versión publicada',
        is_current: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting new version:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create new version' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`🚀 Version incremented to v${newVersion} (Build #${newBuildNumber})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: newVersionData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
