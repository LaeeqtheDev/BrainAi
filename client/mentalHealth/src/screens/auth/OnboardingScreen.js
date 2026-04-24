import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🧠</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>AI Powered Mental{'\n'}Health Fitness</Text>
        <Text style={styles.subtitle}>
          Your private companion for emotional wellness and peace of mind
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {/* Benefit 1 - Stress Detection */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.benefitEmoji}>📈</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Stress Detection</Text>
              <Text style={styles.benefitText}>
                AI-powered insights to understand your emotional patterns
              </Text>
            </View>
          </View>

          {/* Benefit 2 - Private Support */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.benefitEmoji}>🔒</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Private Support</Text>
              <Text style={styles.benefitText}>
                Your conversations and data stay completely secure
              </Text>
            </View>
          </View>

          {/* Benefit 3 - Mood Insights */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.benefitEmoji}>✨</Text>
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Mood Insights</Text>
              <Text style={styles.benefitText}>
                Track your progress and discover what brings you peace
              </Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButtonContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <LinearGradient
            colors={['#51A2FF', '#00D5BE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Text style={styles.continueButtonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#51A2FF',
    borderRadius: BorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#51A2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: Spacing.xl,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitContent: {
    flex: 1,
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  continueButtonContainer: {
    marginBottom: Spacing.lg,
  },
  continueButton: {
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#51A2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: FontSizes.large,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  continueButtonArrow: {
    color: Colors.white,
    fontSize: FontSizes.xlarge,
    fontWeight: '600',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },
  linkText: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});