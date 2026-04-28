import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAllProducts, Product } from '../../database/products';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'Catalogue'>;
};

type CartItem = Product & { quantity: number };

export default function CatalogueScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartItems: CartItem[] = products
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ ...p, quantity: cart[p.id] }));

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty cart', 'Please add at least one item.');
      return;
    }
    navigation.navigate('OrderConfirm', {
      items: cartItems.map((i) => ({
        product_id: i.id,
        name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
      })),
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <Text style={s.heading}>What do you need today?</Text>
        }
        renderItem={({ item }) => {
          const qty = cart[item.id] ?? 0;
          return (
            <View style={s.productCard}>
              <View style={s.productIcon}>
                <Ionicons
                  name={item.name.toLowerCase().includes('egg') ? 'egg-outline' : 'fast-food-outline'}
                  size={26}
                  color={Colors.primary}
                />
              </View>
              <View style={s.productInfo}>
                <Text style={s.productName}>{item.name}</Text>
                <Text style={s.productUnit}>{item.unit_description}</Text>
                <Text style={s.productPrice}>K{item.price.toFixed(2)}</Text>
              </View>
              <View style={s.qtyControl}>
                <TouchableOpacity
                  style={[s.qtyBtn, qty === 0 && s.qtyBtnDisabled]}
                  onPress={() => updateQty(item.id, -1)}
                  disabled={qty === 0}
                >
                  <Ionicons name="remove" size={18} color={qty === 0 ? Colors.textHint : Colors.primary} />
                </TouchableOpacity>
                <Text style={s.qtyText}>{qty}</Text>
                <TouchableOpacity style={s.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Cart summary bar */}
      {cartCount > 0 && (
        <View style={s.cartBar}>
          <View>
            <Text style={s.cartCount}>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</Text>
            <Text style={s.cartTotal}>K{cartTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
            <Text style={s.checkoutText}>Review Order</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 20, paddingBottom: 120 },
  heading: { fontSize: 20, fontWeight: '800', color: Colors.primaryDark, marginBottom: 16 },
  productCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productIcon: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  productUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginTop: 4 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnDisabled: { backgroundColor: Colors.background },
  qtyText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.primaryDark, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 28,
  },
  cartCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  cartTotal: { fontSize: 20, fontWeight: '800', color: Colors.white },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
  },
  checkoutText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});