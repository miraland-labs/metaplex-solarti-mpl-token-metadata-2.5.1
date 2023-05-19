import { initCusper } from '@miraplex/cusper';
import { errorFromCode } from './generated';

export const cusper = initCusper(errorFromCode);
