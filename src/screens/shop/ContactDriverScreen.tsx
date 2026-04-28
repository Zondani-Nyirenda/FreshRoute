import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getActiveDriver, Driver } from '../../database/drivers';

export default function ContactDriverScreen() {
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => { getActiveDriver().then(setDriver); }, []);

  const call = () => {
    if (!driver) return;
    Linking.openURL(`tel:${driver.phone_number}`).catch(() =>
      Alert.alert('Error', 'Could not open phone app.')
    );
  };

  const sms = () => {
    if (!driver) return;
    Linking.openURL(`sms:${driver.phone_number}`).catch(() =>
      Alert.alert('Error', 'Could not open messages app.')
    );
  };

  const whatsapp = () => {
    if (!driver) return;
    const num = driver.phone_number.replace(/^0/, '260');
    Linking.openURL(`https://wa.me/${num}`).catch(() =>
      Alert.alert('WhatsApp not installed', 'Please call or SMS instead.')
    );
  };

  if (!driver) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.empty}>
          <Ionicons name="car-outline" size={48} color={Colors.textHint} />
          <Text style={s.emptyTitle}>No active driver</Text>
          <Text style={s.emptyText}>There is no driver assigned to your area right now.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>

        {/* Driver card */}
        <View style={s.driverCard}>
          <View style={s.avatar}>
            <Ionicons name="car" size={36} color={Colors.driverAccent} />
          </View>
          <Text style={s.driverName}>{driver.name}</Text>
          <Text style={s.driverZone}>{driver.area_zone} Route</Text>
          <View style={s.phoneChip}>
            <Ionicons name="call" size={14} color={Colors.driverAccent} />
            <Text style={s.phoneText}>{driver.phone_number}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <Text style={s.actionsLabel}>How would you like to reach them?</Text>

        <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.driverAccent }]} onPress={call} activeOpacity={0.85}>
          <View style={s.actionIcon}>
            <Ionicons name="call" size={24} color={Colors.driverAccent} />
          </View>
          <View style={s.actionText}>
            <Text style={s.actionTitle}>Call Driver</Text>
            <Text style={s.actionSub}>Opens your phone dialler</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.primary }]} onPress={sms} activeOpacity={0.85}>
          <View style={[s.actionIcon, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
          </View>
          <View style={s.actionText}>
            <Text style={s.actionTitle}>Send SMS</Text>
            <Text style={s.actionSub}>Opens your messages app</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#25D366' }]} onPress={whatsapp} activeOpacity={0.85}>
          <View style={[s.actionIcon, { backgroundColor: '#d4f7e0' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </View>
          <View style={s.actionText}>
            <Text style={s.actionTitle}>WhatsApp</Text>
            <Text style={s.actionSub}>Opens WhatsApp chat</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24 },
  driverCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8, marginBottom: 28,
    borderWidth: 1, borderColor: Colors.driverLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.driverLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  driverName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  driverZone: { fontSize: 14, color: Colors.textSecondary },
  phoneChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.driverLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginTop: 4,
  },
  phoneText: { fontSize: 14, fontWeight: '700', color: Colors.driverAccent },
  actionsLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  actionBtn: {
    borderRadius: 14, padding: 16, flexDirection: 'row',
    alignItems: 'center', gap: 14, marginBottom: 12,
  },
  actionIcon: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});