import React from 'react';
import { SpeedInsights as SpeedInsightsScript } from '../react';
import type { SpeedInsightsProps } from '../types';
import { getBasePath, useRoute } from './utils';

export function SpeedInsights(
  props: Omit<SpeedInsightsProps, 'route'>,
): JSX.Element {
  const route = useRoute();

  return (
    <SpeedInsightsScript
      route={route}
      {...props}
      framework="remix"
      basePath={getBasePath()}
    />
  );
}
