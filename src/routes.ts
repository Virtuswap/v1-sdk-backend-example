import {
    FastifyBaseLogger,
    FastifyInstance,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
} from 'fastify';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { getRoute } from './services/routerService';
import { getAllTokens } from '../../v1-sdk';

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
                querystring: Type.Object({
                    tokenIn: Type.String(),
                    tokenOut: Type.String(),
                    amount: Type.Union([
                        Type.String(),
                        Type.Number({ exclusiveMinimum: 0 }),
                    ]),
                    chain: Type.Number(),
                    slippage: Type.Optional(Type.Number({ minimum: 0 })),
                    isExactInput: Type.Optional(Type.Boolean()),
                    userAddress: Type.Optional(Type.String()),
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
                querystring: Type.Object({
                    chain: Type.Number(),
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
