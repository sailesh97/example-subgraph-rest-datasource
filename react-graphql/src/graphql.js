import { GraphQLClient, gql } from "graphql-request";

const endpoint = "http://localhost:4001/posts/graphql"; // Replace with your API endpoint
const client = new GraphQLClient(endpoint);

// Mutation: Push a new post
const PUSH_POST = gql`
  query PushPost(
    $body: String,
    $title: String,
) {
    pushPost(
        body: $body
        title: $title
    ){
        id
        body
        title
        user {
            id
        }
    }
}
`;

// Query: Fetch all posts
const FETCH_ALL_POSTS = gql`query allPosts {
  allPosts {
    id
    body
    title
    user {
      id
    }
  }
}

`;

// Function to push a post
export const pushPost = async (title, body) => {
  try {
    const variables = { title, body };
    const response = await client.request(PUSH_POST, variables);
    return response.pushPost;
  } catch (error) {
    console.error("Error pushing post:", error);
  }
};

// Function to fetch all posts
export const fetchAllPosts = async () => {
  try {
    const response = await client.request(FETCH_ALL_POSTS);
    return response.allPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};
