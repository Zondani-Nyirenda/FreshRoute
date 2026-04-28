import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ShopStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<ShopStackParamList, 'OrderSuccess'>;
  route: RouteProp<ShopStackParamList, 'OrderSuccess'>;
};

export default function OrderSuccessScreen({ navigation, route }: Props) {
  const { orderId } = route.params;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconCircle}>
          <Ionicons name="checkmark" size={52} color={Colors.white} />
        </View>
        <Text style={s.title}>Order Placed!</Text>
        <Text style={s.subtitle}>
          Your order #{orderId} has been sent to the driver.{'\n'}
          You'll be notified when it's confirmed.
        </Text>

        <View style={s.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={s.infoText}>
            The driver will contact you if they have any questions about your order.
          </Text>
        </View>

        <TouchableOpacity
          style={s.trackBtn}
          onPress={() => navigation.replace('ShopTabs', undefined as any)}
          activeOpacity={0.85}
        >
          <Text style={s.trackBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.historyBtn}
          onPress={() => navigation.replace('ShopTabs', undefined as any)}
        >
          <Text style={s.historyBtnText}>View Order History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.success, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },
  infoBox: {
    flexDirection: 'row', gap: 10, backgroundColor: Colors.primaryLight,
    borderRadius: 12, padding: 14, marginBottom: 36, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 18 },
  trackBtn: {
    width: '100%', height: 52, backgroundColor: Colors.primary,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  trackBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  historyBtn: { width: '100%', height: 52, justifyContent: 'center', alignItems: 'center' },
  historyBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});