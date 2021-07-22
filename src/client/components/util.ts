import { Base64 } from 'js-base64';
import styles from './util.component.scss';


export const classes = (...classList: Array<string | null | undefined>) => {
  let str = '';
  for (const cls of classList) {
    if (cls) {
      str += ' ' + cls;
    }
  }

  return str;
};

export const color = {
  dark: styles.colorDark,
  medium: styles.colorMedium,
  highlight: styles.colorPink,
  yellow: styles.colorYellow,
  blue: styles.colorBlue,
};

export const defaultFormatter = new Intl.NumberFormat();
export const percentageFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumSignificantDigits: 3,
});

export const formatValue = (
  value: number,
  formatter: null | ((value: number) => string) = v => defaultFormatter.format(v),
) => (formatter === null ? String(value) : formatter(value));

/**
 * Formats the difference between two numeric values.
 */
export const formatDifference = (
  a: number,
  b: number,
  formatter: null | ((value: number) => string) = v => defaultFormatter.format(v),
) => {
  const delta = b - a;
  return `${delta < 0 ? '-' : '+'}${formatValue(Math.abs(delta), formatter)}`;
};

/**
 * Formats a percentage (0-1).
 */
export const formatPercent = (percent: number) =>
  `${percentageFormatter.format(percent)}`;

/**
 * Formats the difference between two file sizes.
 */
export const formatPercentageDifference = (a: number, b: number) => {
  if (a === b) {
    return '+0%';
  }
  if (!a) {
    return 'new';
  }

  const delta = b / a - 1;
  return formatPercent(delta);
};

/**
 * Formats a duration.
 */
export const formatDuration = (durationInMs: number) => {
  if (durationInMs < 1000) {
    return `${durationInMs.toFixed(0)} ms`;
  }

  if (durationInMs < 10000) {
    return `${(durationInMs / 1000).toFixed(2)} s`;
  }

  if (durationInMs < 60000) {
    return `${(durationInMs / 1000).toFixed(1)} s`;
  }

  return `${(durationInMs / 1000 / 60).toFixed(1)} m`;
};

/**
 * Creates a link to the given module.
 */
export const linkToModule = (identifier: string) =>
  `/dashboard/ownmodule/${Base64.encodeURI(identifier)}`;

/**
 * Creates a link to the given node module.
 */
export const linkToNodeModule = (name: string) => `/dashboard/nodemodule/${Base64.encodeURI(name)}`;
