import React from 'react';
import AdSupportSettings from './AdSupportSettings';
import PremiumSubscriptionSettings from './PremiumSubscriptionSettings';

const ReaderMonetizationSettings: React.FC = () => {
  return (
    <div className="space-y-8">
      <AdSupportSettings />
      <PremiumSubscriptionSettings />
    </div>
  );
};

export default ReaderMonetizationSettings;
