import * as cytoscape from 'cytoscape';
import * as filesize from 'filesize';
import { Base64 } from 'js-base64';
import * as React from 'react';
import {
  getReasons,
  IWebpackModuleComparisonOutput,
  normalizeName,
  replaceLoaderInIdentifier
} from '../../stat-reducers';
import { IndefiniteProgressBar } from '../progress-bar.component';
import { formatPercentageDifference } from '../util';
import BaseGraph from './base-graph.component';



export const filterUnattachedEdges = (
  nodes: cytoscape.NodeDefinition[],
  edges: cytoscape.EdgeDefinition[],
) => {
  const nodeIds = new Set();
  for (const node of nodes) {
    nodeIds.add(node.data.id);
  }

  const outEdges: cytoscape.EdgeDefinition[] = [];
  for (const edge of edges) {
    if (nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)) {
      outEdges.push(edge);
    }
  }

  return outEdges;
};

export const fileSizeNode = ({
  fromSize,
  toSize,
  area,
  ...options
}: cytoscape.NodeDataDefinition & {
  fromSize: number;
  toSize: number;
  area: number;
}): cytoscape.NodeDataDefinition => {
  const hue = fromSize < toSize ? 0 : fromSize > toSize ? 110 : 55;
  const saturation = 40 + Math.min(60, (Math.abs(toSize - fromSize) / (toSize || 1)) * 100);

  return {
    ...options,
    label: `${options.label} (${filesize(toSize)}), ${formatPercentageDifference(
      fromSize,
      toSize,
    )}`,
    fontColor: fromSize !== toSize ? '#fff' : '#666',
    bgColor: fromSize !== toSize ? `hsl(${hue}, ${saturation}%, 50%)` : '#666',
    width: Math.round(2 * Math.sqrt(area / Math.PI)),
    height: Math.round(2 * Math.sqrt(area / Math.PI)),
  };
};

export const expandNode = <T extends { name: string }>({
  roots,
  getReasons: getReasonsFn,
  createNode,
  maxDepth = Infinity,
  limit = 1000,
}: {
  roots: T[];
  limit?: number;
  maxDepth?: number;
  getReasons(node: T): T[];
  createNode(node: T, id: string): cytoscape.NodeDataDefinition;
}) => {
  const queue = roots.map(node => ({ node, depth: 0 }));
  const nodes: cytoscape.NodeDefinition[] = [];
  const sources = new Set<string>(roots.map(q => q.name));
  const edges: cytoscape.EdgeDefinition[] = [];
  let needsFiltering = false;

  while (queue.length > 0) {
    const { node, depth } = queue.pop()!;
    if (depth > maxDepth) {
      needsFiltering = true;
      break;
    }

    if (--limit === 0) {
      needsFiltering = true;
      break;
    }

    const sourceEncoded = Base64.encodeURI(node.name);
    for (const found of getReasonsFn(node)) {
      const foundEncoded = Base64.encodeURI(found.name);

      if (!sources.has(found.name)) {
        sources.add(found.name);
        queue.push({ node: found, depth: depth + 1 });
      }

      edges.push({
        data: {
          id: `edge${sourceEncoded}to${foundEncoded}`,
          source: sourceEncoded,
          target: foundEncoded,
        },
      });
    }

    nodes.push({
      data: {
        ...createNode(node, sourceEncoded),
        depth,
      },
    });
  }

  nodes.sort((a, b) => a.data.depth - b.data.depth);

  return { nodes, edges: needsFiltering ? filterUnattachedEdges(nodes, edges) : edges };
};

export const expandModuleComparison = (
  comparisons: { [name: string]: IWebpackModuleComparisonOutput },
  roots: IWebpackModuleComparisonOutput[],
) => {
  const maxBubbleArea = 100;
  const minBubbleArea = 20;
  const allComparisons = Object.values(comparisons);
  const maxSize = allComparisons.reduce((max, cmp) => Math.max(max, cmp.toSize), 0);
  const entries: string[] = [];

  const { nodes, edges } = expandNode({
    roots,
    getReasons(node) {
      const output: IWebpackModuleComparisonOutput[] = [];

      for (const fnModule of [node.old, node.new]) {
        if (!fnModule) {
          continue;
        }

        for (const reason of getReasons(fnModule)) {
          const other = comparisons[normalizeName(reason.name || reason.moduleName)];
          if (other) {
            output.push(other);
          }

          if (reason.type && reason.type.includes('entry')) {
            entries.push(Base64.encodeURI(node.name));
          }
        }
      }

      return output;
    },
    createNode(node, id) {
      const weight = node.toSize / maxSize;
      const area = Math.max(minBubbleArea, maxBubbleArea * weight);

      return fileSizeNode({
        area,
        fromSize: node.fromSize,
        id,
        label: replaceLoaderInIdentifier(node.name),
        toSize: node.toSize,
      });
    },
  });

  return { nodes, edges, entries };
};

const BaseGraphDeferred = React.lazy(() => import('./base-graph.component'));

export const LazyBaseGraph: React.FC<React.ComponentPropsWithoutRef<typeof BaseGraph>> = props => (
  <React.Suspense fallback={<IndefiniteProgressBar />}>
    <BaseGraphDeferred {...props} />
  </React.Suspense>
);
