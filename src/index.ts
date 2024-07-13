import { DutchOrderBuilder, NonceManager } from '@uniswap/uniswapx-sdk';
import { BigNumber, ethers } from 'ethers';
import 'dotenv/config'

async function main() {
  const RPC_URL = 'https://mainnet.infura.io/v3/1301ac078b854c40887bdc6d21d2e2da';
  const CHAIN_ID = 1;

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const account = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  const nonceMgr = new NonceManager(provider, 1); 
  const nonce = await nonceMgr.useNonce(account.address); 

  const builder = new DutchOrderBuilder(CHAIN_ID);
  // set deadline to 1 hour from now
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const order = builder
    .deadline(deadline)
    .decayEndTime(deadline)
    .decayStartTime(deadline - 100)
    .nonce(nonce)
    .input({
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      startAmount: BigNumber.from('1000000'),
      endAmount: BigNumber.from('900000'),
    })
    .output({
      token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      startAmount: BigNumber.from('1000000000000000000'),
      endAmount: BigNumber.from('900000000000000000'),
      recipient: '0x0000000000000000000000000000000000000000',
    })
    .swapper(account.address)
    .build();
  
  // Sign the built order 
  const { domain, types, values } = order.permitData();
  console.log(domain, types, values);
  const signature = await account._signTypedData(domain, types, values);
  console.log(signature);

  const serializedOrder = order.serialize();
  console.log(serializedOrder);
  // submit serializedOrder and signature to order pool
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
