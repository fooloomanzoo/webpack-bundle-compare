import * as filesize from 'filesize';
import * as React from 'react';
import {
  IoIosInformationCircleOutline,
  IoIosThumbsUp
} from 'react-icons/io';
import { StatsCompilation } from 'webpack';
import {
  getEntryChunkSize,
  getNodeModuleSize,
  getTotalChunkSize,
  getTreeShakablePercent
} from '../stat-reducers';
import styles from './overview-suggestions.component.scss';
import {
  classes,
  formatPercent
} from './util';



interface IProps {
  first: StatsCompilation;
  last: StatsCompilation;
}

const epsilon = 1024 * 2;

function nodeModuleSizeTip(first: StatsCompilation, last: StatsCompilation) {
  const firstNodeModuleSize = getNodeModuleSize(first);
  const lastNodeModuleSize = getNodeModuleSize(last);
  if (lastNodeModuleSize > firstNodeModuleSize + epsilon) {
    return (
      <div className={classes(styles.tip, styles.suggestion)}>
        <IoIosInformationCircleOutline className={styles.icon} />
        <small>
          the size of node modules grew from {filesize(firstNodeModuleSize)} to{' '}
          {filesize(lastNodeModuleSize)}
        </small>
      </div>
    );
  }

  if (lastNodeModuleSize < firstNodeModuleSize - epsilon) {
    return (
      <div className={classes(styles.tip, styles.awesome)}>
        <small>dropped {filesize(firstNodeModuleSize - lastNodeModuleSize)} from node modules
        size</small>
      </div>
    );
  }

  return null;
}

function entrypointTip(last: StatsCompilation) {
  const totalSize = getTotalChunkSize(last);
  const entrySize = getEntryChunkSize(last);
  const isMajority = entrySize > totalSize / 2;
  if ((isMajority || entrySize > 1024 * 512) && totalSize > 1024 * 128) {
    return (
      <div className={classes(styles.tip, styles.suggestion)}>
        <IoIosInformationCircleOutline className={styles.icon} />
        <small>
          the entrypoint{' '}
          {isMajority
            ? `contains the majority (${filesize(entrySize)}) of the code.`
            : `is fairly large (${filesize(entrySize)}).`}
        </small>
      </div>
    );
  } else if (entrySize < totalSize / 5) {
    return (
      <div className={classes(styles.tip, styles.awesome)}>
        <IoIosThumbsUp className={styles.icon} />
        <small>the entrypoint is {formatPercent(entrySize / totalSize)} of
        the total code size</small>
      </div>
    );
  }

  return null;
}

function treeShakeTip(last: StatsCompilation) {
  const percent = getTreeShakablePercent(last);
  if (percent > 0.8) {
    return;
  }

  return (
    <div className={classes(styles.tip, styles.suggestion)}>
      <IoIosInformationCircleOutline className={styles.icon} />
      <small>{formatPercent(1 - percent)} of the dependencies aren't tree shaken.</small>
    </div>
  );
}

export const OverviewSuggestions: React.FC<IProps> = ({ first, last }) => {
  return (
    <>
      {nodeModuleSizeTip(first, last)}
      {entrypointTip(last)}
      {treeShakeTip(last)}
    </>
  );
};
