import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getChatHistory, sendChatMessage, getOpener } from '../../services/chatService';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

// Animated Message Bubble Component
const AnimatedBubble = ({ message, isUser }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        isUser ? styles.bubbleWrapUser : styles.bubbleWrapBot,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={isUser ? styles.textUser : styles.textBot}>{message.text}</Text>
      </View>
    </Animated.View>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.bubbleWrapBot}>
      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
        </View>
      </View>
    </View>
  );
};

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [crisisInfo, setCrisisInfo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const history = await getChatHistory(50);
      
      if (history.length === 0) {
        try {
          const opener = await getOpener();
          setMessages([{ 
            id: 'opener', 
            role: 'assistant', 
            text: opener.greeting || "hey. how's today landing?" 
          }]);
          setSuggestions(opener.chips || ['pretty good', 'kinda rough', 'just need to talk', 'not sure']);
        } catch (openerError) {
          setMessages([{ 
            id: 'fallback-opener', 
            role: 'assistant', 
            text: "hey. how's today landing?" 
          }]);
          setSuggestions(['pretty good', 'kinda rough', 'just need to talk', 'not sure']);
        }
      } else {
        setMessages(history);
        setSuggestions(['tell me more', 'I need to vent', 'just sit with me']);
      }
    } catch (error) {
      console.error('❌ Failed to load chat:', error);
      setMessages([{ 
        id: 'error-fallback', 
        role: 'assistant', 
        text: "hey. I'm here. how's today landing?" 
      }]);
      setSuggestions(['pretty good', 'kinda rough', 'just need to talk', 'not sure']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await sendChatMessage(text);

      if (res.success) {
        if (res.crisisFlag) setCrisisInfo(res.crisisResources);
        
        setMessages((prev) => [...prev, { 
          id: `a-${Date.now()}`, 
          role: 'assistant', 
          text: res.reply 
        }]);
        
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
        }
      } else {
        setMessages((prev) => [...prev, {
          id: `err-${Date.now()}`, 
          role: 'assistant',
          text: res.reply || "couldn't reach the server. check your connection?",
        }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`, 
        role: 'assistant',
        text: "something went wrong. is the backend running?",
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={16} color={Colors.surface} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Stillwater</Text>
            <Text style={styles.headerSub}>here, when you need it</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {crisisInfo && (
        <View style={styles.crisisBanner}>
          <Ionicons name="heart" size={18} color={Colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.crisisTitle}>you don't have to face this alone</Text>
            <Text style={styles.crisisText}>
              {crisisInfo.message} {crisisInfo.hotline}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setCrisisInfo(null)}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* 🔥 FIXED KEYBOARD + SCROLL BEHAVIOR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={styles.messages} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={false}
          keyboardDismissMode="interactive"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.loadingText}>connecting...</Text>
            </View>
          ) : (
            messages.map((m) => (
              <AnimatedBubble key={m.id} message={m} isUser={m.role === 'user'} />
            ))
          )}
          {sending && <TypingIndicator />}
        </ScrollView>

        {!sending && !loading && messages.length > 0 && suggestions.length > 0 && (
          <View style={styles.chipsRow}>
            {suggestions.slice(0, 4).map((s, i) => (
              <TouchableOpacity 
                key={`${s}-${i}`} 
                onPress={() => send(s)} 
                style={styles.chip} 
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message…"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            maxLength={1000}
            editable={!sending && !loading}
            onFocus={() => {
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
            }}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || sending || loading}
            style={[styles.sendBtn, (!input.trim() || sending || loading) && { opacity: 0.4 }]}
          >
            <Ionicons name="send" size={18} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  back: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.surface, 
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  headerCenter: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginLeft: 12 
  },
  headerIcon: {
    width: 32, 
    height: 32, 
    borderRadius: 16,
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: FontSizes.md, 
    fontFamily: Fonts.display, 
    color: Colors.textPrimary 
  },
  headerSub: { 
    fontSize: FontSizes.xs, 
    fontFamily: Fonts.body, 
    color: Colors.textSecondary 
  },
  crisisBanner: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    backgroundColor: '#FBE9E5', 
    padding: Spacing.md, 
    margin: Spacing.md,
    borderRadius: Radius.md,
  },
  crisisTitle: { 
    fontSize: FontSizes.sm, 
    fontFamily: Fonts.bodyMedium, 
    color: Colors.textPrimary, 
    marginBottom: 2 
  },
  crisisText: { 
    fontSize: FontSizes.xs, 
    fontFamily: Fonts.body, 
    color: Colors.textSecondary, 
    lineHeight: 16 
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontFamily: Fonts.body,
  },
  messages: { 
    padding: Spacing.md, 
    paddingBottom: Spacing.xl, 
    gap: Spacing.md,
    // 🔥 REMOVED flexGrow: 1 to fix white space
  },
  bubbleWrap: { flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapBot: { justifyContent: 'flex-start' },
  bubble: { 
    maxWidth: '85%', 
    borderRadius: Radius.lg, 
    paddingVertical: 12, 
    paddingHorizontal: 16,
  },
  bubbleUser: { 
    backgroundColor: Colors.primary, 
    borderBottomRightRadius: 4,
  },
  bubbleBot: { 
    backgroundColor: Colors.surface, 
    borderBottomLeftRadius: 4, 
    ...Shadow.soft,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textUser: { 
    color: Colors.textOnDark, 
    fontFamily: Fonts.body, 
    fontSize: FontSizes.md, 
    lineHeight: 22 
  },
  textBot: { 
    color: Colors.textPrimary, 
    fontFamily: Fonts.body, 
    fontSize: FontSizes.md, 
    lineHeight: 22 
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.sm, 
    gap: 8,
    backgroundColor: Colors.background,
  },
  chip: {
    borderWidth: 1, 
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    paddingVertical: 10, 
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    ...Shadow.soft,
  },
  chipText: { 
    fontSize: FontSizes.sm, 
    fontFamily: Fonts.bodyMedium, 
    color: Colors.primary 
  },
  inputRow: {
    flexDirection: 'row', 
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.md,
    borderTopWidth: 1, 
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface, 
    gap: 10,
  },
  input: {
    flex: 1, 
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    fontSize: FontSizes.md, 
    fontFamily: Fonts.body, 
    color: Colors.textPrimary,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', 
    justifyContent: 'center',
    ...Shadow.soft,
  },
});