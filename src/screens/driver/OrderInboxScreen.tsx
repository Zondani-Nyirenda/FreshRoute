import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAllOrdersWithShop, Order } from '../../database/orders';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'DriverTabs'>;
};

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         color: Colors.warning,  bg: Colors.warningLight,  icon: 'time-outline' },
  confirmed:        { label: 'Confirmed',        color: Colors.primary,  bg: Colors.primaryLight,  icon: 'checkmark-circle-outline' },
  out_for_delivery: { label: 'On the way',       color: Colors.accent,   bg: '#FFF8EC',            icon: 'car-outline' },
  delivered:        { label: 'Delivered',        color: Colors.success,  bg: Colors.successLight,  icon: 'bag-check-outline' },
  cancelled:        { label: 'Cancelled',        color: Colors.danger,   bg: Colors.dangerLight,   icon: 'close-circle-outline' },
} as const;

const FILTERS = ['All', 'Pending', 'Active', 'Delivered'] as const;
type Filter = typeof FILTERS[number];

export default function OrderInboxScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getAllOrdersWithShop();
    setOrders(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return o.status === 'pending';
    if (filter === 'Active') return o.status === 'confirmed' || o.status === 'out_for_delivery';
    if (filter === 'Delivered') return o.status === 'delivered';
    return true;
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.driverAccent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.textHint} />
            <Text style={s.emptyTitle}>No orders</Text>
            <Text style={s.emptyText}>Pull down to refresh</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('DriverOrderDetail', { orderId: item.id })}
              activeOpacity={0.85}
            >
              <View style={[s.iconBox, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <Text style={s.shopName}>{item.shop_name}</Text>
                  <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.meta}>
                  {item.area_zone} · Order #{item.id}
                </Text>
                <Text style={s.time}>
                  {new Date(item.created_at).toLocaleString('en-ZM', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textHint} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterRow: {
    flexDirection: 'row', backgroundColor: Colors.white,
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.background },
  filterTabActive: { backgroundColor: Colors.driverAccent },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  iconBox: { width: 46, height: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  pill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 12, color: Colors.textSecondary },
  time: { fontSize: 11, color: Colors.textHint },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, color: Colors.textSecondary },
});