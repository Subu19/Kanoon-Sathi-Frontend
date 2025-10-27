"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, updateProfile, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
    }
  }, [user, isAuthenticated, authLoading, router]);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (username.length < 3 || username.length > 50) {
      setError('Username must be between 3 and 50 characters');
      return false;
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    const updateData: { username?: string; email?: string } = {};
    
    if (username.trim() !== user?.username) {
      updateData.username = username.trim();
    }
    
    if (email.trim() !== (user?.email || '')) {
      updateData.email = email.trim() || undefined;
    }
    
    if (Object.keys(updateData).length === 0) {
      setError('No changes to save');
      setIsLoading(false);
      return;
    }
    
    const result = await updateProfile(updateData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(result.error || 'Update failed');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="border-zinc-700"
          >
            Back to Chat
          </Button>
        </div>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account details here
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-600 bg-green-600/10">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={user.id}
                  disabled
                  className="bg-zinc-800 border-zinc-700 text-zinc-400"
                />
                <p className="text-xs text-zinc-400">This cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-400">3-50 characters</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your email (optional)"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Account Created</Label>
                <p className="text-sm text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                </p>
              </div>
              
              {user.last_login && (
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-sm text-zinc-400">
                    {new Date(user.last_login).toLocaleDateString()} at {new Date(user.last_login).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>
              Actions that cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Sign Out</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Sign out of your account on this device
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-zinc-700"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
