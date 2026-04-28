import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAllOrdersWithShop, Order } from '../../database/orders';

export default function RouteSummaryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getAllOrdersWithShop().then((data) => {
      setOrders(data.filter((o) => o.status === 'confirmed' || o.status === 'out_for_delivery'));
    });
  }, []);

  const byZone: Record<string, Order[]> = {};
  orders.forEach((o) => {
    const zone = o.area_zone ?? 'Unknown';
    if (!byZone[zone]) byZone[zone] = [];
    byZone[zone].push(o);
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.summaryHeader}>
          <Ionicons name="map" size={28} color={Colors.driverAccent} />
          <View>
            <Text style={s.summaryTitle}>{orders.length} stop{orders.length !== 1 ? 's' : ''} today</Text>
            <Text style={s.summaryZones}>{Object.keys(byZone).length} zone{Object.keys(byZone).length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {Object.keys(byZone).length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="map-outline" size={44} color={Colors.textHint} />
            <Text style={s.emptyTitle}>No confirmed stops yet</Text>
            <Text style={s.emptyText}>Accept orders from the inbox to build your route</Text>
          </View>
        ) : (
          Object.entries(byZone).map(([zone, zoneOrders]) => (
            <View key={zone} style={s.zoneSection}>
              <View style={s.zoneHeader}>
                <Ionicons name="location" size={16} color={Colors.driverAccent} />
                <Text style={s.zoneTitle}>{zone}</Text>
                <View style={s.zoneBadge}>
                  <Text style={s.zoneBadgeText}>{zoneOrders.length}</Text>
                </View>
              </View>
              {zoneOrders.map((order, idx) => (
                <View key={order.id} style={s.stopCard}>
                  <View style={s.stopNum}>
                    <Text style={s.stopNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stopShop}>{order.shop_name}</Text>
                    <Text style={s.stopOwner}>{order.owner_name} · {order.phone_number}</Text>
                  </View>
                  <View style={[
                    s.statusDot,
                    { backgroundColor: order.status === 'out_for_delivery' ? Colors.accent : Colors.primary }
                  ]}>
                    <Ionicons
                      name={order.status === 'out_for_delivery' ? 'car' : 'checkmark'}
                      size={12}
                      color={Colors.white}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  summaryHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.driverLight, borderRadius: 14, padding: 16, marginBottom: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: Colors.driverAccent },
  summaryZones: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  zoneSection: { marginBottom: 20 },
  zoneHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 10,
  },
  zoneTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  zoneBadge: {
    backgroundColor: Colors.driverAccent, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  zoneBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  stopCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  stopNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.driverLight, justifyContent: 'center', alignItems: 'center',
  },
  stopNumText: { fontSize: 13, fontWeight: '800', color: Colors.driverAccent },
  stopShop: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  stopOwner: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  stopAddress: { fontSize: 11, color: Colors.textHint, marginTop: 2 },
  statusDot: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});