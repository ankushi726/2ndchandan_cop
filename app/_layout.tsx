import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthGuard } from '@/components/AuthGuard';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(freezer)" />
        <Stack.Screen name="(coldroom)" />
        <Stack.Screen name="(blastfreezer)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthGuard>
  );
}
