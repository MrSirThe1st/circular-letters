import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

type AudioPlayerPlaceholderProps = {
  hasAudio: boolean;
};

export function AudioPlayerPlaceholder({ hasAudio }: AudioPlayerPlaceholderProps): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const statusLabel = useMemo(() => {
    if (!hasAudio) {
      return 'Audio non disponible pour cette predication';
    }

    return isPlaying ? 'Lecture en cours' : 'Pret a lire';
  }, [hasAudio, isPlaying]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio</Text>
      <Text style={styles.status}>{statusLabel}</Text>
      <View style={styles.track}>
        <View style={[styles.progress, hasAudio ? styles.progressActive : null]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.time}>00:00</Text>
        <Text style={styles.time}>00:00</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!hasAudio}
        onPress={() => setIsPlaying((current) => !current)}
        style={({ pressed }) => [
          styles.button,
          !hasAudio ? styles.buttonDisabled : null,
          pressed ? styles.buttonPressed : null,
        ]}
      >
        <Text style={styles.buttonLabel}>{isPlaying ? 'Pause' : 'Lecture'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111826',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#243044',
    padding: 16,
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  status: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 100,
    backgroundColor: '#243044',
    overflow: 'hidden',
  },
  progress: {
    width: '0%',
    height: '100%',
    backgroundColor: '#243044',
  },
  progressActive: {
    width: '33%',
    backgroundColor: '#6D5EF6',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: '#94A3B8',
    fontSize: 12,
  },
  button: {
    marginTop: 2,
    backgroundColor: '#6D5EF6',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: '#243044',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});