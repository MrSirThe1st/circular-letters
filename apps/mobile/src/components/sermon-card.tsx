import { Pressable, StyleSheet, Text, View } from 'react-native';

type SermonCardProps = {
  title: string;
  dateLabel: string;
  preview: string;
  hasAudio: boolean;
  onPress: () => void;
};

export function SermonCard({
  title,
  dateLabel,
  preview,
  hasAudio,
  onPress,
}: SermonCardProps): JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </View>
      <Text style={styles.preview}>{preview}</Text>
      <Text style={styles.audio}>{hasAudio ? 'Audio disponible' : 'Sans audio'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111826',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#243044',
    padding: 16,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  preview: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
  },
  audio: {
    color: '#6D5EF6',
    fontSize: 13,
    fontWeight: '600',
  },
});