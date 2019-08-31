import { ObjectSchema } from "typesafe-joi";
import Joi from "../../utils/joi";
import validateSchema from "../../utils/validate-schema";
import { IModel } from "./model";
import { IReduxStateInstance } from "./generics";

export interface IStorage {
	getItem(key: string): null | string;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export function getStorageSchema(
	pattern: "number" | "ObjectId" | RegExp,
	schema: ObjectSchema<any>
) {
	const patt =
		pattern === "number"
			? /^\d+$/
			: pattern === "ObjectId"
			? /[\da-f]$/
			: pattern;
	return Joi.object().pattern(
		patt,
		Joi.object({
			info: schema.required(),
			loadTime: Joi.date(),
		})
	);
}

export function loadFromStorage<DOC extends {}>(
	Model: IModel,
	key: string,
	storageSchema: ObjectSchema<any>,
	storage: IStorage = localStorage
): boolean {
	const value = storage.getItem(key);
	if (value) {
		try {
			const items: IReduxStateInstance<DOC> = JSON.parse(value);
			const validatedValue = validateSchema(items, storageSchema, {
				stripUnknown: true,
			});
			(Model as any).loadManyFromStorageSync(validatedValue);
			storage.setItem(key, JSON.stringify(validatedValue));
			return true;
		} catch (e) {
			console.error(value, e);
			storage.removeItem(key);
			return false;
		}
	}
	return false;
}

interface IMetaInformationMethods<DOC extends {}> {
	setItem<K extends keyof DOC>(key: K, value: DOC[K]): void;
}

function getMetaInformationObj<DOC extends {}>(
	initialValue: DOC,
	onChange: (doc: DOC) => void
): IMetaInformationMethods<DOC> & Readonly<DOC> {
	return {
		...initialValue,
		setItem: function(key, value) {
			this[key as any] = value;
			onChange(this as any);
		},
	};
}

export function getMetaInformation<DOC extends {}>(
	defaultValues: DOC,
	key: string,
	schema: ObjectSchema<any>,
	storage: IStorage = localStorage
) {
	function cb(doc: DOC) {
		storage.setItem(key, JSON.stringify(doc));
	}
	const initial = storage.getItem(key);
	if (initial) {
		try {
			const val: DOC = validateSchema(initial, schema, {
				stripUnknown: true,
			});
			return getMetaInformationObj(val, cb);
		} catch (e) {
			console.log(e);
		}
	}
	return getMetaInformationObj(defaultValues, cb);
}

export const rawInstancesToArray = <DOC>(
	instances: IReduxStateInstance<DOC>
): DOC[] => {
	const arr: DOC[] = [];
	for (const key in instances) {
		arr.push(instances[key]!.info);
	}
	return arr;
};
