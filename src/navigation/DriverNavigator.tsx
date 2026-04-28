import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { DriverStackParamList, DriverTabParamList } from './types';

import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import OrderInboxScreen from '../screens/driver/OrderInboxScreen';
import ShopDirectoryScreen from '../screens/driver/ShopDirectoryScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import DriverOrderDetailScreen from '../screens/driver/DriverOrderDetailScreen';
import RouteSummaryScreen from '../screens/driver/RouteSummaryScreen';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createNativeStackNavigator<DriverStackParamList>();

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.driverAccent },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: Colors.driverAccent,
        tabBarInactiveTintColor: Colors.textHint,
        tabBarStyle: { borderTopColor: Colors.border, backgroundColor: Colors.white },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'speedometer-outline',
            Inbox: 'list-outline',
            Directory: 'people-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DriverDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Inbox" component={OrderInboxScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Directory" component={ShopDirectoryScreen} options={{ title: 'Shops' }} />
      <Tab.Screen name="Profile" component={DriverProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function DriverNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.driverAccent },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="DriverTabs" component={DriverTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DriverOrderDetail" component={DriverOrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="RouteSummary" component={RouteSummaryScreen} options={{ title: 'Route Summary' }} />
    </Stack.Navigator>
  );
}