import { RESTDataSource } from "@apollo/datasource-rest";

export class JSONPlaceholderAPI extends RESTDataSource {
    baseURL = 'https://jsonplaceholder.typicode.com/';

    async getPost(id) {
        const post = await this.get(`posts/${encodeURIComponent(id)}`);
        return {
            ...post,
            user: {
                id: post.userId
            }
        };
    }

    async listPosts() {
        const posts = await this.get(`posts`);
        return posts.map(it => ({
            ...it,
            user: {
                id: it.userId
            }
        }));
    }

    async getUser(id) {
        return this.get(`users/${encodeURIComponent(id)}`);
    }

    async listUsers() {
        return this.get(`users`);
    }

    async getComment(id) {
        const comment = await this.get(`comments/${encodeURIComponent(id)}`);
        return {
            ...comment,
            post: {
                id: comment.postId
            }
        };
    }

    async listComments() {
        const comments = await this.get(`comments`);
        return comments.map(it => ({
            ...it,
            post: {
                id: it.postId
            }
        }));
    }
}
