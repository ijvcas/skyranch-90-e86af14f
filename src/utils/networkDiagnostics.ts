// Network diagnostics utility for troubleshooting CORS and connection issues
export const networkDiagnostics = {
  // Test basic network connectivity
  async testNetworkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('🔴 Basic network connectivity failed:', error);
      return false;
    }
  },

  // Test Supabase connectivity
  async testSupabaseConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://ahwhtxygyzoadsmdrwwg.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2h0eHlneXpvYWRzbWRyd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjIxNzMsImV4cCI6MjA2NDY5ODE3M30.rffEqABIU3U7e7qdPXLvNMQfqU2sNIJHrfP_A_5GrlI'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('🔴 Supabase connectivity failed:', error);
      return false;
    }
  },

  // Run full diagnostic
  async runDiagnostics(): Promise<{ network: boolean; supabase: boolean }> {
    console.log('🔍 Running network diagnostics...');
    
    const network = await this.testNetworkConnectivity();
    const supabase = await this.testSupabaseConnectivity();

    console.log('🔍 Diagnostic Results:', { network, supabase });
    
    return { network, supabase };
  },

  // Clear browser cache programmatically where possible
  clearCache(): void {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('🧹 Browser cache cleared');
  }
};