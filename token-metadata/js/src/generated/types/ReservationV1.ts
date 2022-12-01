/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solarti/web3.js';
import * as beetSolana from '@metaplex-solarti/beet-solana';
import * as beet from '@metaplex-foundation/beet';
export type ReservationV1 = {
  address: web3.PublicKey;
  spotsRemaining: number;
  totalSpots: number;
};

/**
 * @category userTypes
 * @category generated
 */
export const reservationV1Beet = new beet.BeetArgsStruct<ReservationV1>(
  [
    ['address', beetSolana.publicKey],
    ['spotsRemaining', beet.u8],
    ['totalSpots', beet.u8],
  ],
  'ReservationV1',
);
