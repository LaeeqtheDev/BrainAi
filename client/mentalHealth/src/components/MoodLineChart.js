import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts, FontSizes } from '../config/theme';

// data: [{ label: 'Mon', value: 3 }, ...] — value 1-5, null = no data
export default function MoodLineChart({ data, height = 180 }) {
  console.log('📊 MoodLineChart data:', JSON.stringify(data, null, 2));

  const width = 320;
  const padding = { top: 16, right: 16, bottom: 28, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Check if data exists and is valid
  if (!data || !Array.isArray(data)) {
    console.log('❌ Invalid data:', data);
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Chart data is invalid</Text>
      </View>
    );
  }

  const valid = data.filter((d) => d.value != null && typeof d.value === 'number');
  console.log('✅ Valid data points:', valid.length, 'out of', data.length);

  if (valid.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No mood data yet — log your first mood.</Text>
      </View>
    );
  }

  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
  const yFor = (v) => {
    // Ensure value is between 1-5
    const clampedV = Math.max(1, Math.min(5, v));
    return padding.top + innerH - ((clampedV - 1) / 4) * innerH;
  };
  const xFor = (i) => padding.left + i * xStep;

  const points = data
    .map((d, i) => {
      if (d.value != null && typeof d.value === 'number') {
        const x = xFor(i);
        const y = yFor(d.value);
        return `${x},${y}`;
      }
      return null;
    })
    .filter(Boolean)
    .join(' ');

  console.log('📈 Chart points:', points);

  return (
    <View>
      <Svg width={width} height={height}>
        {/* gridlines */}
        {[1, 2, 3, 4, 5].map((v) => (
          <Line
            key={v}
            x1={padding.left} x2={width - padding.right}
            y1={yFor(v)} y2={yFor(v)}
            stroke={Colors.border} strokeWidth={1} strokeDasharray="2,4"
          />
        ))}

        {/* line */}
        {points && (
          <Polyline
            points={points}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* dots */}
        {data.map((d, i) =>
          d.value != null && typeof d.value === 'number' ? (
            <Circle
              key={i}
              cx={xFor(i)} cy={yFor(d.value)} r={5}
              fill={Colors.accent}
              stroke={Colors.surface} strokeWidth={2}
            />
          ) : null
        )}

        {/* x-axis labels */}
        {data.map((d, i) => (
          <SvgText
            key={`x-${i}`}
            x={xFor(i)}
            y={height - 8}
            fontSize={11}
            fill={Colors.textMuted}
            textAnchor="middle"
            fontFamily={Fonts.body}
          >
            {d.label || ''}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 16,
  },
});