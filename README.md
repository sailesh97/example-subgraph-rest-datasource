# Apollo Server RESTDataSource Demo

This repository demonstrates how to use [RESTDataSource](https://github.com/apollographql/datasource-rest) in an Apollo Server v4 subgraph and make the data available via the Router.

## Running the Example
- Start all the subgraphs in the `/subgraphs` directory
  - Install dependencies with `npm install`
  - Start the server and endpoints with `npm start`
  - Subgraph should be running at `http://localhost:4001/{subgraph}/graphql`
- Start Apollo Router in the `/router` directory
  - Download the router by running `./download_router.sh`
  - Compose the schema by running `./create_local_schema.sh`
  - Run the router by running `./start_router.sh`
  - You can now open the Router at http://127.0.0.1:4000/ and start querying.

## Example Queries

### Basic

```
query AllComments {
  allComments {
    id
    name
    post {
      id
      body
      user {
        id
        name
      }
    }
  }
}
```
