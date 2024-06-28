import fastify from 'fastify';
import cors from '@fastify/cors';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import routes from './routes';

console.log('STARTING');

const _fastifyInstance = fastify({
    logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

process.on('uncaughtException', (err) => {
    _fastifyInstance.log.error(err);
    process.exit(1);
});

_fastifyInstance.register(cors, {
    origin: '*',
});

_fastifyInstance.register(routes);

_fastifyInstance.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    function (_req: any, body: any, done: any) {
        try {
            const json = JSON.parse(body);
            done(null, json);
        } catch (err: any) {
            err.statusCode = 400;
            _fastifyInstance.log.error(err);
            done(err, undefined);
        }
    }
);

_fastifyInstance.listen(
    { port: 3000, host: '::' },
    async function (err, address) {
        if (err) {
            _fastifyInstance.log.error(err);
            process.exit(1);
        }
        _fastifyInstance.log.info(`server listening on ${address}`);
    }
);

export default _fastifyInstance.log;
