import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function ChatbotScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to support you. How are you feeling today?",
      isBot: true,
      stressLevel: 'low',
      timestamp: new Date(),
    },
  ]);
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (message.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(message),
        isBot: true,
        stressLevel: detectStressLevel(message),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('stress') || lowerMsg.includes('anxious')) {
      return "I hear that you're feeling stressed. That's completely valid. Would you like to try a breathing exercise or talk about what's troubling you?";
    } else if (lowerMsg.includes('sad') || lowerMsg.includes('down')) {
      return "I'm sorry you're feeling this way. Remember, it's okay to not be okay. Would you like to share what's on your mind?";
    } else if (lowerMsg.includes('happy') || lowerMsg.includes('good')) {
      return "That's wonderful! I'm glad you're feeling positive. What's making you feel good today?";
    } else {
      return "Thank you for sharing. I'm here to listen and support you. How can I help you feel better today?";
    }
  };

  const detectStressLevel = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('panic') || lowerText.includes('overwhelming')) return 'high';
    if (lowerText.includes('stress') || lowerText.includes('anxious')) return 'medium';
    return 'low';
  };

  const getStressBadge = (level) => {
    const badges = {
      low: { color: '#66bb6a', emoji: '😌', label: 'Calm' },
      medium: { color: '#ffb74d', emoji: '😰', label: 'Mild Stress' },
      high: { color: '#ef5350', emoji: '😟', label: 'High Stress' },
    };
    return badges[level] || badges.low;
  };

  const quickActions = [
    { label: 'Coping Tips', icon: '💡' },
    { label: 'Breathing Exercise', icon: '🫁' },
    { label: 'Talk More', icon: '💬' },
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Companion</Text>
          <Text style={styles.headerSubtitle}>Always here to listen</Text>
        </View>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarEmoji}>🤖</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={styles.messageWrapper}>
              {msg.isBot ? (
                // Bot Message
                <View style={styles.botMessageContainer}>
                  <View style={styles.botMessage}>
                    <Text style={styles.botMessageText}>{msg.text}</Text>
                    {msg.stressLevel && (
                      <View style={[styles.stressBadge, { backgroundColor: getStressBadge(msg.stressLevel).color }]}>
                        <Text style={styles.stressBadgeEmoji}>{getStressBadge(msg.stressLevel).emoji}</Text>
                        <Text style={styles.stressBadgeText}>{getStressBadge(msg.stressLevel).label}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ) : (
                // User Message
                <View style={styles.userMessageContainer}>
                  <View style={styles.userMessage}>
                    <Text style={styles.userMessageText}>{msg.text}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              activeOpacity={0.7}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  botAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#51A2FF',
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatarEmoji: {
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    marginBottom: Spacing.md,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  botMessage: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  botMessageText: {
    fontSize: FontSizes.medium,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  stressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  stressBadgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  stressBadgeText: {
    fontSize: FontSizes.small,
    color: Colors.white,
    fontWeight: '600',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  userMessage: {
    backgroundColor: '#51A2FF',
    borderRadius: BorderRadius.medium,
    borderBottomRightRadius: 4,
    padding: Spacing.md,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: FontSizes.medium,
    color: Colors.white,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: FontSizes.small - 1,
    color: Colors.textLight,
    marginTop: 4,
    marginHorizontal: Spacing.sm,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  quickActionLabel: {
    fontSize: FontSizes.small,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.large,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSizes.medium,
    color: Colors.textPrimary,
    maxHeight: 100,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#51A2FF',
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    fontSize: 20,
    color: Colors.white,
  },
});