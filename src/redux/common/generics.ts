export type ToDispatchType<T extends {}> = {
	[key in keyof T]: T[key] extends (
		...args: infer Args
	) => (...args: any[]) => infer R
		? (...args: Args) => R
		: T[key];
};

export type ThunkFunctionToType<T extends Function> = T extends (
	...args: infer Args
) => (...args: any[]) => infer R
	? (...args: Args) => R
	: T;

export interface IReduxStateInstance<T, O extends {} = {}> {
	[instanceId: string]:
		| ({
				info: T;
				loadTime?: Date;
		  } & O)
		| undefined;
}
