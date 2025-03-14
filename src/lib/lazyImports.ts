import { lazy } from 'react';

// Lazy-loaded components
export const DivorceTrendsLazy = lazy(() => import('@/components/form/DivorceTrends'));
export const SAOSTestComponentLazy = lazy(() => import('@/components/saos/SAOSTestComponent'));
export const DivorceFormDetailedLazy = lazy(() => import('@/components/form/DivorceFormDetailed'));
