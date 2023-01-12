import { forwardRef } from 'react';
import {
  LinkProps as RouterLinkProps,
  Link as RouterLink,
} from 'react-router-dom';

export const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function Link(itemProps, ref) {
    return <RouterLink ref={ref} {...itemProps} role={undefined} />;
  }
);
