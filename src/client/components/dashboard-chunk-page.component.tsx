import * as filesize from 'filesize';
import * as React from 'react';
import { StatsCompilation } from 'webpack';
import {
  compareNodeModules,
  getNodeModuleCount,
  getNodeModuleSize,
  getTotalModuleCount,
  getTreeShakablePercent
} from '../stat-reducers';
import { ChangedModuleGraph } from './graphs/changed-module-graph.component';
import { TreeShakeHint } from './hints/hints.component';
import { ModuleTable } from './module-table.component';
import { CounterPanel } from './panels/counter-panel.component';
import { NodeModulePanel } from './panels/node-module-panel.component';
import { PanelArrangement } from './panels/panel-arrangement.component';
import { Placeholder } from './placeholder.component';
import { formatPercent } from './util';



export const DashboardChunkPage: React.FC<{
  chunk: number;
  first: StatsCompilation;
  last: StatsCompilation;
}> = ({ first, last, chunk }) => {
  const firstObj = first.chunks!.find(c => c.id === chunk);
  const lastSize = last.chunks!.find(c => c.id === chunk);
  const nodeModules = compareNodeModules(first, last);

  return (
    <>
      <div className="row" style={{ padding: 1 }}>
        <div className="col-xs-12 col-sm-6">
          <h2>Chunk Stats</h2>
          <PanelArrangement>
            <CounterPanel
              title="Total Modules"
              value={getTotalModuleCount(last, chunk)}
              oldValue={getTotalModuleCount(first, chunk)}
            />
            <CounterPanel
              title="Node Module Count"
              value={getNodeModuleCount(last, chunk)}
              oldValue={getNodeModuleCount(first, chunk)}
            />
            <CounterPanel
              title="Tree-Shaken Node Modules"
              hint={TreeShakeHint}
              value={getTreeShakablePercent(last, chunk)}
              oldValue={getTreeShakablePercent(first, chunk)}
              formatter={formatPercent}
            />
            <CounterPanel
              title="Total Size"
              value={lastSize ? lastSize.size : 0}
              oldValue={firstObj ? firstObj.size : 0}
              formatter={filesize}
            />
            <CounterPanel
              title="Node Module Size"
              value={getNodeModuleSize(last, chunk)}
              oldValue={getNodeModuleSize(first, chunk)}
              formatter={filesize}
            />
          </PanelArrangement>

          <h2>
            Node Modules
            <small>Click on a module to view more information about it.</small>
          </h2>
          <PanelArrangement>
            {nodeModules
              .sort((a, b) => (b.new ? b.new.totalSize : 0) - (a.new ? a.new.totalSize : 0))
              .map(comparison => (
                <NodeModulePanel comparison={comparison} key={comparison.name} inChunk={chunk} />
              ))}
          </PanelArrangement>
          {nodeModules.length === 0 && <Placeholder>Huzzah! You have no dependencies!</Placeholder>}
        </div>
        <div className="col-xs-12 col-sm-6">
          <h2>Module List</h2>
          <ModuleTable first={first} last={last} inChunk={chunk} />
        </div>
      </div>
      <h2>
        Bundle Tree<small>Only changed files, and their parents, are displayed.</small>
      </h2>
      <ChangedModuleGraph previous={first} stats={last} chunkId={chunk} />
    </>
  );
};
