import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getOrdersByShop, Order } from '../../database/orders';
import { getActiveDriver } from '../../database/drivers';
import { Driver } from '../../database/drivers';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'ShopTabs'>;
};

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: Colors.warning,      bg: Colors.warningLight,  icon: 'time-outline' },
  confirmed:        { label: 'Confirmed',         color: Colors.primary,      bg: Colors.primaryLight,  icon: 'checkmark-circle-outline' },
  out_for_delivery: { label: 'Out for Delivery',  color: Colors.accent,       bg: '#FFF8EC',            icon: 'car-outline' },
  delivered:        { label: 'Delivered',         color: Colors.success,      bg: Colors.successLight,  icon: 'bag-check-outline' },
  cancelled:        { label: 'Cancelled',         color: Colors.danger,       bg: Colors.dangerLight,   icon: 'close-circle-outline' },
} as const;

export default function ShopDashboardScreen({ navigation }: Props) {
  const shop = useAuthStore((s) => s.shop);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!shop) return;
    const [orders, activeDriver] = await Promise.all([
      getOrdersByShop(shop.id),
      getActiveDriver(),
    ]);
    setRecentOrders(orders.slice(0, 5));
    setDriver(activeDriver);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const pendingCount = recentOrders.filter((o) => o.status === 'pending').length;
  const activeCount = recentOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'out_for_delivery'
  ).length;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Greeting */}
        <View style={s.greetingRow}>
          <View>
            <Text style={s.greeting}>Hello,</Text>
            <Text style={s.shopName}>{shop?.shop_name}</Text>
          </View>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>
              {shop?.shop_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Quick action — Place Order */}
        <TouchableOpacity
          style={s.orderBanner}
          onPress={() => navigation.navigate('Catalogue')}
          activeOpacity={0.88}
        >
          <View style={s.orderBannerText}>
            <Text style={s.orderBannerTitle}>Need stock?</Text>
            <Text style={s.orderBannerSub}>Place an order now — eggs & bread delivered to you</Text>
          </View>
          <View style={s.orderBannerIcon}>
            <Ionicons name="cart" size={28} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: Colors.warning }]}>
            <Text style={[s.statNum, { color: Colors.warning }]}>{pendingCount}</Text>
            <Text style={s.statLabel}>Pending</Text>
          </View>
          <View style={[s.statCard, { borderColor: Colors.primary }]}>
            <Text style={[s.statNum, { color: Colors.primary }]}>{activeCount}</Text>
            <Text style={s.statLabel}>Active</Text>
          </View>
          <View style={[s.statCard, { borderColor: Colors.success }]}>
            <Text style={[s.statNum, { color: Colors.success }]}>
              {recentOrders.filter((o) => o.status === 'delivered').length}
            </Text>
            <Text style={s.statLabel}>Delivered</Text>
          </View>
        </View>

        {/* Driver contact card */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Your Driver</Text>
        </View>
        {driver ? (
          <TouchableOpacity
            style={s.driverCard}
            onPress={() => navigation.navigate('ContactDriver')}
            activeOpacity={0.85}
          >
            <View style={s.driverAvatar}>
              <Ionicons name="car" size={24} color={Colors.driverAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.driverName}>{driver.name}</Text>
              <Text style={s.driverPhone}>{driver.phone_number} · {driver.area_zone}</Text>
            </View>
            <View style={s.contactBtn}>
              <Ionicons name="call" size={18} color={Colors.white} />
              <Text style={s.contactBtnText}>Contact</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No active driver assigned yet</Text>
          </View>
        )}

        {/* Recent orders */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="receipt-outline" size={36} color={Colors.textHint} />
            <Text style={s.emptyText}>No orders yet — tap above to place your first order</Text>
          </View>
        ) : (
          recentOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <TouchableOpacity
                key={order.id}
                style={s.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                activeOpacity={0.85}
              >
                <View style={[s.statusDot, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderNum}>Order #{order.id}</Text>
                  <Text style={s.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('en-ZM', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  shopName: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  orderBanner: {
    backgroundColor: Colors.primary, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  orderBannerText: { flex: 1 },
  orderBannerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  orderBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 18 },
  orderBannerIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12,
    padding: 14, alignItems: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  driverCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.driverLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  driverAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.driverLight, justifyContent: 'center', alignItems: 'center',
  },
  driverName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  driverPhone: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.driverAccent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  contactBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusDot: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  orderNum: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  orderDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 28,
    alignItems: 'center', gap: 10, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { fontSize: 13, color: Colors.textHint, textAlign: 'center', lineHeight: 20 },
});