'use client'

import React, { useState, useEffect } from 'react';

const AdSupportSettings: React.FC = () => {
  const [adSupportLevel, setAdSupportLevel] = useState<'normal' | 'boosted' | 'video'>('normal');
  const [supportCreator, setSupportCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/monetization')
      .then(res => res.json())
      .then(data => {
        setAdSupportLevel(data.adSupportLevel || 'normal');
        setSupportCreator(data.adSupportLevel === 'boosted' || data.adSupportLevel === 'video');
        setLoading(false);
      });
  }, []);

  const save = async (level: 'normal' | 'boosted' | 'video') => {
    setLoading(true);
    await fetch('/api/user/monetization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adSupportLevel: level }),
    });
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {loading && <div>Loading ad support settings...</div>}
      <h2 className="text-xl font-bold">Ad Support Settings</h2>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={supportCreator}
            onChange={e => setSupportCreator(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Show me more ads to support my favorite creators</span>
        </label>
      </div>
      {supportCreator && (
        <div className="space-y-2">
          <label className="block font-medium">Ad Support Level</label>
          <select
            value={adSupportLevel}
            onChange={e => setAdSupportLevel(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="normal">Normal (default)</option>
            <option value="boosted">Boosted (more frequent ads)</option>
            <option value="video">Video Ads (higher value, e.g. 30s between chapters)</option>
          </select>
          <p className="text-xs text-gray-500">Boosted and video ads increase creator earnings.</p>
        </div>
      )}
    </div>
  );
};

export default AdSupportSettings;
