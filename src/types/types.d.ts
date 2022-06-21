export enum NftListType {
  Market = 'Market',
  MintNft = 'MintNft',
  MyNft = 'MyNft',
  SettleAccounts = 'SettleAccounts',
  UncompletedTransaction = 'UncompletedTransaction',
}

export interface UserInfoProp {
  address?: string;
  wsolBalance: number;
  balance: number;
}

export interface NftData {
  mint: string;
  nft: any;
}
