
export default function consoleGraph(error) {
    if (error.graphQLErrors) {
        console.error("GraphQL Errors:", error.graphQLErrors);
    }
    if (error.networkError) {
        console.error("Network Error:", error.networkError);
    }
};