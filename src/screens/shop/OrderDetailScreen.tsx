import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getOrderItems, OrderItem, Order } from '../../database/orders';
import db from '../../database/database';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'OrderDetail'>;
  route: RouteProp<ShopStackParamList, 'OrderDetail'>;
};

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         color: Colors.warning,  bg: Colors.warningLight,  icon: 'time-outline',            step: 1 },
  confirmed:        { label: 'Confirmed',        color: Colors.primary,  bg: Colors.primaryLight,  icon: 'checkmark-circle-outline', step: 2 },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.accent,   bg: '#FFF8EC',            icon: 'car-outline',              step: 3 },
  delivered:        { label: 'Delivered',        color: Colors.success,  bg: Colors.successLight,  icon: 'bag-check-outline',        step: 4 },
  cancelled:        { label: 'Cancelled',        color: Colors.danger,   bg: Colors.dangerLight,   icon: 'close-circle-outline',     step: 0 },
} as const;

const STEPS = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const o = await db.getFirstAsync<Order>('SELECT * FROM orders WHERE id = ?', [orderId]);
      const i = await getOrderItems(orderId);
      setOrder(o ?? null);
      setItems(i);
    };
    load();
  }, [orderId]);

  if (!order) return null;

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Status banner */}
        <View style={[s.statusBanner, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={32} color={cfg.color} />
          <View style={{ flex: 1 }}>
            <Text style={[s.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={s.statusDate}>
              {new Date(order.created_at).toLocaleString('en-ZM', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={[s.orderId, { color: cfg.color }]}>#{order.id}</Text>
        </View>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <View style={s.progressWrap}>
            {STEPS.map((step, idx) => {
              const done = cfg.step > idx;
              const active = cfg.step === idx + 1;
              return (
                <View key={step} style={s.stepItem}>
                  <View style={[
                    s.stepDot,
                    done && { backgroundColor: Colors.success, borderColor: Colors.success },
                    active && { borderColor: Colors.primary },
                  ]}>
                    {done
                      ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                      : <View style={[s.stepInner, active && { backgroundColor: Colors.primary }]} />
                    }
                  </View>
                  <Text style={[s.stepLabel, (done || active) && { color: Colors.textPrimary, fontWeight: '600' }]}>
                    {step}
                  </Text>
                  {idx < STEPS.length - 1 && (
                    <View style={[s.stepLine, done && { backgroundColor: Colors.success }]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Items */}
        <Text style={s.sectionTitle}>Items Ordered</Text>
        <View style={s.card}>
          {items.map((item, idx) => (
            <View key={item.id} style={[s.itemRow, idx < items.length - 1 && s.itemBorder]}>
              <Text style={s.itemName}>{item.product_name}</Text>
              <View style={s.itemRight}>
                <Text style={s.itemQty}>×{item.quantity}</Text>
                <Text style={s.itemSubtotal}>K{(item.unit_price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalAmt}>K{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Note */}
        {order.note_to_driver ? (
          <>
            <Text style={s.sectionTitle}>Note to Driver</Text>
            <View style={[s.card, { padding: 14 }]}>
              <Text style={s.noteText}>{order.note_to_driver}</Text>
            </View>
          </>
        ) : null}

        <TouchableOpacity
          style={s.contactBtn}
          onPress={() => navigation.navigate('ContactDriver')}
          activeOpacity={0.85}
        >
          <Ionicons name="call-outline" size={20} color={Colors.white} />
          <Text style={s.contactBtnText}>Contact Driver</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  statusBanner: {
    borderRadius: 16, padding: 18, flexDirection: 'row',
    alignItems: 'center', gap: 14, marginBottom: 20,
  },
  statusLabel: { fontSize: 17, fontWeight: '800' },
  statusDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  orderId: { fontSize: 18, fontWeight: '800' },
  progressWrap: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: 14, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border,
  },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.white, zIndex: 1,
  },
  stepInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepLabel: { fontSize: 9, color: Colors.textHint, marginTop: 6, textAlign: 'center', fontWeight: '500' },
  stepLine: {
    position: 'absolute', top: 11, left: '50%', right: '-50%',
    height: 2, backgroundColor: Colors.border, zIndex: 0,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemQty: { fontSize: 12, color: Colors.textSecondary },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, backgroundColor: Colors.primaryLight,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  totalAmt: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  noteText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  contactBtn: {
    backgroundColor: Colors.driverAccent, borderRadius: 12, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  contactBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});