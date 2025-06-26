
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Version utility functions
function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

function incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
  const { major, minor, patch } = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
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
    const { notes, versionType = 'patch' } = await req.json()

    console.log(`🚀 Incrementing version with type: ${versionType}`)

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

    // Calculate new version based on type
    const newVersion = incrementVersion(currentVersion.version, versionType)
    const newBuildNumber = currentVersion.build_number + 1

    console.log(`📈 Version increment: ${currentVersion.version} → ${newVersion} (${versionType})`)

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
        notes: notes || `Nueva versión ${versionType} publicada`,
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

    console.log(`🚀 Version incremented to v${newVersion} (Build #${newBuildNumber}) - Type: ${versionType}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: newVersionData,
        versionType: versionType
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
