import {
    FastifyBaseLogger,
    FastifyInstance,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
} from 'fastify';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { getRoute } from './services/routerService';
import { Chain, getAllTokens } from '@virtuswap/v1-sdk';

async function routes(
    fastify: FastifyInstance<
        RawServerDefault,
        RawRequestDefaultExpression,
        RawReplyDefaultExpression,
        FastifyBaseLogger,
        TypeBoxTypeProvider
    >
) {
    fastify.get(
        '/route',
        {
            schema: {
                description:
                    'Get route and generate transaction data if `userAddress` is provided',
                querystring: Type.Object({
                    tokenIn: Type.String({
                        description: 'The address of input token',
                        examples: [
                            '0x0000000000000000000000000000000000000000',
                        ],
                    }),
                    tokenOut: Type.String({
                        description: 'The address of output token',
                        examples: [
                            '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                        ],
                    }),
                    amount: Type.Union(
                        [Type.String(), Type.Integer({ exclusiveMinimum: 0 })],
                        {
                            description:
                                'Amount of `tokenIn` if `isExactInput`=`true` or amount of `tokenOut` if `isExactInput`=`false`',
                            examples: ['5000000000000000000'],
                        }
                    ),
                    chain: Type.Enum(Chain, {
                        description:
                            'The chain on which swap will be performed',
                        examples: [Chain.POLYGON_MAINNET],
                    }),
                    slippage: Type.Optional(Type.Number({ minimum: 0 })),
                    isExactInput: Type.Optional(
                        Type.Boolean({
                            description:
                                'Swap mode: use `true` for exact input (default value) or `false` for exact output',
                            examples: [true],
                        })
                    ),
                    userAddress: Type.Optional(
                        Type.String({
                            description:
                                'The address of user who want to swap tokens',
                            examples: [
                                '0x6133d2dBc8688ea02faaC9e499b7Cd144bb4ca5E',
                            ],
                        })
                    ),
                }),
            },
        },
        async (request, response) => {
            const {
                tokenIn,
                tokenOut,
                amount,
                chain,
                slippage,
                isExactInput,
                userAddress,
            } = request.query;

            const res = await getRoute(
                tokenIn,
                tokenOut,
                amount,
                chain,
                slippage,
                isExactInput,
                userAddress
            );

            response.send(res);
        }
    );

    fastify.get(
        '/tokens',
        {
            schema: {
                description: 'Get all supported tokens on the selected chain',
                querystring: Type.Object({
                    chain: Type.Enum(Chain, {
                        description:
                            'The chain for which tokens should be fetched',
                        examples: [Chain.POLYGON_MAINNET],
                    }),
                }),
            },
        },
        async (request, response) => {
            const { chain } = request.query;
            const res = await getAllTokens(chain);
            response.send(res);
        }
    );
}

export default routes;
