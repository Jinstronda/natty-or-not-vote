// Debug page to help test username functionality
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const DebugUsername = () => {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugCheck = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get username count for uniqueness check
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('username', 'is', null);

      setDebugInfo({
        authUser: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profile,
        profileError: profileError,
        totalUsersWithUsernames: count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading auth state...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Username Debug Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to use the debug tool.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Username System Debug Tool</CardTitle>
              <p className="text-muted-foreground">
                This tool helps debug the username system for authenticated users.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runDebugCheck} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Running Debug Check...' : 'Run Debug Check'}
              </Button>

              {debugInfo && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Debug Results</h3>
                  
                  {debugInfo.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800">Error: {debugInfo.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Auth User Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Auth User Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>ID:</div>
                            <div className="font-mono">{debugInfo.authUser.id}</div>
                            <div>Email:</div>
                            <div>{debugInfo.authUser.email}</div>
                            <div>Created:</div>
                            <div>{new Date(debugInfo.authUser.created_at).toLocaleString()}</div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Profile Data */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Profile Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {debugInfo.profileError ? (
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-red-800">Profile Error: {debugInfo.profileError.message}</p>
                            </div>
                          ) : debugInfo.profile ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Username:</div>
                                <div>
                                  {debugInfo.profile.username ? (
                                    <Badge variant="default">@{debugInfo.profile.username}</Badge>
                                  ) : (
                                    <Badge variant="secondary">No username set</Badge>
                                  )}
                                </div>
                                <div>Role:</div>
                                <div>{debugInfo.profile.role}</div>
                                <div>Created:</div>
                                <div>{new Date(debugInfo.profile.created_at).toLocaleString()}</div>
                              </div>
                              
                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-muted-foreground">
                                  View Raw Profile Data
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                                  {JSON.stringify(debugInfo.profile, null, 2)}
                                </pre>
                              </details>
                            </div>
                          ) : (
                            <p>No profile found</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* System Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">System Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Total users with usernames:</div>
                            <div>{debugInfo.totalUsersWithUsernames}</div>
                            <div>Check timestamp:</div>
                            <div>{new Date(debugInfo.timestamp).toLocaleString()}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testing Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Expected behavior for new Google OAuth users:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Profile exists but username is null</li>
                <li>SignUp page should show username selection form</li>
                <li>After setting username, profile should update</li>
              </ul>
              
              <p className="mt-4"><strong>Expected behavior for existing users:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Profile exists with username set</li>
                <li>Can change username via profile page</li>
                <li>Username changes are reflected immediately</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DebugUsername;