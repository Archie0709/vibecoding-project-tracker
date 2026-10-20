import { STAGES } from '../lib/constants';
import Column from './Column';

/** The four-column Kanban board. Columns come from STAGES (PRD §7). */
export default function Board({ tasks }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage) => (
        <Column
          key={stage.id}
          stage={stage}
          tasks={tasks.filter((t) => t.status === stage.id)}
        />
      ))}
    </div>
  );
}
