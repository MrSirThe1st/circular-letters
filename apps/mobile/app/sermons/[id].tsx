import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AudioPlayerPlaceholder } from '../../src/components/audio-player-placeholder';
import { getPublishedSermonById } from '../../src/services/sermons-api';
import type { MobileSermon } from '../../src/types/sermons.types';
import { extractSermonText } from '../../src/utils/lexical-text';

function formatDateLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function normalizeRouteId(id: string | string[] | undefined): string {
  if (Array.isArray(id)) {
    return id[0] ?? '';
  }

  return id ?? '';
}

export default function SermonDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sermonId = normalizeRouteId(params.id);

  const [item, setItem] = useState<MobileSermon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSermon(): Promise<void> {
      if (!sermonId) {
        setError('Predication introuvable.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getPublishedSermonById(sermonId);

        if (!mounted) {
          return;
        }

        if (!result) {
          setError('Predication introuvable.');
          setItem(null);
          return;
        }

        setItem(result);
      } catch {
        if (!mounted) {
          return;
        }

        setError('Impossible de charger cette predication.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSermon();

    return () => {
      mounted = false;
    };
  }, [sermonId]);

  const bodyText = useMemo(() => {
    if (!item) {
      return '';
    }

    return extractSermonText(item.content);
  }, [item]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color="#6D5EF6" size="small" />
          <Text style={styles.stateLabel}>Chargement...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorLabel}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && item ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{formatDateLabel(item.date)}</Text>
          <AudioPlayerPlaceholder hasAudio={Boolean(item.audioUrl)} />
          <View style={styles.textPanel}>
            <Text style={styles.sectionTitle}>Texte</Text>
            <Text style={styles.bodyText}>{bodyText || 'Texte non disponible pour cette predication.'}</Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  stateLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  errorLabel: {
    color: '#FCA5A5',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
  },
  date: {
    color: '#94A3B8',
    fontSize: 14,
  },
  textPanel: {
    backgroundColor: '#111826',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#243044',
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 30,
  },
});