import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { createApiStandardResponse, signTransaction } from './utils';
import { IApiStandardResponse, RPC_METHOD } from './common-types';
import connectionService from './connection-service';
import { ParticleNetwork } from '@particle-network/provider';
import marketDatabase from './market-database';

export async function settleNFT(
  provider: ParticleNetwork,
  settleUuid: string
): Promise<IApiStandardResponse> {
  const address = provider.auth.userInfo()!.address;
  console.log(`settleNFT:${address}`, settleUuid);

  const settleEntity = await marketDatabase.settles.where({ uuid: settleUuid }).first();
  if (!settleEntity) {
    return createApiStandardResponse('Settle not found in local');
  }

  const responseNFTSettle = await connectionService.rpcRequest(RPC_METHOD.NFT_SETTLE, address, {
    mint: settleEntity.nft.mint,
    auctionManager: settleEntity.auctionManager,
  });

  if (responseNFTSettle.error) {
    return createApiStandardResponse(responseNFTSettle.error);
  }

  const responseSigned = await signTransaction(
    provider,
    responseNFTSettle.result.transaction.serialized
  );

  if (responseSigned.error) {
    return createApiStandardResponse(responseSigned.error);
  }

  const responseConfirm = await connectionService.rpcRequest(
    RPC_METHOD.SEND_AND_CONFIRM_RAW_TRANSACTION,
    bs58.encode(Buffer.from(responseSigned.result, 'base64')),
    {
      commitment: 'recent',
    }
  );

  if (responseConfirm.error) {
    return createApiStandardResponse(responseConfirm.error);
  }

  await marketDatabase.settles.where({ uuid: settleUuid }).delete();

  return createApiStandardResponse();
}
