import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Linking
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  getOrderItems, updateOrderStatus,
  OrderItem, Order, OrderStatus
} from '../../database/orders';
import { useAuthStore } from '../../store/authStore';
import db from '../../database/database';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'DriverOrderDetail'>;
  route: RouteProp<DriverStackParamList, 'DriverOrderDetail'>;
};

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; color: string }>> = {
  pending:          { status: 'confirmed',        label: 'Accept Order',       color: Colors.primary },
  confirmed:        { status: 'out_for_delivery', label: 'Mark Out for Delivery', color: Colors.accent },
  out_for_delivery: { status: 'delivered',        label: 'Mark as Delivered',  color: Colors.success },
};

export default function DriverOrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const driver = useAuthStore((s) => s.driver);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const o = await db.getFirstAsync<Order>(`
      SELECT o.*, s.shop_name, s.owner_name, s.area_zone, s.phone_number
      FROM orders o JOIN shops s ON o.shop_id = s.id
      WHERE o.id = ?
    `, [orderId]);
    const i = await getOrderItems(orderId);
    setOrder(o ?? null);
    setItems(i);
  };

  useEffect(() => { load(); }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !driver) return;
    setLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus, driver.id);
      await load();
      if (newStatus === 'delivered') {
        Alert.alert('Delivered!', `Order #${order.id} marked as delivered.`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive',
          onPress: async () => {
            await updateOrderStatus(order!.id, 'cancelled');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const callShop = () => {
    if (!order?.phone_number) return;
    Linking.openURL(`tel:${order.phone_number}`).catch(() =>
      Alert.alert('Error', 'Could not open phone app.')
    );
  };

  const smsShop = () => {
    if (!order?.phone_number) return;
    Linking.openURL(`sms:${order.phone_number}`).catch(() =>
      Alert.alert('Error', 'Could not open messages app.')
    );
  };

  if (!order) return null;

  const nextAction = NEXT_STATUS[order.status];
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Shop info */}
        <View style={s.shopCard}>
          <View style={s.shopAvatar}>
            <Ionicons name="storefront" size={24} color={Colors.driverAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.shopName}>{order.shop_name}</Text>
            <Text style={s.shopMeta}>{order.area_zone} · {order.phone_number}</Text>
          </View>
          <TouchableOpacity style={s.callBtn} onPress={callShop}>
            <Ionicons name="call" size={18} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={s.smsBtn} onPress={smsShop}>
            <Ionicons name="chatbubble" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Order items */}
        <Text style={s.sectionTitle}>Items</Text>
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
            <Text style={s.sectionTitle}>Note from Shop</Text>
            <View style={[s.card, s.noteCard]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
              <Text style={s.noteText}>{order.note_to_driver}</Text>
            </View>
          </>
        ) : null}

        {/* Actions */}
        {nextAction && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: nextAction.color }, loading && { opacity: 0.6 }]}
            onPress={() => handleStatusUpdate(nextAction.status)}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.white} />
            <Text style={s.actionBtnText}>{loading ? 'Updating...' : nextAction.label}</Text>
          </TouchableOpacity>
        )}

        {order.status === 'pending' || order.status === 'confirmed' ? (
          <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
            <Text style={s.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  shopCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.driverLight,
  },
  shopAvatar: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.driverLight, justifyContent: 'center', alignItems: 'center',
  },
  shopName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  shopMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  callBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.driverAccent, justifyContent: 'center', alignItems: 'center',
  },
  smsBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    marginBottom: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemQty: { fontSize: 12, color: Colors.textSecondary },
  itemSubtotal: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, backgroundColor: Colors.driverLight,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.driverAccent },
  totalAmt: { fontSize: 18, fontWeight: '800', color: Colors.driverAccent },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  noteText: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  actionBtn: {
    borderRadius: 12, height: 52, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  actionBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.danger, backgroundColor: Colors.dangerLight,
  },
  cancelBtnText: { color: Colors.danger, fontSize: 15, fontWeight: '700' },
});