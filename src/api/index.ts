import { createRequests } from "./requests";

export const Requests = createRequests({
	accessTokenKey: "access_token",
	urlPrefix: "",
	numOfSeccondsToRenewTokenBeforeExpiration: 0,
	requireLoginForActionPromise: {} as any,
	updateAccessToken: {} as any,
	initialConfig: {
		headers: {
		},
	},
	logoutUser: {} as any,
});
