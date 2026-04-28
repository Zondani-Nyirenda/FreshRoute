import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { ShopStackParamList, ShopTabParamList } from './types';

import ShopDashboardScreen from '../screens/shop/ShopDashboardScreen';
import CatalogueScreen from '../screens/shop/CatalogueScreen';
import OrderHistoryScreen from '../screens/shop/OrderHistoryScreen';
import ShopProfileScreen from '../screens/shop/ShopProfileScreen';
import OrderConfirmScreen from '../screens/shop/OrderConfirmScreen';
import OrderSuccessScreen from '../screens/shop/OrderSuccessScreen';
import OrderDetailScreen from '../screens/shop/OrderDetailScreen';
import ContactDriverScreen from '../screens/shop/ContactDriverScreen';

const Tab = createBottomTabNavigator<ShopTabParamList>();
const Stack = createNativeStackNavigator<ShopStackParamList>();

function ShopTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textHint,
        tabBarStyle: { borderTopColor: Colors.border, backgroundColor: Colors.white },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home-outline',
            NewOrder: 'cart-outline',
            History: 'time-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ShopDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="NewOrder" component={CatalogueScreen} options={{ title: 'Order' }} />
      <Tab.Screen name="History" component={OrderHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ShopProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function ShopNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="ShopTabs" component={ShopTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Catalogue" component={CatalogueScreen} options={{ title: 'Place Order' }} />
      <Stack.Screen name="OrderConfirm" component={OrderConfirmScreen} options={{ title: 'Confirm Order' }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="ContactDriver" component={ContactDriverScreen} options={{ title: 'Contact Driver' }} />
    </Stack.Navigator>
  );
}