import React from 'react';

interface MyRequestsPageProps {
  onBackToHome?: () => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = () => {
  return (
    <div className="min-h-[70vh] w-full" />
  );
};

export default MyRequestsPage;
