import { createContext } from 'react';

import type { Location } from 'react-router-dom';

export const RouteHistoryContext = createContext<Location | null>(null);
