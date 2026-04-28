import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { getMe, updateProfile } from '../../services/settingsService';
import { pickImage, uploadProfilePhoto } from '../../services/imageService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me) {
        setName(me.name || '');
        setBio(me.bio || '');
        setPhotoUrl(me.profilePicture || null);
      }
      setLoading(false);
    })();
  }, []);

  const handlePickPhoto = async () => {
    const r = await pickImage();
    if (r.canceled) return;
    if (!r.success) return Alert.alert('Could not pick photo', r.error);
    setPhotoUri(r.uri);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter your name.');
    setSaving(true);

    let finalPhotoUrl = photoUrl;
    if (photoUri) {
      setUploading(true);
      const up = await uploadProfilePhoto(photoUri);
      setUploading(false);
      if (!up.success) {
        setSaving(false);
        return Alert.alert('Upload failed', up.error);
      }
      finalPhotoUrl = up.url;
    }

    const res = await updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      profilePicture: finalPhotoUrl,
    });
    setSaving(false);

    if (res.success) {
      // Refresh local user — Firebase auth displayName updates server-side
      try { await user.reload(); } catch {}
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Could not save', res.error);
    }
  };

  const initials = (name || user?.email || '?')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.85} style={styles.avatarWrap}>
              {photoUri || photoUrl ? (
                <Image source={{ uri: photoUri || photoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={Colors.textOnDark} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>
              {uploading ? 'Uploading…' : 'Tap to change photo'}
            </Text>
          </View>

          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />

          <View style={styles.bioWrap}>
            <Text style={styles.bioLabel}>Bio</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="A line about you (optional)"
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.readonlyCard}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={styles.readonlyLabel}>Email</Text>
              <Text style={styles.readonlyValue}>{user?.email}</Text>
            </View>
          </View>

          <Button title="Save changes" onPress={handleSave} loading={saving} style={{ marginTop: Spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Spacing.md, marginBottom: Spacing.lg,
  },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  avatarSection: { alignItems: 'center', marginVertical: Spacing.lg },
  avatarWrap: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarFallback: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: Colors.textOnDark, fontSize: 40, fontFamily: Fonts.display },
  cameraBadge: {
    position: 'absolute', right: 0, bottom: 4,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.background,
  },
  avatarHint: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, marginTop: Spacing.md,
  },
  bioWrap: { marginBottom: Spacing.md },
  bioLabel: {
    fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, marginBottom: 6, letterSpacing: 0.3,
  },
  readonlyCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'center',
    backgroundColor: Colors.surfaceMuted, padding: Spacing.md,
    borderRadius: Radius.md, marginTop: Spacing.sm,
  },
  readonlyLabel: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.textSecondary, letterSpacing: 0.4 },
  readonlyValue: { fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textPrimary, marginTop: 2 },
});