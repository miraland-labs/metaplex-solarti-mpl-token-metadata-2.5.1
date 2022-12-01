/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solarti/web3.js';

/**
 * @category Instructions
 * @category CloseEscrowAccount
 * @category generated
 */
export const CloseEscrowAccountStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number;
}>([['instructionDiscriminator', beet.u8]], 'CloseEscrowAccountInstructionArgs');
/**
 * Accounts required by the _CloseEscrowAccount_ instruction
 *
 * @property [_writable_] escrow Escrow account
 * @property [_writable_] metadata Metadata account
 * @property [] mint Mint account
 * @property [] tokenAccount Token account
 * @property [] edition Edition account
 * @property [_writable_, **signer**] payer Wallet paying for the transaction and new account
 * @property [] sysvarInstructions Instructions sysvar account
 * @category Instructions
 * @category CloseEscrowAccount
 * @category generated
 */
export type CloseEscrowAccountInstructionAccounts = {
  escrow: web3.PublicKey;
  metadata: web3.PublicKey;
  mint: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  edition: web3.PublicKey;
  payer: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  sysvarInstructions: web3.PublicKey;
};

export const closeEscrowAccountInstructionDiscriminator = 39;

/**
 * Creates a _CloseEscrowAccount_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CloseEscrowAccount
 * @category generated
 */
export function createCloseEscrowAccountInstruction(
  accounts: CloseEscrowAccountInstructionAccounts,
  programId = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
) {
  const [data] = CloseEscrowAccountStruct.serialize({
    instructionDiscriminator: closeEscrowAccountInstructionDiscriminator,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.escrow,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.metadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.edition,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.sysvarInstructions,
      isWritable: false,
      isSigner: false,
    },
  ];

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  });
  return ix;
}
