import type { MobileSermon } from '../types/sermons.types';

export const MOCK_SERMONS: MobileSermon[] = [
  {
    id: '34a43a6d-6b6c-4e75-9b1f-4ff3341f8021',
    title: 'Rester ferme dans la tempete',
    date: '2026-04-07T12:00:00.000Z',
    status: 'published',
    audioUrl: 'https://example.com/audio/sermon-1.mp3',
    content: {
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Quand les vents contraires soufflent, Dieu reste notre refuge et notre force.',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Nous apprenons a choisir la foi plutot que la peur, un pas a la fois.',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'd95e869a-8eb0-4abd-99b6-b8f4ca986be4',
    title: 'La parole qui restaure',
    date: '2026-03-28T12:00:00.000Z',
    status: 'published',
    audioUrl: null,
    content: {
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                version: 1,
                text: 'La parole de Dieu soigne les blessures cachees et redonne esperance.',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Ce message rappelle que la verite libere et reconstruit la vie interieure.',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
        ],
      },
    },
  },
];