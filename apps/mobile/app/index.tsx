import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SermonCard } from '../src/components/sermon-card';
import { listPublishedSermons } from '../src/services/sermons-api';
import type { MobileSermon } from '../src/types/sermons.types';
import { extractSermonText } from '../src/utils/lexical-text';

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

function buildPreview(value: unknown): string {
  const text = extractSermonText(value).replace(/\s+/g, ' ').trim();

  if (!text) {
    return 'Texte non disponible';
  }

  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 137)}...`;
}

export default function SermonListScreen(): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const [items, setItems] = useState<MobileSermon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSermons(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const result = await listPublishedSermons({ search });

        if (!mounted) {
          return;
        }

        setItems(result);
      } catch {
        if (!mounted) {
          return;
        }

        setError('Impossible de charger les predications.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSermons();

    return () => {
      mounted = false;
    };
  }, [search]);

  const emptyMessage = useMemo(() => {
    if (search.trim().length > 0) {
      return 'Aucune predication ne correspond a cette recherche.';
    }

    return 'Aucune predication publiee pour le moment.';
  }, [search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Bibliotheque de predications</Text>
        <Text style={styles.subheading}>Lisez et ecoutez les derniers messages publies.</Text>

        <TextInput
          autoCapitalize="none"
          onChangeText={setSearch}
          placeholder="Rechercher par titre ou date"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={search}
        />

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color="#6D5EF6" size="small" />
            <Text style={styles.stateLabel}>Chargement des predications...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            contentContainerStyle={items.length === 0 ? styles.listEmpty : styles.listContent}
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SermonCard
                dateLabel={formatDateLabel(item.date)}
                hasAudio={Boolean(item.audioUrl)}
                onPress={() => {
                  router.push({
                    pathname: '/sermons/[id]',
                    params: { id: item.id },
                  });
                }}
                preview={buildPreview(item.content)}
                title={item.title}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.stateLabel}>{emptyMessage}</Text>}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  subheading: {
    marginTop: 8,
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#243044',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#111826',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  listEmpty: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  centeredState: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  stateLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
  },
  errorBox: {
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#2A1216',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorLabel: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
});