import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getOrdersByShop, Order } from '../../database/orders';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'ShopTabs'>;
};

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         color: Colors.warning,    bg: Colors.warningLight,  icon: 'time-outline' },
  confirmed:        { label: 'Confirmed',        color: Colors.primary,    bg: Colors.primaryLight,  icon: 'checkmark-circle-outline' },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.accent,     bg: '#FFF8EC',            icon: 'car-outline' },
  delivered:        { label: 'Delivered',        color: Colors.success,    bg: Colors.successLight,  icon: 'bag-check-outline' },
  cancelled:        { label: 'Cancelled',        color: Colors.danger,     bg: Colors.dangerLight,   icon: 'close-circle-outline' },
} as const;

const FILTERS = ['All', 'Pending', 'Active', 'Delivered', 'Cancelled'] as const;
type Filter = typeof FILTERS[number];

export default function OrderHistoryScreen({ navigation }: Props) {
  const shop = useAuthStore((s) => s.shop);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!shop) return;
    const data = await getOrdersByShop(shop.id);
    setOrders(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return o.status === 'pending';
    if (filter === 'Active') return o.status === 'confirmed' || o.status === 'out_for_delivery';
    if (filter === 'Delivered') return o.status === 'delivered';
    if (filter === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={s.container}>
      {/* Filter tabs */}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textHint} />
            <Text style={s.emptyTitle}>No orders found</Text>
            <Text style={s.emptyText}>
              {filter === 'All' ? "You haven't placed any orders yet" : `No ${filter.toLowerCase()} orders`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              activeOpacity={0.85}
            >
              <View style={[s.iconBox, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <Text style={s.orderId}>Order #{item.id}</Text>
                  <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.cardDate}>
                  {new Date(item.created_at).toLocaleDateString('en-ZM', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
                {item.note_to_driver ? (
                  <Text style={s.note} numberOfLines={1}>Note: {item.note_to_driver}</Text>
                ) : null}
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
  filterTab: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.background,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  pill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 12, color: Colors.textSecondary },
  note: { fontSize: 12, color: Colors.textHint, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, color: Colors.textSecondary },
});