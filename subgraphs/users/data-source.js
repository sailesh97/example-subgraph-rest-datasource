import { RESTDataSource } from "@apollo/datasource-rest";

export class UsersAPI extends RESTDataSource {
    baseURL = 'https://jsonplaceholder.typicode.com/';

    async getUser(id, context) {
        const cache = context?.cache;
        const cacheKey = `user:${id}`;

        if (cache) {
            const cacheResult = await cache.get(cacheKey);
            if (cacheResult) {
                console.log(`Cache hit on ${cacheKey}`);
                return cacheResult;
            }
        }

        const result = await this.get(`users/${encodeURIComponent(id)}`);

        if (cache) {
            cache.set(cacheKey, result);
        }

        return result;
    }

    // Pass in the context to resolve any cache data
    async listUsers(context) {
        return this.get(`users`);
    }
}
