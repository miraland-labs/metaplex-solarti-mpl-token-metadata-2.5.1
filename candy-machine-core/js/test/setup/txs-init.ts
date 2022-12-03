import {
  ConfirmedTransactionAssertablePromise,
  GenLabeledKeypair,
  LoadOrGenKeypair,
  LOCALHOST,
  PayerTransactionHandler,
} from '@metaplex-solarti/amman-client';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_SLOT_HASHES_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solarti/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from '@solarti/spl-token';
import { Test } from 'tape';
import * as program from '../../src/generated';
import { CandyMachine, CandyMachineData } from '../../src/generated';
import { amman } from '.';
import { COLLECTION_METADATA, getCandyMachineSpace } from '../utils';
import {
  // findAssociatedTokenAccountPda,
  findCandyMachineV2CreatorPda,
  // findCollectionAuthorityRecordPda,
  // findMasterEditionV2Pda,
  // findMetadataPda,
  keypairIdentity,
  Metaplex,
} from '@metaplex-solarti/js';

const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export class InitTransactions {
  readonly getKeypair: LoadOrGenKeypair | GenLabeledKeypair;

  constructor(readonly resuseKeypairs = false) {
    this.getKeypair = resuseKeypairs ? amman.loadOrGenKeypair : amman.genLabeledKeypair;
  }

  async payer() {
    const [payer, payerPair] = await this.getKeypair('Payer');

    const connection = new Connection(LOCALHOST, 'confirmed');
    await amman.airdrop(connection, payer, 2);

    const transactionHandler = amman.payerTransactionHandler(connection, payerPair);

    return {
      fstTxHandler: transactionHandler,
      connection,
      payer,
      payerPair,
    };
  }

  async authority() {
    const [authority, authorityPair] = await this.getKeypair('Authority');

    const connection = new Connection(LOCALHOST, 'confirmed');
    await amman.airdrop(connection, authority, 2);

    const transactionHandler = amman.payerTransactionHandler(connection, authorityPair);

    return {
      fstTxHandler: transactionHandler,
      connection,
      authority,
      authorityPair,
    };
  }

  async minter() {
    const [minter, minterPair] = await this.getKeypair('Minter');

    const connection = new Connection(LOCALHOST, 'confirmed');
    await amman.airdrop(connection, minter, 2);

    const transactionHandler = amman.payerTransactionHandler(connection, minterPair);

    return {
      fstTxHandler: transactionHandler,
      connection,
      minter,
      minterPair,
    };
  }

  async initialize(
    t: Test,
    payer: Keypair,
    data: program.CandyMachineData,
    handler: PayerTransactionHandler,
    connection: Connection,
  ): Promise<{ tx: ConfirmedTransactionAssertablePromise; candyMachine: PublicKey }> {
    // creates a collection nft
    const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));

    const { nft: collection } = await metaplex
      .nfts()
      .create({
        uri: COLLECTION_METADATA,
        name: 'CORE Collection',
        sellerFeeBasisPoints: 500,
      });

    const [, candyMachine] = await this.getKeypair('Candy Machine Account');
    const authorityPda = findCandyMachineV2CreatorPda(candyMachine.publicKey, program.PROGRAM_ID);

    await amman.addr.addLabel('Collection Mint', collection.address);

    // m17 deprecated
    // findCollectionAuthorityRecordPda
    const collectionAuthorityRecord = metaplex.nfts().pdas().collectionAuthorityRecord(
      {mint: collection.mint.address, collectionAuthority: collection.mint.mintAuthorityAddress}
    );
    await amman.addr.addLabel('Collection Authority Record', collectionAuthorityRecord);

    const collectionMetadata = metaplex.nfts().pdas().metadata({mint: collection.mint.address});
    await amman.addr.addLabel('Collection Metadata', collectionMetadata);

    const collectionMasterEdition = metaplex.nfts().pdas().masterEdition({mint: collection.mint.address});
    await amman.addr.addLabel('Collection Master Edition', collectionMasterEdition);

    const accounts: program.InitializeInstructionAccounts = {
      authorityPda,
      collectionUpdateAuthority: collection.updateAuthorityAddress,
      candyMachine: candyMachine.publicKey,
      authority: payer.publicKey,
      payer: payer.publicKey,
      collectionMetadata,
      collectionMint: collection.address,
      collectionMasterEdition,
      collectionAuthorityRecord,
      tokenMetadataProgram: METAPLEX_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };

    const args: program.InitializeInstructionArgs = {
      data: data,
    };

    const ixInitialize = program.createInitializeInstruction(accounts, args);
    const ixCreateAccount = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: candyMachine.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(getCandyMachineSpace(data)),
      space: getCandyMachineSpace(data),
      programId: program.PROGRAM_ID,
    });

    const tx = new Transaction().add(ixCreateAccount).add(ixInitialize);

    const txPromise = handler.sendAndConfirmTransaction(
      tx,
      [candyMachine, payer],
      'tx: Initialize',
    );

    return { tx: txPromise, candyMachine: candyMachine.publicKey };
  }

  async addConfigLines(
    t: Test,
    candyMachine: PublicKey,
    payer: Keypair,
    lines: program.ConfigLine[],
  ): Promise<{ txs: Transaction[] }> {
    const accounts: program.AddConfigLinesInstructionAccounts = {
      candyMachine: candyMachine,
      authority: payer.publicKey,
    };

    const txs: Transaction[] = [];
    let start = 0;

    while (start < lines.length) {
      // sends the config lines in chunks of 10
      const limit = Math.min(lines.length - start, 10);
      const args: program.AddConfigLinesInstructionArgs = {
        configLines: lines.slice(start, start + limit),
        index: start,
      };

      const ix = program.createAddConfigLinesInstruction(accounts, args);
      txs.push(new Transaction().add(ix));

      start = start + limit;
    }

    return { txs };
  }

  async updateCandyMachine(
    t: Test,
    candyMachine: PublicKey,
    payer: Keypair,
    data: CandyMachineData,
    handler: PayerTransactionHandler,
  ): Promise<{ tx: ConfirmedTransactionAssertablePromise }> {
    const accounts: program.UpdateInstructionAccounts = {
      candyMachine: candyMachine,
      authority: payer.publicKey,
    };

    const args: program.UpdateInstructionArgs = {
      data: data,
    };

    const ix = program.createUpdateInstruction(accounts, args);
    const tx = new Transaction().add(ix);

    return { tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Update') };
  }

  async mint(
    t: Test,
    candyMachine: PublicKey,
    payer: Keypair,
    handler: PayerTransactionHandler,
    connection: Connection,
  ): Promise<{ tx: ConfirmedTransactionAssertablePromise; mintAddress: PublicKey }> {
    const candyMachineObject = await CandyMachine.fromAccountAddress(connection, candyMachine);
    // mint address
    const [nftMint, mintPair] = await this.getKeypair('mint');
    await amman.addr.addLabel('NFT Mint', nftMint);
    const metaplex = Metaplex.make(connection).use(keypairIdentity(payer));
    // PDAs required for the mint
    const nftMetadata = metaplex.nfts().pdas().metadata({mint: nftMint});
    const nftMasterEdition = metaplex.nfts().pdas().masterEdition({mint: nftMint});
    // const nftTokenAccount = findAssociatedTokenAccountPda(nftMint, payer.publicKey);
    const nftTokenAccount = await getAssociatedTokenAddress(nftMint, payer.publicKey);
    const collectionMint = candyMachineObject.collectionMint;
    // retrieves the collection nft
    const collection = await metaplex.nfts().findByMint({ mintAddress: collectionMint });
    // collection PDAs
    const authorityPda = findCandyMachineV2CreatorPda(candyMachine, program.PROGRAM_ID);
    const collectionAuthorityRecord = metaplex.nfts().pdas().collectionAuthorityRecord(
      {mint: collectionMint, collectionAuthority: collection.mint.mintAuthorityAddress}
    );
    const collectionMetadata = metaplex.nfts().pdas().metadata({mint: collectionMint});
    const collectionMasterEdition = metaplex.nfts().pdas().masterEdition({mint: collectionMint});

    const accounts: program.MintInstructionAccounts = {
      candyMachine: candyMachine,
      authorityPda,
      mintAuthority: candyMachineObject.mintAuthority,
      payer: payer.publicKey,
      nftMint,
      nftMintAuthority: payer.publicKey,
      nftMetadata,
      nftMasterEdition,
      collectionAuthorityRecord,
      collectionMint,
      collectionUpdateAuthority: collection.updateAuthorityAddress,
      collectionMetadata,
      collectionMasterEdition,
      tokenMetadataProgram: METAPLEX_PROGRAM_ID,
      recentSlothashes: SYSVAR_SLOT_HASHES_PUBKEY,
    };

    const ixs: TransactionInstruction[] = [];
    ixs.push(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: nftMint,
        lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );
    ixs.push(createInitializeMintInstruction(nftMint, 0, payer.publicKey, payer.publicKey));
    ixs.push(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        nftTokenAccount,
        payer.publicKey,
        nftMint,
      ),
    );
    ixs.push(createMintToInstruction(nftMint, nftTokenAccount, payer.publicKey, 1, []));
    // candy machine mint instruction
    ixs.push(program.createMintInstruction(accounts));
    const tx = new Transaction().add(...ixs);

    return {
      tx: handler.sendAndConfirmTransaction(tx, [payer, mintPair], 'tx: Mint'),
      mintAddress: nftMint,
    };
  }

  async withdraw(
    t: Test,
    candyMachine: PublicKey,
    payer: Keypair,
    handler: PayerTransactionHandler,
  ): Promise<{ tx: ConfirmedTransactionAssertablePromise }> {
    const accounts: program.WithdrawInstructionAccounts = {
      candyMachine: candyMachine,
      authority: payer.publicKey,
    };

    const ix = program.createWithdrawInstruction(accounts);
    const tx = new Transaction().add(ix);

    return { tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Withdraw') };
  }
}
