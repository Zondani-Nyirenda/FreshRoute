import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '../../database/orders';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'OrderConfirm'>;
  route: RouteProp<ShopStackParamList, 'OrderConfirm'>;
};

export default function OrderConfirmScreen({ navigation, route }: Props) {
  const { items } = route.params;
  const shop = useAuthStore((s) => s.shop);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const orderId = await createOrder(
        shop.id,
        items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        note
      );
      navigation.replace('OrderSuccess', { orderId });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.heading}>Review your order</Text>
        <Text style={s.subheading}>From: {shop?.shop_name} · {shop?.area_zone}</Text>

        {/* Items */}
        <View style={s.card}>
          {items.map((item, idx) => (
            <View key={item.product_id} style={[s.itemRow, idx < items.length - 1 && s.itemBorder]}>
              <View style={s.itemLeft}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemUnit}>K{item.unit_price.toFixed(2)} each</Text>
              </View>
              <View style={s.itemRight}>
                <Text style={s.itemQty}>×{item.quantity}</Text>
                <Text style={s.itemSubtotal}>K{(item.unit_price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalAmount}>K{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Note */}
        <Text style={s.label}>Note to driver (optional)</Text>
        <View style={s.noteWrap}>
          <TextInput
            style={s.noteInput}
            placeholder="e.g. Please call when you arrive..."
            placeholderTextColor={Colors.textHint}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Confirm */}
        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
          <Text style={s.btnText}>{loading ? 'Placing order...' : 'Place Order'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>Edit order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark, marginBottom: 4 },
  subheading: { fontSize: 13, color: Colors.textSecondary, marginBottom: 24 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 4,
    marginBottom: 24, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  itemUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemQty: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  itemSubtotal: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, backgroundColor: Colors.primaryLight, borderRadius: 12, margin: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark },
  totalAmount: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  label: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  noteWrap: {
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.border, marginBottom: 24, padding: 4,
  },
  noteInput: { padding: 10, fontSize: 14, color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 12, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});