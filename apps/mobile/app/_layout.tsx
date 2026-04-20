import { Stack } from 'expo-router';

const SCREEN_BACKGROUND = '#0B0F14';
const BORDER_COLOR = '#243044';
const TITLE_COLOR = '#FFFFFF';

export default function RootLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: SCREEN_BACKGROUND },
        headerStyle: { backgroundColor: SCREEN_BACKGROUND },
        headerTintColor: TITLE_COLOR,
        headerTitleStyle: {
          color: TITLE_COLOR,
          fontSize: 18,
          fontWeight: '600',
        },
        headerShadowVisible: true,
        headerBackTitleVisible: false,
        headerLargeTitle: false,
        headerStyleInterpolator: undefined,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Predications',
          headerStyle: {
            backgroundColor: SCREEN_BACKGROUND,
            borderBottomColor: BORDER_COLOR,
          },
        }}
      />
      <Stack.Screen
        name="sermons/[id]"
        options={{
          title: 'Lecture',
          headerStyle: {
            backgroundColor: SCREEN_BACKGROUND,
            borderBottomColor: BORDER_COLOR,
          },
        }}
      />
    </Stack>
  );
}