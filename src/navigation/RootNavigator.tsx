import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';

import AuthNavigator from './AuthNavigator';
import ShopNavigator from './ShopNavigator';
import DriverNavigator from './DriverNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const role = useAuthStore((s) => s.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Default landing screen when not logged in */}
      {role === null && (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{ headerShown: false }}
        />
      )}

      {role === 'shop' && (
        <Stack.Screen 
          name="ShopApp" 
          component={ShopNavigator} 
          options={{ headerShown: false }}
        />
      )}

      {role === 'driver' && (
        <Stack.Screen 
          name="DriverApp" 
          component={DriverNavigator} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}