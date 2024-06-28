import { Chain, Router, Token, chainInfo } from '@virtuswap/v1-sdk';
import { BigNumberish, ethers } from 'ethers';

export async function getRoute(
    tokenInAddress: string,
    tokenOutAddress: string,
    amount: BigNumberish,
    chain: Chain,
    slippage = 1000,
    isExactInput = true,
    userAddress?: string
) {
    const providers = {
        137: 'https://polygon-bor-rpc.publicnode.com',
        42161: 'https://arbitrum-one-rpc.publicnode.com',
    } as Record<Chain, string>;
    const provider = ethers.providers.getDefaultProvider(
        providers[chain] ?? chain
    );
    let decimalsIn = 18;
    let decimalsOut = 18;

    const decimalsAbi = ['function decimals() view returns (uint8)'];

    // get tokenIn decimals if ERC-20
    if (new Token(chain, tokenInAddress, decimalsIn).isErc20) {
        const tokenInContract = new ethers.Contract(
            tokenInAddress,
            decimalsAbi,
            provider
        );
        decimalsIn = await tokenInContract.decimals();
    }

    // get tokenOut decimals if ERC-20
    if (new Token(chain, tokenOutAddress, decimalsOut).isErc20) {
        const tokenOutContract = new ethers.Contract(
            tokenOutAddress,
            decimalsAbi,
            provider
        );
        decimalsOut = await tokenOutContract.decimals();
    }

    const tokenIn = new Token(chain, tokenInAddress, decimalsIn);
    const tokenOut = new Token(chain, tokenOutAddress, decimalsOut);

    const router = new Router();

    const route = await router.getRoute(tokenIn, tokenOut, amount, chain, {
        slippage,
        isExactInput,
    });

    if (!userAddress) return { route };

    const calldata = await router.generateMulticallData(route, userAddress);

    const routerMulticallInterface = new ethers.utils.Interface([
        'function multicall(bytes[] calldata data) public payable returns (bytes[] memory results)',
    ]);

    const data = routerMulticallInterface.encodeFunctionData('multicall', [
        calldata,
    ]);

    return {
        route,
        transaction: {
            from: userAddress,
            to: chainInfo[chain].routerAddress,
            data,
            value: route.tokenIn.isNative
                ? route.tokenIn.balanceBN.toString()
                : '0',
        },
    };
}
