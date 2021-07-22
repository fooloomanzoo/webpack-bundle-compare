import * as React from 'react';
import styles from './button.component.scss';
import { classes } from './util';


type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { variant?: string; size?: 'small' | 'large' | 'normal' };

export const Button: React.FC<Props> = ({ variant = 'highlight', size = 'normal', ...props }) => {
  return (
    <button
      {...props}
      className={classes(props.className, styles.button)}
      data-variant={`${variant} ${size}`}
    />
  );
};
