import { RESTDataSource } from "@apollo/datasource-rest";

export class CommentsAPI extends RESTDataSource {
    baseURL = 'https://jsonplaceholder.typicode.com/';

    async getComment(id, context) {
        const cache = context?.cache;
        const cacheKey = `comment:${id}`;

        if (cache) {
            const cacheResult = await cache.get(cacheKey);
            if (cacheResult) {
                console.log(`Cache hit on ${cacheKey}`);
                return cacheResult;
            }
        }

        const comment = await this.get(`comments/${encodeURIComponent(id)}`);
        const result = {
            ...comment,
            post: {
                id: comment.postId
            }
        };

        if (cache) {
            cache.set(cacheKey, result)
        }

        return result;
    }

    async listComments(context) {
        const comments = await this.get(`comments`);
        return comments.map(it => ({
            ...it,
            post: {
                id: it.postId
            }
        }));
    }
}
