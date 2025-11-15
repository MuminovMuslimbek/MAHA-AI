
import React from 'react';
import PageLayout from '@/components/common/PageLayout';
import BattleMode from '@/components/battle/BattleMode';

const BattleModePage: React.FC = () => {
  return (
    <PageLayout fullWidth className="p-0">
      <BattleMode />
    </PageLayout>
  );
};

export default BattleModePage;
