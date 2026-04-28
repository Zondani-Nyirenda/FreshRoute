import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Linking, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getAllShops, Shop } from '../../database/shops';

export default function ShopDirectoryScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { setShops(await getAllShops()); };
  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = shops.filter((s) =>
    s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    s.area_zone.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  const call = (phone: string) => Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open phone.'));
  const sms  = (phone: string) => Linking.openURL(`sms:${phone}`).catch(() => Alert.alert('Error', 'Could not open messages.'));

  return (
    <SafeAreaView style={s.container}>
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textHint} />
        <TextInput
          style={s.searchInput}
          placeholder="Search shops, zones, owners..."
          placeholderTextColor={Colors.textHint}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textHint} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.driverAccent} />}
        ListHeaderComponent={
          <Text style={s.count}>{filtered.length} shop{filtered.length !== 1 ? 's' : ''}</Text>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={44} color={Colors.textHint} />
            <Text style={s.emptyText}>{search ? 'No shops match your search' : 'No shops registered yet'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardLeft}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.shop_name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.shopName}>{item.shop_name}</Text>
                <Text style={s.ownerName}>{item.owner_name}</Text>
                <View style={s.tagRow}>
                  <View style={s.zoneTag}>
                    <Ionicons name="location-outline" size={11} color={Colors.primary} />
                    <Text style={s.zoneText}>{item.area_zone}</Text>
                  </View>
                  {item.address_description ? (
                    <Text style={s.address} numberOfLines={1}>{item.address_description}</Text>
                  ) : null}
                </View>
                <Text style={s.phone}>{item.phone_number}</Text>
              </View>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.callBtn} onPress={() => call(item.phone_number)}>
                <Ionicons name="call" size={18} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={s.smsBtn} onPress={() => sms(item.phone_number)}>
                <Ionicons name="chatbubble" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, margin: 16, borderRadius: 12,
    paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  count: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  shopName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  ownerName: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  zoneTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  zoneText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  address: { fontSize: 11, color: Colors.textHint, flex: 1 },
  phone: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  actions: { gap: 8, marginLeft: 8 },
  callBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.driverAccent, justifyContent: 'center', alignItems: 'center',
  },
  smsBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});