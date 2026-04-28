import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getAllOrdersWithShop, Order } from '../../database/orders';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'DriverTabs'>;
};

export default function DriverDashboardScreen({ navigation }: Props) {
  const driver = useAuthStore((s) => s.driver);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getAllOrdersWithShop();
    setOrders(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const pending = orders.filter((o) => o.status === 'pending');
  const active  = orders.filter((o) => o.status === 'confirmed' || o.status === 'out_for_delivery');
  const todayDelivered = orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const d = new Date(o.updated_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const zones = [...new Set(pending.map((o) => o.area_zone).filter(Boolean))];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.driverAccent} />}
      >
        {/* Greeting */}
        <View style={s.greetingRow}>
          <View>
            <Text style={s.greeting}>Good day,</Text>
            <Text style={s.driverName}>{driver?.name}</Text>
          </View>
          <View style={s.avatarCircle}>
            <Ionicons name="car" size={22} color={Colors.white} />
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsGrid}>
          <View style={[s.statCard, { borderColor: Colors.warning }]}>
            <Text style={[s.statNum, { color: Colors.warning }]}>{pending.length}</Text>
            <Text style={s.statLabel}>New Orders</Text>
          </View>
          <View style={[s.statCard, { borderColor: Colors.primary }]}>
            <Text style={[s.statNum, { color: Colors.primary }]}>{active.length}</Text>
            <Text style={s.statLabel}>In Progress</Text>
          </View>
          <View style={[s.statCard, { borderColor: Colors.success }]}>
            <Text style={[s.statNum, { color: Colors.success }]}>{todayDelivered.length}</Text>
            <Text style={s.statLabel}>Delivered Today</Text>
          </View>
        </View>

        {/* Route summary button */}
        <TouchableOpacity
          style={s.routeBtn}
          onPress={() => navigation.navigate('RouteSummary')}
          activeOpacity={0.85}
        >
          <View style={s.routeBtnLeft}>
            <Ionicons name="map-outline" size={24} color={Colors.white} />
            <View>
              <Text style={s.routeBtnTitle}>Today's Route Summary</Text>
              <Text style={s.routeBtnSub}>{active.length} confirmed stops across {zones.length} zone{zones.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Pending orders */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>New Orders</Text>
          {pending.length > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{pending.length}</Text>
            </View>
          )}
        </View>

        {pending.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="checkmark-done-outline" size={32} color={Colors.success} />
            <Text style={s.emptyText}>All caught up — no pending orders</Text>
          </View>
        ) : (
          pending.slice(0, 4).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={s.orderCard}
              onPress={() => navigation.navigate('DriverOrderDetail', { orderId: order.id })}
              activeOpacity={0.85}
            >
              <View style={s.orderIcon}>
                <Ionicons name="storefront-outline" size={20} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.orderShop}>{order.shop_name}</Text>
                <Text style={s.orderMeta}>{order.area_zone} · {new Date(order.created_at).toLocaleTimeString('en-ZM', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={s.newPill}>
                <Text style={s.newPillText}>NEW</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textHint} />
            </TouchableOpacity>
          ))
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
  driverName: { fontSize: 22, fontWeight: '800', color: Colors.driverAccent },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.driverAccent, justifyContent: 'center', alignItems: 'center',
  },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  routeBtn: {
    backgroundColor: Colors.driverAccent, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, gap: 12,
    shadowColor: Colors.driverAccent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  routeBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  routeBtnTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  routeBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  badge: {
    backgroundColor: Colors.warning, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 24,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { fontSize: 13, color: Colors.textSecondary },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  orderIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.warningLight, justifyContent: 'center', alignItems: 'center',
  },
  orderShop: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  orderMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  newPill: { backgroundColor: Colors.warningLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  newPillText: { fontSize: 10, fontWeight: '800', color: Colors.warning },
});