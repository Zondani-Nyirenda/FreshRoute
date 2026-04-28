import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getShopByPhone } from '../../database/shops';
import { getDriverByPhone } from '../../database/drivers';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation, route }: Props) {
  const { role } = route.params;
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const setShop = useAuthStore((s) => s.setShop);
  const setDriver = useAuthStore((s) => s.setDriver);

  const isShop = role === 'shop';
  const accent = isShop ? Colors.primary : Colors.driverAccent;

  const handleLogin = async () => {
    if (!phone.trim() || !pin.trim()) {
      Alert.alert('Missing fields', 'Please enter your phone number and PIN.');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Your PIN must be 4 digits.');
      return;
    }
    setLoading(true);
    try {
      if (isShop) {
        const shop = await getShopByPhone(phone.trim());
        if (!shop) {
          Alert.alert('Not found', 'No account found with that phone number.');
          return;
        }
        if (shop.pin !== pin) {
          Alert.alert('Wrong PIN', 'The PIN you entered is incorrect.');
          return;
        }
        setShop(shop);
      } else {
        const driver = await getDriverByPhone(phone.trim());
        if (!driver) {
          Alert.alert('Not found', 'No driver account found with that phone number.');
          return;
        }
        if (driver.pin !== pin) {
          Alert.alert('Wrong PIN', 'The PIN you entered is incorrect.');
          return;
        }
        setDriver(driver);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Icon banner */}
          <View style={[s.banner, { backgroundColor: isShop ? Colors.primaryLight : Colors.driverLight }]}>
            <Ionicons
              name={isShop ? 'storefront-outline' : 'car-outline'}
              size={48}
              color={accent}
            />
            <Text style={[s.bannerTitle, { color: accent }]}>
              {isShop ? 'Shop Owner Login' : 'Driver Login'}
            </Text>
          </View>

          <Text style={s.label}>Phone Number</Text>
          <View style={[s.inputWrap, { borderColor: phone ? accent : Colors.border }]}>
            <Ionicons name="call-outline" size={20} color={Colors.textHint} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="e.g. 0977123456"
              placeholderTextColor={Colors.textHint}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={13}
            />
          </View>

          <Text style={s.label}>4-Digit PIN</Text>
          <View style={[s.inputWrap, { borderColor: pin ? accent : Colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textHint} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="••••"
              placeholderTextColor={Colors.textHint}
              keyboardType="number-pad"
              secureTextEntry={!showPin}
              value={pin}
              onChangeText={setPin}
              maxLength={4}
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)} style={s.eyeBtn}>
              <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textHint} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, { backgroundColor: accent }, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          {isShop && (
            <TouchableOpacity style={s.registerLink} onPress={() => navigation.navigate('Register')}>
              <Text style={s.registerText}>
                Don't have an account?{' '}
                <Text style={{ color: accent, fontWeight: '700' }}>Register here</Text>
              </Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 24, paddingTop: 16 },
  banner: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeBtn: { padding: 4 },
  btn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { fontSize: 14, color: Colors.textSecondary },
});