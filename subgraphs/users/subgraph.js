import { parse } from "graphql";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { resolvers } from "./resolvers.js";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { UsersAPI } from "./data-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const typeDefs = parse(
    readFileSync(resolve(__dirname, "schema.graphql"), "utf8")
);

export const getUsersSchema = () => buildSubgraphSchema([{ typeDefs, resolvers }]);

export const getUsersDataSources = () => {
    // Initialize data sources here
    return {
        usersApi: new UsersAPI()
    }
};
