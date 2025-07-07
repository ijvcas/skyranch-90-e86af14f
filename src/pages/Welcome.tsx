import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  const handleCreateNewFarm = () => {
    navigate('/register');
  };

  const handleJoinExistingFarm = () => {
    // For now, redirect to register - can be enhanced later
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FARMIKA
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Manage your farm and livestock with ease
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCreateNewFarm}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Create New Farm
          </Button>
          
          <Button
            onClick={handleJoinExistingFarm}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50 h-12 text-base font-semibold"
          >
            <Users className="w-5 h-5 mr-2" />
            Join Existing Farm
          </Button>

          <div className="mt-6 text-center">
            <p className="text-base text-gray-600">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 text-green-600 text-base font-semibold"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;