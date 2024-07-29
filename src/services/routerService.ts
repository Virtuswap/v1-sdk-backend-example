import { Chain, Router } from '@virtuswap/v1-sdk';
import { BigNumberish } from 'ethers';

export async function getRoute(
    tokenIn: string,
    tokenOut: string,
    amount: BigNumberish,
    chain: Chain,
    slippage = 1000,
    isExactInput = true,
    userAddress?: string
) {
    const router = new Router();

    const route = await router.getRoute(tokenIn, tokenOut, amount, chain, {
        slippage,
        isExactInput,
    });

    if (!userAddress) return { route };

    const transaction = await router.generateTransactionData(
        route,
        userAddress
    );

    return {
        route,
        transaction,
    };
}
