import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs, LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function buildTrace(cx, cy, angleDeg, reach) {
  const a = (angleDeg * Math.PI) / 180;
  const tx = cx + Math.cos(a) * reach;
  const ty = cy + Math.sin(a) * reach;
  const dx = tx - cx;
  const dy = ty - cy;
  let pts;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const bx = cx + dx * 0.45;
    pts = [[cx, cy], [bx, cy], [bx, ty], [tx, ty]];
  } else {
    const by = cy + dy * 0.45;
    pts = [[cx, cy], [cx, by], [tx, by], [tx, ty]];
  }
  const d = "M " + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
  let length = 0;
  for (let i = 1; i < pts.length; i++) {
    length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return { d, length, node: [tx, ty] };
}

function Trace({ d, length, node, delay, duration, color, trigger }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    t.setValue(0);
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(t, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [t, delay, duration, trigger]); // re-runs on first load and on every tap

  const dashoffset = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [length, 0, 0] });
  const strokeOpacity = t.interpolate({ inputRange: [0, 0.12, 0.72, 1], outputRange: [0, 1, 1, 0] });
  const nodeOpacity = t.interpolate({ inputRange: [0, 0.48, 0.56, 0.9, 1], outputRange: [0, 0, 1, 1, 0] });

  return (
    <>
      <AnimatedPath
        d={d}
        stroke={color}
        strokeWidth={1.6}
        fill="none"
        strokeDasharray={length}
        strokeDashoffset={dashoffset}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <AnimatedCircle cx={node[0]} cy={node[1]} r={3.2} fill={color} opacity={nodeOpacity} />
    </>
  );
}

export default function Index() {
  const { width, height } = useWindowDimensions();
  const cx = width / 2;
  const cy = height * 0.42;

  const [trigger, setTrigger] = useState(0); // bumped on each tap

  const traces = useMemo(() => {
    const maxR = Math.max(width, height) * 0.6;
    const angles = [-12, 18, 42, 66, 96, 128, 152, 182, 210, 236, 300, 330];
    return angles.map((ang, i) => {
      const reach = maxR * (0.5 + ((i * 37) % 50) / 100);
      const base = buildTrace(cx, cy, ang, reach);
      return {
        ...base,
        delay: (i % 6) * 220,
        duration: 2200 + (i % 5) * 350,
        color: i % 4 === 0 ? "#9bf0ff" : "#4bc8ff",
      };
    });
  }, [width, height, cx, cy]);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    p.start();
    return () => p.stop();
  }, [pulse]);

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  const topPins = Array.from({ length: 6 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3d1a63" />
            <Stop offset="0.5" stopColor="#1a1d5a" />
            <Stop offset="1" stopColor="#061436" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
        {traces.map((tr, i) => (
          <Trace key={i} {...tr} trigger={trigger} />
        ))}
      </Svg>

      {/* Chip is now tappable. Tapping it replays the traces. */}
      <Pressable
        onPress={() => setTrigger((n) => n + 1)}
        style={({ pressed }) => [
          styles.chipWrap,
          { left: cx - 80, top: cy - 80, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Animated.View
          style={[styles.chipGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
        />
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Defs>
            <LinearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#8a3ff7" />
              <Stop offset="1" stopColor="#2a1a66" />
            </LinearGradient>
            <LinearGradient id="txt" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ffffff" />
              <Stop offset="1" stopColor="#7df9ff" />
            </LinearGradient>
          </Defs>

          {topPins.map((i) => (
            <Rect key={"t" + i} x={44 + i * 12} y={26} width={5} height={9} rx={1.5} fill="#4be0ff" />
          ))}
          {topPins.map((i) => (
            <Rect key={"b" + i} x={44 + i * 12} y={125} width={5} height={9} rx={1.5} fill="#4be0ff" />
          ))}
          {topPins.map((i) => (
            <Rect key={"l" + i} x={26} y={44 + i * 12} width={9} height={5} rx={1.5} fill="#4be0ff" />
          ))}
          {topPins.map((i) => (
            <Rect key={"r" + i} x={125} y={44 + i * 12} width={9} height={5} rx={1.5} fill="#4be0ff" />
          ))}

          <Rect x="38" y="38" width="84" height="84" rx="12" fill="url(#chip)" stroke="#c39bff" strokeWidth="1.5" />
          <Rect x="48" y="48" width="64" height="64" rx="8" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
          <SvgText x="80" y="86" fontSize="17" fontWeight="bold" fill="url(#txt)" textAnchor="middle">
            RADAXA
          </SvgText>
        </Svg>
      </Pressable>

      <View style={styles.bottom} pointerEvents="none">
        <Text style={styles.welcome}>Welcome Sir</Text>
        <Text style={styles.name}>I'm RADAXA</Text>
        <Text style={styles.expansion}>
          Resonant Advanced Directed Autonomy & X-Neural Architecture
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061436" },
  chipWrap: {
    position: "absolute",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#7df9ff",
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 64,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  welcome: { color: "#ffffff", fontSize: 28, fontWeight: "700", letterSpacing: 1 },
  name: { color: "#7df9ff", fontSize: 19, fontWeight: "600", marginTop: 6, letterSpacing: 2 },
  expansion: {
    color: "#9fb4d4",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
});