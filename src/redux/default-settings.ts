import { uniteReducers, IStorageSettings } from "./common/unite-reducers";
import { inject } from "../modules";
import { IModel } from "./common/model";
import { IAnyObj } from "../utils/generics";
import { ObjectSchema } from "typesafe-joi";
import { getStorageSchema, loadFromStorage, IStorage } from "./common/storage";

export const getDefaultStorageSettings = (
	itemName: string
): IStorageSettings => ({
	storage: localStorage,
	itemName,
	updateStorageAfterChange: true,
	spreadActionsToOtherTabs: true,
});

export const defaultReducer = <
	IState extends Record<string | number, IAnyObj | undefined>,
	IActions extends { type: string }
>(
	modelName: string,
	storageSettings: IStorageSettings
) => {
	return uniteReducers<IState, IActions>({
		storageSettings,
		reducers: [
			(state = {} as IState, action) => {
				const Model = inject(modelName as any) as IModel;
				if (typeof Model !== "function") return state;
				return Model.reducer(state as any, action) as IState;
			},
		],
	});
};

export const defaultInitialization = (
	pattern: "number" | "ObjectId" | RegExp,
	itemName: string,
	schema: ObjectSchema<any>,
	Model: IModel,
	storage: IStorage = localStorage
) => {
	const storageSchema = getStorageSchema(pattern, schema);
	loadFromStorage(Model, itemName, storageSchema, storage);
};
