import * as origianljoi from "typesafe-joi";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import Joi from "../utils/joi";
import { readFile } from "../utils/file-reader";
import { mergeRecursive } from "../utils/common";
// import jwt from "jsonwebtoken";

export interface ICredentials {
	userId: number;
	accessToken: string;
	refreshToken: string;
}
interface IValidators {
	requestSchema?: origianljoi.Schema;
	responseSchema?: origianljoi.Schema;
}

function validate(data: any, schema?: origianljoi.Schema) {
	if (!schema) {
		return data;
	}
	const validatorResult = Joi.validate(data, schema, {
		stripUnknown: true,
	});
	if (validatorResult.error !== null || validatorResult.value === undefined) {
		console.log(data);
		console.error(validatorResult.error);
		throw validatorResult.error;
	}
	return validatorResult.value;
}

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

function getPromise(method: MethodType, url: string, data?: {}, config?: {}) {
	if (method === "GET") {
		return axios.get(url, config);
	}
	if (method === "POST") {
		return axios.post(url, data, config);
	}
	if (method === "DELETE") {
		return axios.delete(url, config);
	}
	return axios.put(url, data, config);
}

function toURLElement(str: string | string[]): string {
	if (Array.isArray(str)) {
		return JSON.stringify(
			str.map(x => {
				if (typeof x === "number") return x;
				return encodeURIComponent(x);
			})
		);
	}
	return encodeURIComponent(str);
}

interface IRequestsConfig {
	urlPrefix: string;
	initialConfig: AxiosRequestConfig;
	accessTokenKey: string;
	updateAccessToken: () => Promise<void | any>;
	logoutUser: () => void;
	requireLoginForActionPromise: () => Promise<void | any>;
	onResponse?: (response: AxiosResponse) => void | any;
	numOfSeccondsToRenewTokenBeforeExpiration: number;
}

interface AdditionalRequestProperties {
	avoidAuthentification: boolean;
}

export function createRequests(requestConfig: IRequestsConfig) {
	return class Requests {
		public static defaultConfig = mergeRecursive(
			{
				headers: {},
			},
			requestConfig.initialConfig
		);

		// tslint:disable-next-line: cognitive-complexity
		public static async send<Obj extends {}, Obj2 extends {}>(
			method: MethodType,
			baseUrl: string,
			data?: FormData | Obj | undefined,
			customConfig?: null | Obj2,
			validators?: IValidators,
			props?: AdditionalRequestProperties
		): Promise<any> {
			let bodyOrQuery = Array.isArray(data)
				? [...data]
				: { ...(data || {}) };
			if (data instanceof FormData) {
				data.forEach((val, key) => {
					bodyOrQuery[key] = val;
				});
			}
			if (validators && validators.requestSchema) {
				bodyOrQuery = validate(bodyOrQuery, validators.requestSchema);
			}

			// example: api/unis/:uni_id/ => api/unis/7/
			baseUrl = baseUrl.replace(/:([^/\s]+)/g, (str, match) => {
				if (bodyOrQuery[match] !== undefined) {
					const val = bodyOrQuery[match];
					delete bodyOrQuery[match];
					return val;
				}
				return str;
			});
			baseUrl = (requestConfig.urlPrefix || "") + baseUrl;
			let url = baseUrl;
			if (method === "GET" || method === "DELETE") {
				let queryString = "";
				if (typeof bodyOrQuery === "object" && bodyOrQuery !== null) {
					queryString =
						"?" +
						Object.keys(bodyOrQuery)
							.filter(key => bodyOrQuery[key] !== undefined)
							.map(
								key =>
									key + "=" + toURLElement(bodyOrQuery[key])
							)
							.join("&");
					if (queryString.length === 1) queryString = "";
				}
				url = baseUrl + queryString;
			}
			if (data instanceof FormData) bodyOrQuery = data;

			const { defaultConfig } = Requests;
			const config = mergeRecursive(defaultConfig, customConfig || {});

			const mainPromise = getPromise(method, url, bodyOrQuery, config)
				.then(res => {
					if (requestConfig.onResponse) requestConfig.onResponse(res);
					return res.data;
				})
				.then(d => {
					const validatedData = validate(
						d,
						validators && validators.responseSchema
					);
					return validatedData;
				});
			const promise = mainPromise.catch(err =>
				Requests.error(err, () =>
					getPromise(method, url, bodyOrQuery, config)
						.then(res => {
							if (requestConfig.onResponse)
								requestConfig.onResponse(res);
							return res.data;
						})
						.then(d =>
							validate(d, validators && validators.responseSchema)
						)
				)
			);
			if (
				!Requests.sendingResponse ||
				(props && props.avoidAuthentification)
			) {
				return promise;
			}
			return Requests.sendingResponse.then(() => {
				return promise;
			});
		}

		public static sendNewAccessTokenRequest(callback: () => Promise<any>) {
			try {
				if (Requests.sendingResponse) {
					return Requests.sendingResponse
						.then(() => {
							delete Requests.sendingResponse;
							return callback();
						})
						.catch(e => {
							delete Requests.sendingResponse;
							throw e;
						});
				}
				Requests.sendingResponse = requestConfig
					.updateAccessToken()
					.then(() => {
						delete Requests.sendingResponse;
						return callback();
					})
					.catch(e => {
						delete Requests.sendingResponse;
						throw e;
					});
				return Requests.sendingResponse;
			} catch (e) {
				throw e;
			}
		}

		public static getAccessToken(): string | undefined {
			if (typeof Requests.defaultConfig.headers !== "undefined") {
				return Requests.defaultConfig.headers[
					requestConfig.accessTokenKey
				];
			}
			return undefined;
		}
		public static renewConfigByCredentials(credentials: ICredentials) {
			if (typeof credentials.accessToken !== "undefined") {
				Requests.defaultConfig.headers[requestConfig.accessTokenKey] =
					credentials.accessToken;
			}
		}
		public static renewAccessToken(accessToken: string | undefined) {
			Requests.defaultConfig.headers[
				requestConfig.accessTokenKey
			] = accessToken;
		}
		public static async error(
			err: any,
			callback: () => Promise<any>
		): Promise<any> {
			let data = err.response ? err.response.data : undefined;
			if (data instanceof Blob) {
				data = await readFile(data);
			}
			if (err.response && err.response.status === 401 && data) {
				if (data === "access token expired") {
					return Requests.sendNewAccessTokenRequest(callback);
				}
				if (
					data === "invalid refresh token" ||
					data === "authentication failed"
				) {
					requestConfig.logoutUser();
					Requests.sendingResponse = requestConfig
						.requireLoginForActionPromise()
						.then(() => {
							delete Requests.sendingResponse;
							return callback();
						})
						.catch(e => {
							delete Requests.sendingResponse;
							throw e;
						});
					return Requests.sendingResponse;
				}
			}
			throw err;
		}
		private static sendingResponse?: Promise<any>;
	};
}

export type IRequest = ReturnType<typeof createRequests>;
