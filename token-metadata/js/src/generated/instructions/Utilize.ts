/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solarti/spl-token';
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solarti/web3.js';
import { UtilizeArgs, utilizeArgsBeet } from '../types/UtilizeArgs';

/**
 * @category Instructions
 * @category Utilize
 * @category generated
 */
export type UtilizeInstructionArgs = {
  utilizeArgs: UtilizeArgs;
};
/**
 * @category Instructions
 * @category Utilize
 * @category generated
 */
export const UtilizeStruct = new beet.BeetArgsStruct<
  UtilizeInstructionArgs & {
    instructionDiscriminator: number;
  }
>(
  [
    ['instructionDiscriminator', beet.u8],
    ['utilizeArgs', utilizeArgsBeet],
  ],
  'UtilizeInstructionArgs',
);
/**
 * Accounts required by the _Utilize_ instruction
 *
 * @property [_writable_] metadata Metadata account
 * @property [_writable_] tokenAccount Token Account Of NFT
 * @property [_writable_] mint Mint of the Metadata
 * @property [_writable_, **signer**] useAuthority A Use Authority / Can be the current Owner of the NFT
 * @property [] owner Owner
 * @property [_writable_] useAuthorityRecord (optional) Use Authority Record PDA If present the program Assumes a delegated use authority
 * @property [] burner (optional) Program As Signer (Burner)
 * @category Instructions
 * @category Utilize
 * @category generated
 */
export type UtilizeInstructionAccounts = {
  metadata: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  mint: web3.PublicKey;
  useAuthority: web3.PublicKey;
  owner: web3.PublicKey;
  tokenProgram?: web3.PublicKey;
  ataProgram?: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  rent?: web3.PublicKey;
  useAuthorityRecord?: web3.PublicKey;
  burner?: web3.PublicKey;
};

export const utilizeInstructionDiscriminator = 19;

/**
 * Creates a _Utilize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Utilize
 * @category generated
 */
export function createUtilizeInstruction(
  accounts: UtilizeInstructionAccounts,
  args: UtilizeInstructionArgs,
  programId = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
) {
  const [data] = UtilizeStruct.serialize({
    instructionDiscriminator: utilizeInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.metadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.useAuthority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.owner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.ataProgram ?? splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
  ];

  if (accounts.useAuthorityRecord != null) {
    keys.push({
      pubkey: accounts.useAuthorityRecord,
      isWritable: true,
      isSigner: false,
    });
  }

  if (accounts.burner != null) {
    if (accounts.useAuthorityRecord == null) {
      throw new Error(
        "When providing 'burner' then 'accounts.useAuthorityRecord' need(s) to be provided as well.",
      );
    }
    keys.push({
      pubkey: accounts.burner,
      isWritable: false,
      isSigner: false,
    });
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  });
  return ix;
}
