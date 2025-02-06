import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { addMocksToSchema } from '@graphql-tools/mock';
import { getUsersSchema, getUsersDataSources } from './users/subgraph.js';
import { getCommentsDataSources, getCommentsSchema } from './comments/subgraph.js';
import { getPostsDataSources, getPostsSchema } from './posts/subgraph.js';

/**
 * This is a handy way to run a bunch of subgraphs in a monolith.
 * It is not needed for a basic setup, but you can see how each
 * Apollo Server instance is started below
 */
export const LOCAL_SUBGRAPH_CONFIG = [
    {
        name: 'comments',
        getSchema: getCommentsSchema,
        dataSources: getCommentsDataSources,
        mock: false
    },
    {
        name: 'posts',
        getSchema: getPostsSchema,
        dataSources: getPostsDataSources,
        mock: false
    },
    {
        name: 'users',
        getSchema: getUsersSchema,
        dataSources: getUsersDataSources,
        mock: false
    }
];

const getLocalSubgraphConfig = (subgraphName) =>
    LOCAL_SUBGRAPH_CONFIG.find(it => it.name === subgraphName);

export const startSubgraphs = async (httpPort) => {
    // Create a monolith express app for all subgraphs
    const app = express();
    const httpServer = http.createServer(app);
    const serverPort = process.env.PORT ?? httpPort;

    // Run each subgraph on the same http server, but at different paths
    for (const subgraph of LOCAL_SUBGRAPH_CONFIG) {
        const subgraphConfig = getLocalSubgraphConfig(subgraph.name);
        let schema;

        if (subgraphConfig.mock === true) {
            schema = addMocksToSchema({
                schema: subgraphConfig.getSchema()
            })
        } else {
            schema = subgraphConfig.getSchema();
        }

        const server = new ApolloServer({
            schema,
            // For a real subgraph introspection should remain off, but for demo we enabled
            introspection: true,
            plugins: [
                ApolloServerPluginDrainHttpServer({ httpServer }),
                ApolloServerPluginUsageReportingDisabled()
            ]
        });

        await server.start();

        const path = `/${subgraphConfig.name}/graphql`;
        app.use(
            path,
            cors(),
            bodyParser.json(),
            expressMiddleware(server, {
                context: async ({ req }) => {
                    return {
                        headers: req.headers,
                        dataSources: subgraphConfig.dataSources(),
                        cache: server.cache
                    };
                }
            })
        );

        console.log(`Setting up [${subgraphConfig.name}] subgraph at http://localhost:${serverPort}${path}`);
    }

    // Start entire monolith at given port
    await new Promise((resolve) => httpServer.listen({ port: serverPort }, resolve));
};
