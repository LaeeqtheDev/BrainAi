import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function MoodTrackerScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data for line chart
  const weekData = [
    { day: 'Mon', value: 5 },
    { day: 'Tue', value: 6 },
    { day: 'Wed', value: 8 },
    { day: 'Thu', value: 5 },
    { day: 'Fri', value: 7 },
    { day: 'Sat', value: 9 },
    { day: 'Sun', value: 9 },
  ];

  // Mock data for bar chart
  const emotionData = [
    { emotion: 'Happy', count: 12, color: '#2196F3' },
    { emotion: 'Calm', count: 18, color: '#2196F3' },
    { emotion: 'Neutral', count: 8, color: '#2196F3' },
    { emotion: 'Stressed', count: 6, color: '#2196F3' },
    { emotion: 'Anxious', count: 4, color: '#2196F3' },
  ];

  const insights = [
    {
      icon: '✓',
      title: 'Positive Trend',
      description: 'Your mood improved by 25% this week. Keep up the great work!',
      bgColor: '#E8F5E9',
      iconBg: '#4CAF50',
    },
    {
      icon: '🌙',
      title: 'Evening Pattern',
      description: 'You feel stressed most on evenings. Consider an evening relaxation routine.',
      bgColor: '#FFF9E6',
      iconBg: '#FFC107',
    },
    {
      icon: '📅',
      title: 'Weekend Boost',
      description: 'Your mood is consistently higher on weekends. What activities bring you joy?',
      bgColor: '#E3F2FD',
      iconBg: '#2196F3',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00ACC1" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#00ACC1', '#2196F3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mood Tracker</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter Pills */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterPill, selectedPeriod === 'week' && styles.filterPillActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'week' && styles.filterTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedPeriod === 'month' && styles.filterPillActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'month' && styles.filterTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedPeriod === 'all' && styles.filterPillActive]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[styles.filterText, selectedPeriod === 'all' && styles.filterTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mood Trends Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={styles.cardTitle}>Mood Trends</Text>
          </View>
          
          {/* Line Chart */}
          <View style={styles.lineChartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>10</Text>
              <Text style={styles.axisLabel}>5</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, { top: '50%' }]} />
              <View style={[styles.gridLine, { top: '100%' }]} />

              {/* Data points and line */}
              <View style={styles.lineChart}>
                {weekData.map((item, index) => {
                  const height = (item.value / 10) * 100;
                  return (
                    <View key={index} style={styles.dataPointContainer}>
                      <View 
                        style={[
                          styles.dataPoint,
                          { bottom: `${height}%` }
                        ]}
                      />
                      {index < weekData.length - 1 && (
                        <View
                          style={[
                            styles.lineSegment,
                            {
                              bottom: `${height}%`,
                              transform: [
                                {
                                  rotate: `${Math.atan2(
                                    (weekData[index + 1].value - item.value) * 15,
                                    40
                                  )}rad`
                                }
                              ]
                            }
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* X-axis labels */}
              <View style={styles.xAxisLabels}>
                {weekData.map((item, index) => (
                  <Text key={index} style={styles.dayLabel}>{item.day}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Emotion Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Emotion Breakdown</Text>
          </View>

          {/* Bar Chart */}
          <View style={styles.barChartContainer}>
            {/* Y-axis */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisLabel}>20</Text>
              <Text style={styles.axisLabel}>15</Text>
              <Text style={styles.axisLabel}>10</Text>
              <Text style={styles.axisLabel}>5</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>

            {/* Bars */}
            <View style={styles.barsContainer}>
              {emotionData.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(item.count / 20) * 100}%`,
                          backgroundColor: item.color,
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.emotionLabel}>{item.emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Insights Section */}
        <Text style={styles.sectionTitle}>Your Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={[styles.insightCard, { backgroundColor: insight.bgColor }]}>
            <View style={[styles.insightIcon, { backgroundColor: insight.iconBg }]}>
              <Text style={styles.insightIconText}>{insight.icon}</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    justifyContent: 'center', // center base
  },
  
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.white,
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 24,
  },  
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  filterPillActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  lineChartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  yAxisLabels: {
    width: 30,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 12,
    color: '#999',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F0F0F0',
    top: 0,
  },
  lineChart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
  },
  dataPointContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dataPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00BCD4',
    position: 'absolute',
  },
  lineSegment: {
    position: 'absolute',
    left: 5,
    width: 35,
    height: 3,
    backgroundColor: '#00BCD4',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  dayLabel: {
    fontSize: 12,
    color: '#999',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 200,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 25,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '80%',
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  emotionLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
    marginTop: 8,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightIconText: {
    fontSize: 18,
    color: Colors.white,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});