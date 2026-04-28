import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Image, StatusBar
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>;
};

export default function RoleSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoCircle}>
          <Ionicons name="leaf" size={40} color={Colors.white} />
        </View>
        <Text style={s.appName}>FreshRoute</Text>
        <Text style={s.tagline}>Eggs & Bread — Delivered Smart</Text>
      </View>

      {/* Role Cards */}
      <View style={s.cardsContainer}>
        <Text style={s.chooseText}>Who are you?</Text>

        <TouchableOpacity
          style={[s.card, s.shopCard]}
          onPress={() => navigation.navigate('Login', { role: 'shop' })}
          activeOpacity={0.85}
        >
          <View style={[s.cardIcon, { backgroundColor: Colors.primaryLight }]}>
            <Ionicons name="storefront-outline" size={36} color={Colors.primary} />
          </View>
          <View style={s.cardText}>
            <Text style={[s.cardTitle, { color: Colors.primaryDark }]}>Shop Owner</Text>
            <Text style={s.cardDesc}>Browse products and place orders when you need stock</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.card, s.driverCard]}
          onPress={() => navigation.navigate('Login', { role: 'driver' })}
          activeOpacity={0.85}
        >
          <View style={[s.cardIcon, { backgroundColor: Colors.driverLight }]}>
            <Ionicons name="car-outline" size={36} color={Colors.driverAccent} />
          </View>
          <View style={s.cardText}>
            <Text style={[s.cardTitle, { color: Colors.driverAccent }]}>Driver</Text>
            <Text style={s.cardDesc}>View incoming orders and manage deliveries for your route</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={Colors.driverAccent} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>New shop owner?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.footerLink}> Create an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  chooseText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shopCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  driverCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.driverAccent,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});