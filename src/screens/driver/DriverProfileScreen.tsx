import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function DriverProfileScreen() {
  const { driver, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.avatar}>
          <Ionicons name="car" size={36} color={Colors.white} />
        </View>
        <Text style={s.name}>{driver?.name}</Text>
        <Text style={s.zone}>{driver?.area_zone} Route</Text>

        <View style={s.card}>
          {[
            { icon: 'call-outline',     label: 'Phone',      value: driver?.phone_number ?? '' },
            { icon: 'location-outline', label: 'Zone',       value: driver?.area_zone ?? '' },
          ].map((row) => (
            <View key={row.label}>
              <View style={s.row}>
                <Ionicons name={row.icon as any} size={18} color={Colors.driverAccent} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{row.label}</Text>
                  <Text style={s.rowValue}>{row.value}</Text>
                </View>
              </View>
              <View style={s.divider} />
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, alignItems: 'center' },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.driverAccent, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, marginTop: 12,
    shadowColor: Colors.driverAccent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  zone: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  card: {
    width: '100%', backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16 },
  rowLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  rowValue: { fontSize: 15, color: Colors.textPrimary, marginTop: 2, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', height: 52, borderRadius: 12,
    backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.danger,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});