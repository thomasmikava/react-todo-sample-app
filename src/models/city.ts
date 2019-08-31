import { CitySchema, City } from "../api/cities/helper-schemas";
import {
	ICRUDActionTypes,
	ICRUDActionObjs,
} from "../redux/common/crud-actions";
import { IReduxStateInstance } from "../redux/common/generics";
import { IModel, modelWrapper } from "../redux/common/model";
import { getStorageSchema, loadFromStorage } from "../redux/common/storage";
import { ObjectId, OptionalKeys } from "../utils/generics";
import { getJoiObjectKeys } from "../utils/joi";
import { Action, Store } from "redux";
import { IStorageSettings } from "../redux/common/unite-reducers";
import {
	getDefaultStorageSettings,
	defaultReducer,
} from "../redux/default-settings";

type DOC = City;
type IdKey = "id";
type IdType = number;
const keyOfId: IdKey = "id";

// ==============ACTIONS===============

export const cityCRUDActionTypes = {
	updateOne: "UPDATE_FILE",
	updateMany: "UPDATE_MANY_FILES",
	loadOne: "LOAD_FILE",
	loadMany: "LOAD_FILES",
	deleteOne: "DELETE_FILE",
	deleteMany: "DELETE_MANY_FILES",
	clearAll: "CLEAR_FILES",
} as const;

export type CityActions = ICRUDActionObjs<
	IdKey,
	IdType,
	DOC,
	typeof cityCRUDActionTypes
>;

// ==============REDUCER==============

export type IStateCities = IReduxStateInstance<DOC>;

export const citiesStorageSettings: IStorageSettings = getDefaultStorageSettings(
	"cities"
);

export const citiesReducer = defaultReducer<IStateCities, CityActions>(
	"CityModel",
	citiesStorageSettings
);

// ==============MODEL=================

function cityModelWrapper<
	State extends { cities: IReduxStateInstance<DOC> },
	CRUDActions extends ICRUDActionTypes
>(store: Store<State, Action<any>>, CRUDActionTypes: CRUDActions) {
	const dockeys = getJoiObjectKeys(CitySchema);
	const Model = modelWrapper<IdKey, IdType, DOC, CRUDActions, State>({
		keyOfId,
		getInstances: () => store.getState()["cities"],
		store,
		syncronousCRUDActionTypes: CRUDActionTypes,
		dockeys,
		storageSettings: citiesStorageSettings,
	});

	class City extends Model<City> implements DOC {
        id: DOC["id"];
        name: DOC["name"];
        createdAt: DOC["createdAt"];
        updatedAt: DOC["updatedAt"];

		constructor(doc: OptionalKeys<DOC, IdKey>) {
			super(doc);
			for (const key of dockeys) {
				this[key as any] = doc[key as any];
			}
		}

		getFullName() {
			return this.name + "!";
		}

		static initialize() {
			const storageSchema = getStorageSchema("ObjectId", CitySchema);
			loadFromStorage(City as any as IModel, "cities", storageSchema);
		}
	}
	return City;
}

export type ICityModel = ReturnType<typeof cityModelWrapper>;
export type ICityInstance = InstanceType<ICityModel>;

export { cityModelWrapper };
