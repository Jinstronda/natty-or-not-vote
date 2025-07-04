import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface UsernameEditorProps {
  currentUsername: string;
  userId: string;
}

const UsernameEditor = ({ currentUsername, userId }: UsernameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Reset states when starting edit
  useEffect(() => {
    if (isEditing) {
      setNewUsername(currentUsername || '');
      setError(null);
      setSuccess(null);
      setUsernameAvailable(null);
    }
  }, [isEditing, currentUsername]);

  // Debounced username availability check
  useEffect(() => {
    if (!isEditing || !newUsername || newUsername === currentUsername) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(newUsername);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newUsername, isEditing, currentUsername]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setIsCheckingAvailability(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .neq('id', userId) // Exclude current user
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned means username is available
        setUsernameAvailable(true);
      } else if (data) {
        // Username already exists
        setUsernameAvailable(false);
      }
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSave = async () => {
    if (!user || !newUsername) return;
    
    // Allow saving if it's a new username or different from current
    if (currentUsername && newUsername === currentUsername) return;
    
    setError(null);
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.toLowerCase().trim() })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      setSuccess('Username updated successfully!');
      setIsEditing(false);
      
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('Username update error:', err);
      setError(err.message || 'Failed to update username. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewUsername(currentUsername || '');
    setError(null);
    setUsernameAvailable(null);
  };

  // Input validation
  const isUsernameValid = newUsername.length >= 3 && /^[a-zA-Z0-9_]+$/.test(newUsername);
  const hasChanged = newUsername !== (currentUsername || '');
  const canSave = isUsernameValid && 
                 usernameAvailable === true && 
                 hasChanged && 
                 !isUpdating;

  // Only show if user owns this profile
  if (!user || user.id !== userId) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Username Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Username</p>
              {currentUsername ? (
                <p className="text-2xl font-bold text-primary">@{currentUsername}</p>
              ) : (
                <p className="text-lg text-muted-foreground italic">No username set</p>
              )}
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              {currentUsername ? 'Change Username' : 'Set Username'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.trim())}
                disabled={isUpdating}
                className={
                  newUsername && !isUsernameValid ? 'border-red-300' : 
                  usernameAvailable === false ? 'border-red-300' : 
                  usernameAvailable === true ? 'border-green-300' : ''
                }
              />
              
              {/* Username validation feedback */}
              {newUsername && !isUsernameValid && (
                <p className="text-sm text-red-600">
                  Username must be 3+ characters and contain only letters, numbers, and underscores
                </p>
              )}
              
              {isCheckingAvailability && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking availability...
                </p>
              )}
              
              {usernameAvailable === true && (
                <p className="text-sm text-green-600">✅ Username available!</p>
              )}
              
              {usernameAvailable === false && (
                <p className="text-sm text-red-600">❌ Username already taken</p>
              )}
              
              {newUsername === (currentUsername || '') && newUsername && currentUsername && (
                <p className="text-sm text-muted-foreground">This is your current username</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Username must be at least 3 characters</p>
              <p>• Only letters, numbers, and underscores allowed</p>
              <p>• Username will be converted to lowercase</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsernameEditor;