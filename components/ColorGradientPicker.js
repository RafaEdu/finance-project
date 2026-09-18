import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import {
  getContrastTextColor,
  hexToHsv,
  hsvToHex,
  isValidHex,
} from "../utils/color";

const HUE_STEPS = 36;
const SAT_STEPS = 16;
const VAL_STEPS = 12;

// Gradiente interativo (matiz + saturação/valor) para escolher qualquer cor.
export default function ColorGradientPicker({ color, onSelect, style }) {
  const [hue, setHue] = useState(210);
  const [sat, setSat] = useState(1);
  const [val, setVal] = useState(1);
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });
  const [hueWidth, setHueWidth] = useState(0);

  const previewColor = hsvToHex(hue, sat, val);

  // Sincroniza com a cor externa (ex.: digitada no campo de hex).
  useEffect(() => {
    if (!isValidHex(color)) return;
    if (color.toLowerCase() === previewColor) return;
    const hsv = hexToHsv(color);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
  }, [color, previewColor]);

  const commit = useCallback(
    (h, s, v) => {
      onSelect(hsvToHex(h, s, v));
    },
    [onSelect],
  );

  const handleAreaTouch = (e) => {
    const { width, height } = areaSize;
    if (!width || !height) return;
    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;
    const nextSat = Math.min(1, Math.max(0, x / width));
    const nextVal = 1 - Math.min(1, Math.max(0, y / height));
    setSat(nextSat);
    setVal(nextVal);
    commit(hue, nextSat, nextVal);
  };

  const handleHueTouch = (e) => {
    if (!hueWidth) return;
    const x = e.nativeEvent.locationX;
    const nextHue = Math.min(1, Math.max(0, x / hueWidth)) * 360;
    setHue(nextHue);
    commit(nextHue, sat, val);
  };

  // Cores das faixas de matiz (estático).
  const hueStrips = useMemo(
    () =>
      Array.from({ length: HUE_STEPS }, (_, i) =>
        hsvToHex((i / (HUE_STEPS - 1)) * 360, 1, 1),
      ),
    [],
  );

  // Grade saturação x valor para a matiz atual.
  const gridRows = useMemo(
    () =>
      Array.from({ length: VAL_STEPS }, (_, row) => {
        const v = 1 - row / (VAL_STEPS - 1);
        return Array.from({ length: SAT_STEPS }, (_, col) =>
          hsvToHex(hue, col / (SAT_STEPS - 1), v),
        );
      }),
    [hue],
  );

  const selectedHueIndex = Math.round((hue / 360) * (HUE_STEPS - 1));
  const selectedCol = Math.round(sat * (SAT_STEPS - 1));
  const selectedRow = Math.round((1 - val) * (VAL_STEPS - 1));

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionLabel}>Tom</Text>
      <View
        style={styles.hueBar}
        onLayout={(e) => setHueWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleHueTouch}
        onResponderMove={handleHueTouch}
      >
        {hueStrips.map((stripColor, i) => (
          <View
            key={`hue-${i}`}
            pointerEvents="none"
            style={[styles.hueCell, { backgroundColor: stripColor }]}
          >
            {i === selectedHueIndex && <View style={styles.hueMarker} />}
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Toque no gradiente para escolher</Text>
      <View
        style={styles.area}
        onLayout={(e) => setAreaSize(e.nativeEvent.layout)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleAreaTouch}
        onResponderMove={handleAreaTouch}
      >
        {gridRows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            pointerEvents="none"
            style={styles.gridRow}
          >
            {row.map((cellColor, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                pointerEvents="none"
                style={[
                  styles.gridCell,
                  { backgroundColor: cellColor },
                  rowIndex === selectedRow &&
                    colIndex === selectedCol &&
                    styles.gridCellSelected,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.previewRow}>
        <View style={[styles.previewDot, { backgroundColor: previewColor }]}>
          <Text
            style={[
              styles.previewDotText,
              { color: getContrastTextColor(previewColor) },
            ]}
          >
            A
          </Text>
        </View>
        <Text style={styles.previewHex}>{previewColor.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  hueBar: {
    width: "100%",
    height: 26,
    borderRadius: 13,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  hueCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hueMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  area: {
    width: "100%",
    height: 170,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
  },
  gridCell: {
    flex: 1,
  },
  gridCellSelected: {
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 5,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewDotText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  previewHex: {
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.text,
    fontWeight: "600",
  },
});
