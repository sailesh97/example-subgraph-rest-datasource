import fs from "fs";
import path from "path";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { parse } from "graphql";
import { resolvers } from "./resolvers.js";
import { JSONPlaceholderAPI } from "./dataSources/json-placeholder.js"

const typeDefs = parse(
  fs
    .readdirSync(path.resolve("src"))
    .filter((file) => path.extname(file) === ".graphql")
    .map((file) => fs.readFileSync(path.resolve("src", file), "utf-8"))
    .join("\n")
);


const jsonApi = new JSONPlaceholderAPI();
const topLevelCache = new InMemoryLRUCache();

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  cache: topLevelCache
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },
  context: () => {
    return {
      dataSources: {
        jsonApi
      },
      cache: topLevelCache
    };
  },
});

console.log(`🚀 Subgraph ready at: ${url}`);
