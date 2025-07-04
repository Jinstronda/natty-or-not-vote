import { supabase } from "@/integrations/supabase/client";

/**
 * Emergency debug utility to test what's wrong with influencer loading
 */
export const emergencyInfluencerTest = async () => {
  console.log('🚨 [Emergency] Starting influencer test...');
  
  try {
    // Test 1: Direct auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Auth Test:', { 
      hasUser: !!authData?.user, 
      userId: authData?.user?.id,
      error: authError?.message 
    });

    // Test 2: Direct influencer query
    const { data: influencerData, error: influencerError } = await supabase
      .from('influencers')
      .select('id, name, image, claimed_status')
      .order('created_at', { ascending: false })
      .limit(20);
      
    console.log('📊 Influencer Test:', { 
      count: influencerData?.length || 0,
      data: influencerData,
      error: influencerError?.message 
    });

    // Test 3: Check RLS policies
    const { data: publicData, error: publicError } = await supabase
      .from('influencers')
      .select('count(*)')
      .single();
      
    console.log('🔓 Public Access Test:', { 
      count: publicData,
      error: publicError?.message 
    });

    return {
      auth: { hasUser: !!authData?.user, error: authError?.message },
      influencers: { count: influencerData?.length || 0, error: influencerError?.message },
      public: { accessible: !publicError, error: publicError?.message }
    };
    
  } catch (error) {
    console.error('🚨 Emergency test failed:', error);
    return { error: error.message };
  }
};

/**
 * Print Supabase session and storage state for debugging session persistence
 */
export const debugSessionState = () => {
  const local = { ...localStorage };
  const session = { ...sessionStorage };
  console.log('🗝️ LocalStorage:', local);
  console.log('🗝️ SessionStorage:', session);
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('🔑 Supabase Session:', data, error);
  });
};

// Add to window for emergency debugging
if (typeof window !== 'undefined') {
  (window as any).emergencyInfluencerTest = emergencyInfluencerTest;
  (window as any).debugSessionState = debugSessionState;
} 