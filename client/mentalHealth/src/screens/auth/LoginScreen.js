import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { signIn } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Colors, Spacing, Fonts, FontSizes, Radius } from '../../config/theme';

const isExpoGo = Constants.appOwnership === 'expo';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.match(/\S+@\S+\.\S+/)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (!res.success) Alert.alert('Sign in failed', res.error);
    // No navigation — AppNavigator routes on auth state change
  };

  const handleGoogle = () => {
    if (isExpoGo) {
      Alert.alert(
        'Google Sign-In unavailable',
        'Google Sign-In requires a development build. Use email login while testing in Expo Go.'
      );
    } else {
      Alert.alert('Coming soon', 'Google Sign-In will be wired up after we set up the development build.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>
              Good to see{'\n'}
              <Text style={styles.titleItalic}>you again.</Text>
            </Text>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          <Button
            title="Sign in"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: Spacing.sm }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={handleGoogle}
            icon={<Ionicons name="logo-google" size={18} color={Colors.textPrimary} />}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            style={styles.swap}
          >
            <Text style={styles.swapText}>
              New here? <Text style={styles.swapBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  header: { marginBottom: Spacing.xl },
  eyebrow: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.accent, letterSpacing: 1.8,
    textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 40, fontFamily: Fonts.display,
    color: Colors.textPrimary, lineHeight: 46, letterSpacing: -0.5,
  },
  titleItalic: { fontFamily: Fonts.displayItalic, color: Colors.accent },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: Spacing.lg, gap: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: FontSizes.xs, fontFamily: Fonts.body,
    color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  swap: { alignItems: 'center', marginTop: Spacing.lg, paddingVertical: Spacing.sm },
  swapText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary,
  },
  swapBold: { fontFamily: Fonts.bodyMedium, color: Colors.primary },
});