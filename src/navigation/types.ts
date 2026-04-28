import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  RoleSelect: undefined;
  Login: { role: 'shop' | 'driver' };
  Register: undefined;
};

export type ShopTabParamList = {
  Dashboard: undefined;
  NewOrder: undefined;
  History: undefined;
  Profile: undefined;
};

export type ShopStackParamList = {
  ShopTabs: undefined;
  Catalogue: undefined;
  OrderConfirm: {
    items: { product_id: number; name: string; quantity: number; unit_price: number }[];
  };
  OrderSuccess: { orderId: number };
  OrderDetail: { orderId: number };
  ContactDriver: undefined;
};

export type DriverTabParamList = {
  Dashboard: undefined;
  Inbox: undefined;
  Directory: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  DriverTabs: undefined;
  DriverOrderDetail: { orderId: number };
  RouteSummary: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ShopApp: undefined;
  DriverApp: undefined;
};