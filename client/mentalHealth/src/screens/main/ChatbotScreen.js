import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  getChatHistory,
  sendChatMessage,
  getOpener,
} from '../../services/chatService';
import {
  Colors,
  Spacing,
  Fonts,
  FontSizes,
  Radius,
  Shadow,
} from '../../config/theme';

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([
    'tell me more',
    'I need to vent',
    'just sit with me',
  ]);
  const [crisisInfo, setCrisisInfo] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    (async () => {
      const history = await getChatHistory(50);
      const opener = await getOpener();

      if (history.length === 0) {
        setMessages([
          { id: 'opener', role: 'assistant', text: opener.greeting },
        ]);
      } else {
        setMessages([
          ...history,
          {
            id: `opener-${Date.now()}`,
            role: 'assistant',
            text: opener.greeting,
          },
        ]);
      }

      setSuggestions(opener.chips);
      setLoading(false);
    })();
  }, []);

  // ✅ Keyboard handling (fixes gap issue)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const res = await sendChatMessage(text);

    if (res.success) {
      if (res.crisisFlag) setCrisisInfo(res.crisisResources);

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: res.reply },
      ]);

      if (res.suggestions) setSuggestions(res.suggestions);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: "couldn't reach the server. check your connection?",
        },
      ]);
    }

    setSending(false);

    // ✅ Ensure scroll after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubbleWrap,
        item.role === 'user'
          ? styles.bubbleWrapUser
          : styles.bubbleWrapBot,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.role === 'user'
            ? styles.bubbleUser
            : styles.bubbleBot,
        ]}
      >
        <Text
          style={
            item.role === 'user' ? styles.textUser : styles.textBot
          }
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding" // ✅ force consistent behavior (fixes ghost gap)
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.back}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.headerIcon}>
                <Ionicons name="leaf" size={16} color={Colors.surface} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Stillwater</Text>
                <Text style={styles.headerSub}>
                  here, when you need it
                </Text>
              </View>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* CRISIS */}
          {crisisInfo && (
            <View style={styles.crisisBanner}>
              <Ionicons name="heart" size={18} color={Colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.crisisTitle}>
                  you don't have to face this alone
                </Text>
                <Text style={styles.crisisText}>
                  {crisisInfo.message} {crisisInfo.hotline}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCrisisInfo(null)}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={loading ? [] : messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator
                  color={Colors.primary}
                  style={{ marginTop: 40 }}
                />
              ) : null
            }
            ListFooterComponent={
              sending ? (
                <View style={styles.bubbleWrapBot}>
                  <View style={[styles.bubble, styles.bubbleBot]}>
                    <Text style={styles.textBot}>···</Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* SUGGESTIONS */}
          {!sending &&
            messages.length > 0 &&
            suggestions.length > 0 && (
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
          <View
            style={[
              styles.inputRow,
              {
                paddingBottom:
                  Platform.OS === 'android'
                    ? keyboardVisible
                      ? 4
                      : 6
                    : Spacing.sm,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message…"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={() => send()}
              disabled={!input.trim() || sending}
              style={[
                styles.sendBtn,
                (!input.trim() || sending) && { opacity: 0.4 },
              ]}
            >
              <Ionicons
                name="send"
                size={18}
                color={Colors.surface}
              />
            </TouchableOpacity>
          </View>
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
    marginLeft: 12,
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
    color: Colors.textPrimary,
  },

  headerSub: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
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
  },

  crisisText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },

  messages: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl + 4,
    gap: Spacing.sm,
    flexGrow: 1,
  },

  bubbleWrap: { flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapBot: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '85%',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },

  bubbleBot: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    ...Shadow.soft,
  },

  textUser: {
    color: Colors.textOnDark,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },

  textBot: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
  },

  chipText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.bodyMedium,
    color: Colors.primary,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
  },

  input: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    fontFamily: Fonts.body,
    color: Colors.textPrimary,
    maxHeight: 120,
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