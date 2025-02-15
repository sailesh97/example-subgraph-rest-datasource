import { RESTDataSource } from "@apollo/datasource-rest";

export class PostsAPI extends RESTDataSource {
    baseURL = 'https://jsonplaceholder.typicode.com/';

    async getPost(id, context) {
        const cache = context?.cache;
        const cacheKey = `post:${id}`;

        if (cache) {
            const cacheResult = await cache.get(cacheKey);
            if (cacheResult) {
                console.log(`Cache hit on ${cacheKey}`);
                return cacheResult;
            }
        }

        const post = await this.get(`posts/${encodeURIComponent(id)}`);
        const result = {
            ...post,
            user: {
                id: post.userId
            }
        };

        if (cache) {
            cache.set(cacheKey, result);
        }

        return result;
    }

    async listPosts(context) {
        const posts = await this.get(`posts`);
        return posts.map(it => ({
            ...it,
            user: {
                id: it.userId
            }
        }));
    }

    async pushPost(args, context){
        // console.log('args---',args)
    
        const response = await this.post(`posts`,{
            body: JSON.stringify(args),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        // console.log('response of pushing a post---', response, context.cache);
        return response;
    }
}
