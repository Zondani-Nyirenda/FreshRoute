import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { createShop, getShopByPhone } from '../../database/shops';
import { ZONES } from '../../constants/zones';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [zone, setZone] = useState('');
  const [showZones, setShowZones] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const setShop = useAuthStore((s) => s.setShop);

  const handleRegister = async () => {
    if (!shopName || !ownerName || !phone || !zone || !pin || !confirmPin) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN mismatch', 'Your PINs do not match.');
      return;
    }

    setLoading(true);
    try {
      const existing = await getShopByPhone(phone.trim());
      if (existing) {
        Alert.alert('Already registered', 'An account with this phone number already exists.');
        return;
      }

      const id = await createShop(
        shopName.trim(), ownerName.trim(), phone.trim(),
        zone, address.trim(), pin
      );

      const { getShopById } = await import('../../database/shops');
      const newShop = await getShopById(id);
      if (newShop) setShop(newShop);

    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, value, onChangeText, placeholder, keyboardType = 'default',
    secure = false, icon, maxLength
  }: any) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, { borderColor: value ? Colors.primary : Colors.border }]}>
        <Ionicons name={icon} size={20} color={Colors.textHint} style={s.inputIcon} />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textHint}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secure && !showPin}
          maxLength={maxLength}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPin(!showPin)} style={{ padding: 4 }}>
            <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textHint} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <Text style={s.heading}>Create your shop account</Text>
          <Text style={s.subheading}>You'll use your phone number and PIN to log in</Text>

          <Field label="Shop Name *" value={shopName} onChangeText={setShopName}
            placeholder="e.g. Chanda's Grocery" icon="storefront-outline" />

          <Field label="Owner Name *" value={ownerName} onChangeText={setOwnerName}
            placeholder="Your full name" icon="person-outline" />

          <Field label="Phone Number *" value={phone} onChangeText={setPhone}
            placeholder="e.g. 0977123456" icon="call-outline" keyboardType="phone-pad" maxLength={13} />

          {/* Zone picker */}
          <View style={{ marginBottom: 18 }}>
            <Text style={s.label}>Area / Zone *</Text>
            <TouchableOpacity
              style={[s.inputWrap, { borderColor: zone ? Colors.primary : Colors.border }]}
              onPress={() => setShowZones(!showZones)}
            >
              <Ionicons name="location-outline" size={20} color={Colors.textHint} style={s.inputIcon} />
              <Text style={[s.input, { color: zone ? Colors.textPrimary : Colors.textHint, paddingTop: 2 }]}>
                {zone || 'Select your area'}
              </Text>
              <Ionicons name={showZones ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textHint} />
            </TouchableOpacity>
            {showZones && (
              <View style={s.zoneDropdown}>
                {ZONES.map((z) => (
                  <TouchableOpacity
                    key={z}
                    style={[s.zoneItem, zone === z && s.zoneItemActive]}
                    onPress={() => { setZone(z); setShowZones(false); }}
                  >
                    <Text style={[s.zoneText, zone === z && { color: Colors.primary, fontWeight: '700' }]}>{z}</Text>
                    {zone === z && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Field label="Address / Directions (optional)" value={address} onChangeText={setAddress}
            placeholder="e.g. Near Shoprite Woodlands" icon="map-outline" />

          <Field label="Create 4-Digit PIN *" value={pin} onChangeText={setPin}
            placeholder="••••" icon="lock-closed-outline" keyboardType="number-pad"
            secure maxLength={4} />

          <Field label="Confirm PIN *" value={confirmPin} onChangeText={setConfirmPin}
            placeholder="••••" icon="lock-closed-outline" keyboardType="number-pad"
            secure maxLength={4} />

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.loginLink} onPress={() => navigation.goBack()}>
            <Text style={s.loginText}>
              Already have an account?{' '}
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, paddingTop: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.primaryDark, marginBottom: 6 },
  subheading: { fontSize: 14, color: Colors.textSecondary, marginBottom: 28, lineHeight: 20 },
  label: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderRadius: 12, backgroundColor: Colors.background,
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  zoneDropdown: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12,
    backgroundColor: Colors.white, marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  zoneItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  zoneItemActive: { backgroundColor: Colors.primaryLight },
  zoneText: { fontSize: 15, color: Colors.textPrimary },
  btn: {
    height: 52, borderRadius: 12, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { fontSize: 14, color: Colors.textSecondary },
});