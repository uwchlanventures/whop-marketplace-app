import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { gql } from "@apollo/client";

// create http link
const httpLink = createHttpLink({
	uri: "https://api.whop.com/public-graphql",
});

// add auth headers
const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			authorization: `Bearer ${process.env.WHOP_API_KEY}`,
			"x-on-behalf-of-user-id": process.env.WHOP_AGENT_USER_ID,
			"x-company-id": process.env.WHOP_COMPANY_ID,
		},
	};
});

// create apollo client
const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

export default client;
