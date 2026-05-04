// ============================================================
// EscapeCall — VisualPuzzleComponent
// Renderiza a grade visual do Puzzle 2 (Padrão Visual)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VisualPuzzleData } from '@/lib/domain/types';

interface Props {
  data: VisualPuzzleData;
}

export function VisualPuzzleComponent({ data }: Props) {
  const { grid, highlightedCells, pattern } = data;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>GRADE DE PADRÕES</Text>

      {/* Grid */}
      <View style={styles.grid}>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => {
              const flatIndex = rowIdx * row.length + colIdx;
              const isHighlighted = highlightedCells.includes(flatIndex);
              const isEmpty = cell === 0;

              return (
                <View
                  key={colIdx}
                  style={[
                    styles.cell,
                    isHighlighted && styles.cellHighlighted,
                    isEmpty && styles.cellEmpty,
                  ]}
                >
                  {isEmpty ? (
                    <Text style={styles.cellQuestionMark}>?</Text>
                  ) : (
                    <Text style={[styles.cellText, isHighlighted && styles.cellTextHighlighted]}>
                      {cell}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Pattern hint */}
      <View style={styles.patternHint}>
        <Text style={styles.patternLabel}>PADRÃO</Text>
        <Text style={styles.patternText}>{pattern}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
    textAlign: 'center',
  },
  grid: {
    alignSelf: 'center',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    width: 72,
    height: 72,
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellHighlighted: {
    backgroundColor: '#1A1A2E',
    borderColor: '#7C3AED',
    borderWidth: 2,
  },
  cellEmpty: {
    backgroundColor: '#0A0E1A',
    borderColor: '#FF4444',
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  cellText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00D4FF',
    fontFamily: 'monospace',
  },
  cellTextHighlighted: {
    color: '#9B5DE5',
  },
  cellQuestionMark: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF4444',
    fontFamily: 'monospace',
  },
  patternHint: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  patternLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
  },
  patternText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
