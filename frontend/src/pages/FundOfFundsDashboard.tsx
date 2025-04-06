import React, { useState, useEffect } from 'react';
import { NewsFeed } from '../components/NewsFeed';
import { useLocation } from 'react-router-dom';
import FundOfFundsDashboard from 'components/FundOfFundsDashboard';
import { NavigationBar } from 'components/NavigationBar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const FundOfFundsDashboardPage: React.FC = () => {
  const [userId, setUserId] = useState<string>('current');
  const location = useLocation();

  useEffect(() => {
    // Extract userId from query params if available
    const params = new URLSearchParams(location.search);
    const userIdParam = params.get('userId');
    if (userIdParam) {
      setUserId(userIdParam);
    }
  }, [location]);

  useEffect(() => {
    // Welcome toast when page loads
    toast.success('Welcome to the Fund of Funds Dashboard', {
      description: 'Access premium analytics and insights tailored for Fund of Funds managers',
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar showAuth={true} />
      <div className="flex-1 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Fund of Funds Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and insights for Fund of Funds managers</p>
          <Separator className="my-4" />
        </div>
        <FundOfFundsDashboard userId={userId} />
      </div>
    </div>
  );
};

export default FundOfFundsDashboardPage;
