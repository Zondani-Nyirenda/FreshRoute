import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { updateShop } from '../../database/shops';
import { ZONES } from '../../constants/zones';

export default function ShopProfileScreen() {
  const { shop, setShop, logout } = useAuthStore();
  const [shopName, setShopName] = useState(shop?.shop_name ?? '');
  const [ownerName, setOwnerName] = useState(shop?.owner_name ?? '');
  const [zone, setZone] = useState(shop?.area_zone ?? '');
  const [address, setAddress] = useState(shop?.address_description ?? '');
  const [showZones, setShowZones] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!shop || !shopName || !ownerName || !zone) {
      Alert.alert('Missing fields', 'Shop name, owner name and zone are required.');
      return;
    }
    setSaving(true);
    try {
      await updateShop(shop.id, shopName, ownerName, zone, address);
      setShop({ ...shop, shop_name: shopName, owner_name: ownerName, area_zone: zone, address_description: address });
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.primary} style={s.infoIcon} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{shop?.shop_name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.shopNameText}>{shop?.shop_name}</Text>
          <Text style={s.shopZone}>{shop?.area_zone}</Text>
          <TouchableOpacity style={s.editToggle} onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={16} color={Colors.primary} />
            <Text style={s.editToggleText}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {!editing ? (
          <View style={s.card}>
            <InfoRow icon="storefront-outline" label="Shop Name" value={shop?.shop_name ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="person-outline" label="Owner Name" value={shop?.owner_name ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="call-outline" label="Phone Number" value={shop?.phone_number ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="location-outline" label="Area / Zone" value={shop?.area_zone ?? ''} />
            <View style={s.divider} />
            <InfoRow icon="map-outline" label="Address / Directions" value={shop?.address_description ?? ''} />
          </View>
        ) : (
          <View style={s.card}>
            {[
              { label: 'Shop Name', value: shopName, setter: setShopName, icon: 'storefront-outline', kb: 'default' },
              { label: 'Owner Name', value: ownerName, setter: setOwnerName, icon: 'person-outline', kb: 'default' },
              { label: 'Address / Directions', value: address, setter: setAddress, icon: 'map-outline', kb: 'default' },
            ].map((f) => (
              <View key={f.label} style={s.fieldWrap}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <View style={s.inputWrap}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.textHint} style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    value={f.value}
                    onChangeText={f.setter}
                    keyboardType={f.kb as any}
                    placeholderTextColor={Colors.textHint}
                  />
                </View>
              </View>
            ))}

            {/* Zone picker */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Area / Zone</Text>
              <TouchableOpacity
                style={s.inputWrap}
                onPress={() => setShowZones(!showZones)}
              >
                <Ionicons name="location-outline" size={18} color={Colors.textHint} style={s.inputIcon} />
                <Text style={[s.input, { color: zone ? Colors.textPrimary : Colors.textHint, paddingTop: 2 }]}>
                  {zone || 'Select zone'}
                </Text>
                <Ionicons name={showZones ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textHint} />
              </TouchableOpacity>
              {showZones && (
                <View style={s.zoneDropdown}>
                  {ZONES.map((z) => (
                    <TouchableOpacity
                      key={z}
                      style={[s.zoneItem, zone === z && s.zoneActive]}
                      onPress={() => { setZone(z); setShowZones(false); }}
                    >
                      <Text style={[s.zoneText, zone === z && { color: Colors.primary, fontWeight: '700' }]}>{z}</Text>
                      {zone === z && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.white },
  shopNameText: { fontSize: 20, fontWeight: '800', color: Colors.primaryDark },
  shopZone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  editToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  editToggleText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  infoIcon: { marginTop: 2 },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 15, color: Colors.textPrimary, marginTop: 2, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  fieldWrap: { padding: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, height: 46,
    backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  zoneDropdown: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10,
    backgroundColor: Colors.white, marginTop: 4, overflow: 'hidden',
  },
  zoneItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  zoneActive: { backgroundColor: Colors.primaryLight },
  zoneText: { fontSize: 14, color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.primary, margin: 12, borderRadius: 10,
    height: 46, justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 12,
    backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.danger,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});