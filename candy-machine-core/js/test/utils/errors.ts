import { initCusper } from '@miraplex/cusper';
import { errorFromCode } from '../../src/generated';

export const cusper = initCusper(errorFromCode);
