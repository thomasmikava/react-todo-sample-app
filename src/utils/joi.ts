import * as origianljoi from "typesafe-joi";
import { NotUndefined } from "./generics";
import { StringSchema, ObjectSchema } from "typesafe-joi";

declare module "typesafe-joi" {
	function objectId(): StringSchema;
}

const Joi: typeof origianljoi = origianljoi.extend({
	base: origianljoi.string(),
	name: "objectId",
	language: {
		pre:
			"needs to be a string of 12 bytes or a string of 24 hex characters",
	},
	pre(value, state, options) {
		return value;
	},
});

export type SchemaToType<T extends origianljoi.Schema> = NotUndefined<
	origianljoi.Literal<T>
>;

export default Joi;

export function getJoiObjectKeys<T extends ObjectSchema<any>>(
	schema: T
): (keyof SchemaToType<T>)[] {
	return Object.keys(schema.describe().children) as any[];
}
