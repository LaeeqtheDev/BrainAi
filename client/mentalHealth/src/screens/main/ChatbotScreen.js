import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getChatHistory, sendChatMessage } from '../../services/chatService';
import { Colors, Spacing, Fonts, FontSizes, Radius } from '../../config/theme';

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [suggestions, setSuggestions] = useState([
    'Coping Tips',
    'Reflect',
    'Talk More',
  ]);

  const [crisisInfo, setCrisisInfo] = useState(null);

  const scrollRef = useRef(null);

  // LOAD HISTORY
  useEffect(() => {
    (async () => {
      const history = await getChatHistory(50);

      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: "Hi, I'm here to listen. How are you feeling today?",
          },
        ]);
      }

      setLoading(false);
    })();
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(t);
  }, [messages]);

  // SEND MESSAGE
  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await sendChatMessage(text);

      if (res?.success) {
        const botMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.reply || "I'm here with you.",
        };

        setMessages((prev) => [...prev, botMsg]);

        // FIX: correct mapping
        setSuggestions(
          Array.isArray(res.suggestions) && res.suggestions.length > 0
            ? res.suggestions
            : ['Talk', 'Stay', 'Breathe']
        );setSuggestions(res.suggestions || []);

        if (res?.crisisFlag) {
          setCrisisInfo(
            res?.crisisResources || {
              title: 'Support Available',
              message: "You're not alone. Help is available.",
            }
          );
        }

      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: 'Connection issue. Try again.',
          },
        ]);
      }

    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Server not reachable. Try again.',
        },
      ]);
    }

    setSending(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* CRISIS BANNER */}
      {crisisInfo && (
        <View style={styles.crisisBanner}>
          <Ionicons name="alert-circle" size={18} color="#B00020" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.crisisTitle}>
              {crisisInfo.title || 'Support Available'}
            </Text>
            <Text style={styles.crisisText}>
              {crisisInfo.message || 'You are not alone.'}
            </Text>
          </View>
        </View>
      )}

      {/* HEADER */}
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
            <Text style={styles.headerSub}>Always here to listen</Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubbleWrap,
                  m.role === 'user'
                    ? styles.bubbleWrapUser
                    : styles.bubbleWrapBot,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    m.role === 'user'
                      ? styles.bubbleUser
                      : styles.bubbleBot,
                  ]}
                >
                  <Text
                    style={
                      m.role === 'user'
                        ? styles.textUser
                        : styles.textBot
                    }
                  >
                    {m.text}
                  </Text>
                </View>
              </View>
            ))
          )}

          {sending && (
            <View style={styles.bubbleWrapBot}>
              <View style={[styles.bubble, styles.bubbleBot]}>
                <Text style={styles.textBot}>typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* SUGGESTIONS */}
        {!sending && (
          <View style={styles.chipsRow}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={`${s}-${i}`}
                onPress={() => send(s)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message…"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || sending}
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && { opacity: 0.4 },
            ]}
          >
            <Ionicons name="send" size={18} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES (UNCHANGED)
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  crisisBanner: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFE9EC',
    borderBottomWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
  },

  crisisTitle: {
    fontFamily: Fonts.bodyMedium,
    color: '#B00020',
    fontSize: FontSizes.sm,
  },

  crisisText: {
    fontFamily: Fonts.body,
    color: '#B00020',
    fontSize: FontSizes.xs,
    marginTop: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },

  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
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
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
  },

  headerSub: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },

  messages: {
    padding: Spacing.md,
    gap: 10,
  },

  bubbleWrap: { flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapBot: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: Radius.lg,
  },

  bubbleUser: { backgroundColor: Colors.primary },
  bubbleBot: { backgroundColor: Colors.surface },

  textUser: { color: Colors.surface },
  textBot: { color: Colors.textPrimary },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: 8,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  chipText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },

  inputRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },

  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 12,
    marginRight: 8,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});