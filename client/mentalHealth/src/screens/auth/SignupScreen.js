import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { signUp, signInWithGoogle } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Colors, Spacing, Fonts, FontSizes } from '../../config/theme';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "935704804413-75a46pcl5preh955nduif9q45jdnl86k.apps.googleusercontent.com";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔥 GOOGLE AUTH
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleSignUp(idToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-Up Failed', response.error?.message || 'Something went wrong');
    }
  }, [response]);

  const handleGoogleSignUp = async (idToken) => {
    setLoading(true);
    try {
      const result = await signInWithGoogle(idToken);
      if (!result.success) {
        Alert.alert('Google Sign-Up Failed', result.error);
      }
      // AppNavigator handles routing on auth state change
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Required';
    if (!email.match(/\S+@\S+\.\S+/)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const res = await signUp(email, password, fullName.trim());
    setLoading(false);

    if (!res.success) Alert.alert('Could not create account', res.error);
    // AppNavigator handles routing
  };

  const handleGoogle = () => {
    promptAsync({ useProxy: true });
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
            <Text style={styles.eyebrow}>A new beginning</Text>
            <Text style={styles.title}>
              Make this{'\n'}
              <Text style={styles.titleItalic}>your space.</Text>
            </Text>
          </View>

          <Input
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            autoCapitalize="words"
            error={errors.fullName}
          />

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
            placeholder="At least 6 characters"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create account"
            onPress={handleSignup}
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
            disabled={!request || loading}
            icon={<Ionicons name="logo-google" size={18} color={Colors.textPrimary} />}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.swap}>
            <Text style={styles.swapText}>
              Already have an account? <Text style={styles.swapBold}>Sign in</Text>
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
  header: { marginBottom: Spacing.lg },
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