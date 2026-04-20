import Link from 'next/link';
import type { Sermon } from '@sermon-app/shared';
import type { JSX } from 'react';
import { setSermonStatusAction } from '../lib/sermons/sermon-actions';
import { formatDateLabel } from '../lib/sermons/sermon-utils';
import { SermonContent } from './sermon-content';

type SermonListProps = {
  sermons: Sermon[];
  emptyMessage?: string;
};

export function SermonList({ sermons, emptyMessage }: SermonListProps): JSX.Element {
  if (sermons.length === 0) {
    return (
      <div className="empty-state">
        {emptyMessage ??
          'Aucun sermon pour le moment. Cree le premier brouillon pour etablir le flux admin avant de brancher la base de donnees.'}
      </div>
    );
  }

  return (
    <div className="sermon-list">
      {sermons.map((sermon) => (
        <article className="sermon-card" key={sermon.id}>
          <div>
            <div className="sermon-meta">
              <span className={sermon.status === 'draft' ? 'badge badge-draft' : 'badge'}>
                {sermon.status === 'draft' ? 'Brouillon' : 'Publie'}
              </span>
              <span>{formatDateLabel(sermon.date)}</span>
            </div>
            <h3>{sermon.title}</h3>
            <p>{sermon.audioUrl ? 'Audio lie' : 'Sans audio pour l\'instant'}</p>
            {sermon.audioUrl ? <audio className="audio-preview" controls preload="none" src={sermon.audioUrl} /> : null}
            <SermonContent content={sermon.content} previewBlocks={3} />
          </div>
          <div className="sermon-actions">
            <span className="sermon-updated">Maj {formatDateLabel(sermon.updatedAt)}</span>
            <div className="action-row action-row-compact">
              <Link className="button-secondary" href={`/sermons/${sermon.id}/review`}>
                Revoir
              </Link>
              <Link className="button-secondary" href={`/sermons/${sermon.id}`}>
                Modifier
              </Link>
              <form action={setSermonStatusAction}>
                <input name="id" type="hidden" value={sermon.id} />
                <input name="status" type="hidden" value={sermon.status === 'draft' ? 'published' : 'draft'} />
                <button className="button" type="submit">
                  {sermon.status === 'draft' ? 'Publier' : 'Repasser en brouillon'}
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}