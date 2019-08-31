import * as Joi from "typesafe-joi";
import CustomJoi, { SchemaToType } from "./joi";

export default function validateSchema<T, K extends Joi.Schema>(
	obj: T,
	schema: K,
	options?: Joi.ValidationOptions | undefined
): SchemaToType<K> {
	if (options === undefined && process.env.NODE_ENV === "test") {
		options = {
			stripUnknown: true,
		};
	}
	const validatorResult = CustomJoi.validate(obj, schema, options);
	if (validatorResult.error !== null || validatorResult.value === undefined) {
		throw validatorResult.error;
	}
	const { value } = validatorResult;
	if (value === undefined) {
		throw new Error(JSON.stringify(validatorResult.error));
	}
	return validatorResult.value! as any;
}
