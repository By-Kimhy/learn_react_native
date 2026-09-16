import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';

import { AppTabBar } from '@/components/app-tab-bar';
import { CreateSheet } from '@/components/create-sheet';

export default function TabsLayout() {
  const [createVisible, setCreateVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
        tabBar={(props) => <AppTabBar {...props} onCreatePress={() => setCreateVisible(true)} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="notes" />
        <Tabs.Screen name="money" />
        <Tabs.Screen name="more" />
      </Tabs>

      <CreateSheet visible={createVisible} onClose={() => setCreateVisible(false)} />
    </>
  );
}
