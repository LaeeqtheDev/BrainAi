import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function BreathingScreen({ navigation }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale
  const [selectedExercise, setSelectedExercise] = useState('box'); // box, 478

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const [countdown, setCountdown] = useState(4);

  const exercises = {
    box: {
      name: 'Box Breathing',
      description: 'Inhale 4 • Hold 4 • Exhale 4 • Hold 4',
      steps: [
        { phase: 'inhale', duration: 4, instruction: 'Breathe In' },
        { phase: 'hold', duration: 4, instruction: 'Hold' },
        { phase: 'exhale', duration: 4, instruction: 'Breathe Out' },
        { phase: 'hold', duration: 4, instruction: 'Hold' },
      ],
    },
    '478': {
      name: '4-7-8 Breathing',
      description: 'Inhale 4 • Hold 7 • Exhale 8',
      steps: [
        { phase: 'inhale', duration: 4, instruction: 'Breathe In' },
        { phase: 'hold', duration: 7, instruction: 'Hold' },
        { phase: 'exhale', duration: 8, instruction: 'Breathe Out' },
      ],
    },
  };

  const currentExercise = exercises[selectedExercise];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = currentExercise.steps[currentStepIndex];

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next step
          setCurrentStepIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % currentExercise.steps.length;
            return nextIndex;
          });
          return currentExercise.steps[(currentStepIndex + 1) % currentExercise.steps.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentStepIndex]);

  useEffect(() => {
    if (!isActive) {
      Animated.timing(scaleAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    const targetScale = currentStep.phase === 'inhale' ? 1 : currentStep.phase === 'exhale' ? 0.6 : 0.8;
    const animDuration = currentStep.duration * 1000;

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: animDuration,
      useNativeDriver: true,
    }).start();

    setPhase(currentStep.phase);
  }, [isActive, currentStepIndex]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setCountdown(currentExercise.steps[0].duration);
    setPhase(currentExercise.steps[0].phase);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('ready');
    setCurrentStepIndex(0);
    setCountdown(currentExercise.steps[0].duration);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return '#4dd0e1';
      case 'exhale':
        return '#81c784';
      case 'hold':
        return '#ffb74d';
      default:
        return '#b0bec5';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Breathing Exercise</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Exercise Selection */}
      {!isActive && (
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>Choose an exercise:</Text>
          <View style={styles.exerciseOptions}>
            {Object.keys(exercises).map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.exerciseOption,
                  selectedExercise === key && styles.exerciseOptionActive,
                ]}
                onPress={() => setSelectedExercise(key)}
              >
                <Text style={[
                  styles.exerciseName,
                  selectedExercise === key && styles.exerciseNameActive,
                ]}>
                  {exercises[key].name}
                </Text>
                <Text style={[
                  styles.exerciseDescription,
                  selectedExercise === key && styles.exerciseDescriptionActive,
                ]}>
                  {exercises[key].description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Breathing Circle */}
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              backgroundColor: getPhaseColor(),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.phaseText}>
            {isActive ? currentStep.instruction : 'Ready'}
          </Text>
          {isActive && (
            <Text style={styles.countdownText}>{countdown}</Text>
          )}
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        {!isActive ? (
          <>
            <Text style={styles.instructionTitle}>How it works:</Text>
            <View style={styles.instructionSteps}>
              {currentExercise.steps.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.instructionDot} />
                  <Text style={styles.instructionText}>
                    {step.instruction} for {step.duration} seconds
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.activeInstruction}>
            Follow the circle's rhythm
          </Text>
        )}
      </View>

      {/* Control Button */}
      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isActive && styles.controlButtonStop]}
          onPress={isActive ? handleStop : handleStart}
        >
          <Text style={styles.controlButtonText}>
            {isActive ? 'Stop' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  selectionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  selectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  exerciseOptions: {
    gap: Spacing.sm,
  },
  exerciseOption: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  exerciseOptionActive: {
    borderColor: '#4a6741',
    backgroundColor: '#f0f4ef',
  },
  exerciseName: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exerciseNameActive: {
    color: '#4a6741',
  },
  exerciseDescription: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  exerciseDescriptionActive: {
    color: '#4a6741',
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  phaseText: {
    fontSize: FontSizes.xxlarge,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  instructionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  instructionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructionSteps: {
    gap: Spacing.sm,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4a6741',
    marginRight: Spacing.sm,
  },
  instructionText: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
  },
  activeInstruction: {
    fontSize: FontSizes.large,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controlContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  controlButton: {
    backgroundColor: '#4a6741',
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    shadowColor: '#4a6741',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButtonStop: {
    backgroundColor: '#ef5350',
    shadowColor: '#ef5350',
  },
  controlButtonText: {
    color: Colors.white,
    fontSize: FontSizes.large,
    fontWeight: '600',
  },
});