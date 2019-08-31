import createCRUDActions, {
	IDocument,
	ICRUDActionTypes,
	ILoadManyAction,
	ILoadOneAction,
	IDeleteOneAction,
	IUpdateOneAction,
	IUpdateManyAction,
	IDeleteManyAction,
} from "./crud-actions";
import {
	OptionalKeys,
	OptionalKeysOtherThan,
	IAnyObj,
	NotUndefined,
	GetKeysOfType,
} from "../../utils/generics";
import { Store, Action } from "redux";
import { IReduxStateInstance } from "./generics";
import createCRUDReducer from "./crud-reducer";
import {
	IStorageSettings,
	defaultSpecialActionKeyOfOtherTabsActions,
} from "./unite-reducers";

interface Instance<DOC> {
	info: DOC;
	loadTime?: Date;
}

type Instances<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>
> = Record<IdType, Instance<DOC> | undefined>;

interface IModelConfig<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes,
	State
> {
	keyOfId: IdKey;
	getInstances: () => Instances<IdKey, IdType, DOC> | undefined;
	store: Store<State, Action<any>>;
	syncronousCRUDActionTypes: CRUDActions;
	dockeys: (keyof DOC)[];
	indices?: readonly {
		fields: (keyof DOC)[];
		unique?: boolean;
	}[];
	storageSettings: Pick<
		IStorageSettings,
		"spreadActionsToOtherTabs" | "specialActionKeyOfOtherTabsActions"
	>;
	timestamps?: {
		createdAt?: GetKeysOfType<DOC, Date>;
		updatedAt?: GetKeysOfType<DOC, Date>;
	};
}

const initialDoc = Symbol("initial");
const isDeleted = Symbol("isDeleted");

export const modelSymbols = {
	initialDoc,
	isDeleted,
} as const;

// tslint:disable:align
function modelWrapper<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes,
	State
>(config: IModelConfig<IdKey, IdType, DOC, CRUDActions, State>) {
	const HowMany = Symbol();
	const CRUDActions = createCRUDActions<IdKey, IdType, DOC, CRUDActions>(
		config.syncronousCRUDActionTypes,
		config.keyOfId
	);

	interface QueryOptions {
		$hint?: NotUndefined<(typeof config)["indices"]>[number];
		sort?: { [key in keyof DOC]: 1 | -1 };
	}

	const crudReducer = createCRUDReducer<
		IdKey,
		IdType,
		DOC,
		IReduxStateInstance<DOC>
	>(config.syncronousCRUDActionTypes, config.keyOfId);

	class Model<T extends Model<T> & DOC> {
		protected [initialDoc]: Partial<DOC>;
		protected [isDeleted]: boolean | "requestSent" = false;

		constructor(args: OptionalKeys<DOC, IdKey>) {
			this[initialDoc] = {} as Partial<DOC>;
			for (const key of config.dockeys) {
				this[initialDoc][key] = args[key as any];
			}
		}

		saveSync() {
			if (this[config.keyOfId as any] === undefined) {
				throw new Error(
					`document must have ${config.keyOfId} in order to be saved`
				);
			}
			const instances = config.getInstances();
			if (instances) {
				const instance = instances[this[config.keyOfId as any]];
				if (instance) {
					(this.constructor as any).updateByDocSync(
						(this as any) as DOC
					);
					return;
				}
			}
			(this.constructor as any).loadOneSync((this as any) as DOC);
		}

		toJSON(): DOC {
			const obj = {} as DOC;
			for (const key of config.dockeys) {
				obj[key] = this[key as any];
			}
			return obj;
		}

		protected static addTimestampsToDoc(doc: DOC): DOC {
			if (
				!config.timestamps ||
				(!config.timestamps.createdAt && !config.timestamps.updatedAt)
			) {
				return doc;
			}
			if (
				!config.timestamps.updatedAt &&
				doc[config.timestamps.createdAt!]
			) {
				return doc;
			}
			const newDoc = { ...doc };
			if (
				config.timestamps.createdAt &&
				!newDoc[config.timestamps.createdAt]
			) {
				newDoc[config.timestamps.createdAt] = new Date() as any;
			}
			if (config.timestamps.updatedAt) {
				newDoc[config.timestamps.updatedAt] = new Date() as any;
			}
			return newDoc;
		}

		static findByIdSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance?: false
		): DOC | undefined;
		static findByIdSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance: true
		): T | undefined;
		static findByIdSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance: boolean = false
		): T | DOC | undefined {
			const instances = config.getInstances();
			if (!instances) return undefined;
			const instance = instances[id];
			if (!instance) {
				return undefined;
			}
			if (!getClassInstance) return instance.info;
			return new this(instance.info);
		}

		protected static dispatch = config.store.dispatch;
		protected static getState = config.store.getState;
		protected static syncronousCrudActions = CRUDActions;
		protected static dockeys = config.dockeys;
		protected static indicesTable = !config.indices
			? []
			: config.indices.map(e => ({} as IAnyObj));

		static findManyByIdsSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstance?: false
		): DOC[];
		static findManyByIdsSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstance: true
		): T[];
		static findManyByIdsSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstance: boolean = false
		): T[] | DOC[] {
			const instances = config.getInstances();
			if (!instances) return [];
			const objs: (T | DOC)[] = [];
			const notFoundIds: IdType[] = [];
			for (let i = 0; i < ids.length; ++i) {
				const id = ids[i];
				if (instances[id]) {
					objs.push(
						!getClassInstance
							? instances[id]!.info
							: new this(instances[id]!.info)
					);
				} else {
					notFoundIds.push(id);
				}
			}
			return objs as T[] | DOC[];
		}

		static findOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options?: QueryOptions,
			getClassInstance?: false
		): DOC | undefined;
		static findOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions | undefined,
			getClassInstance: true
		): T | undefined;
		static findOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options?: QueryOptions,
			getClassInstance: boolean = false
		) {
			const searchResult = (this as any).findManySync(
				query,
				options,
				getClassInstance
			);
			if (searchResult.length === 0) {
				return undefined;
			}
			return searchResult[0];
		}

		static deleteOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>
		) {
			const doc = (this as any).findOneSync(query) as DOC | undefined;
			if (!doc) return;
			(this as any).deleteByIdSync(doc[config.keyOfId]);
		}

		static findManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options?: QueryOptions,
			getClassInstance?: false
		): DOC[];
		static findManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions | undefined,
			getClassInstance: true
		): T[];
		static findManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options?: QueryOptions,
			getClassInstance: boolean = false
		): T[] | DOC[] {
			const instances = config.getInstances();
			if (!instances) {
				return [];
			}
			let idsOfInstances: (string | number)[] = Object.keys(instances);
			if (!instances || idsOfInstances.length === 0) {
				return [];
			}
			if (query[config.keyOfId] !== undefined) {
				idsOfInstances = [query[config.keyOfId]!];
			} else if (config.indices) {
				let bestIndex = options && options.$hint;
				if (!bestIndex) {
					const best = {
						searchCount: Infinity,
						index: undefined as
							| undefined
							| NotUndefined<(typeof config)["indices"]>[number],
						indexIndex: -1,
					};
					let i = -1;
					for (const index of config.indices) {
						++i;
						let indexHolder = ((this as any) as typeof Model)
							.indicesTable[i];
						let howManyToSearch = Infinity;
						let j = 0;
						for (; j < index.fields.length; ++j) {
							const indexKey = index.fields[j];
							if (indexHolder[HowMany as any] !== undefined) {
								howManyToSearch = indexHolder[HowMany as any];
							} else if (
								index.unique &&
								j === index.fields.length - 1
							) {
								howManyToSearch = 1;
							}
							if (query[indexKey] === undefined) {
								break;
							}
							if (
								indexHolder[query[indexKey] as any] ===
								undefined
							) {
								return [];
							}
							indexHolder = indexHolder[query[indexKey] as any];
						}
						if (howManyToSearch < best.searchCount) {
							best.searchCount = howManyToSearch;
							best.index = index;
							best.indexIndex = i;
						}
					}
					if (best.searchCount < Infinity && best.index) {
						bestIndex = best.index;
					}
				}
				if (bestIndex) {
					const { fields } = bestIndex;
					const indexIndex = config.indices!.indexOf(bestIndex);
					if (indexIndex > -1) {
						// console.log(best.index);
						let indexHolder = ((this as any) as typeof Model)
							.indicesTable[indexIndex];
						// console.log(indexHolder);
						let j = 0;
						for (; j < fields.length; ++j) {
							const indexKey = fields[j];
							if (query[indexKey] === undefined) {
								break;
							}
							indexHolder = indexHolder[query[indexKey] as any];
							// console.log(indexHolder);
						}
						if (j === fields.length) {
							idsOfInstances = bestIndex.unique
								? ([indexHolder] as any[])
								: Object.keys(indexHolder);
						} else {
							idsOfInstances = [];
							const hei: IAnyObj = [indexHolder];
							let lastIndex = 0;
							for (; j < fields.length; ++j) {
								let n = hei.length;
								for (; lastIndex < n; ++lastIndex) {
									const obj = hei[lastIndex];
									for (let key in obj) {
										hei.push(obj[key]);
									}
								}
							}
							for (; lastIndex < hei.length; ++lastIndex) {
								if (bestIndex.unique) {
									idsOfInstances.push(hei[lastIndex]);
								} else {
									for (const k in hei[lastIndex]) {
										idsOfInstances.push(k);
									}
								}
							}
						}
					}
				}
			}
			if (idsOfInstances.length === 0) return [];
			const objs: (T | DOC)[] = [];
			const fixedIds: { [id: string]: true | undefined } = {};
			for (let id of idsOfInstances) {
				if (fixedIds[id]) {
					console.trace(`duplicate detected for id ${id}`);
					continue;
				}
				const obj = instances[id] as Instance<DOC> | undefined;
				if (!obj) continue;
				let areEqual = true;
				for (let q in query) {
					if (obj.info[q] !== query[q]) {
						areEqual = false;
						break;
					}
				}
				if (!areEqual) continue;
				fixedIds[id] = true;
				const instance = !getClassInstance
					? obj.info
					: new this(obj.info);
				objs.push(instance);
			}
			return objs as T[] | DOC[];
		}

		protected static updateManyByDocsSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			docs: OptionalKeysOtherThan<DOC, IdKey>[],
			extras?: IAnyObj[],
			dispatchAction = true,
			instances?: Instances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			if (!instances) return;
			const documents: OptionalKeysOtherThan<DOC, IdKey>[] = [];
			for (const doc of docs) {
				let oldInstance: DOC | undefined;
				const document =
					config.timestamps && config.timestamps.updatedAt
						? { ...doc, [config.timestamps.updatedAt]: new Date() }
						: doc;
				if (instances && instances[doc[config.keyOfId]]) {
					oldInstance = instances[document[config.keyOfId]]!.info;
					(this as any).updateIndices(oldInstance, false);
				}
				if (oldInstance) {
					(this as any).updateIndices(
						{ ...oldInstance, ...document },
						true
					);
				}
				documents.push(document);
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.updateMany(
						documents,
						extras
					)
				);
			}
		}

		static updateManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			newDoc: Partial<DOC>
		) {
			const documents = (this as any).findManySync(query);

			const docs: OptionalKeysOtherThan<DOC, IdKey>[] = [];
			for (const doc of documents) {
				docs.push({
					[config.keyOfId]: doc[config.keyOfId],
					...newDoc,
				} as OptionalKeysOtherThan<DOC, IdKey>);
			}
			(this as any).updateManyByDocsSync(docs);
		}

		static updateOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			newDoc: Partial<DOC>
		) {
			const document = (this as any).findOneSync(
				query,
				undefined,
				true
			) as T | undefined;
			if (!document) {
				return;
			}
			for (const key in newDoc) {
				document[key as any] = newDoc[key];
			}
			document.saveSync();
		}

		static deleteManyByIdsSync<T extends Model<T> & DOC>(
			ids: IdType[],
			dispatchAction = true
		) {
			const documents = (this as any).findManyByIdsSync(ids) as DOC[];
			for (const doc of documents) {
				(this as any).updateIndices(doc, false);
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.deleteMany(
						documents.map(e => e[config.keyOfId])
					)
				);
			}
		}

		static deleteManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options?: QueryOptions
		) {
			const docs = (this as any).findManySync(query, options) as DOC[];
			if (!docs.length) return;
			(this as any).deleteManyByIdsSync(docs.map(e => e[config.keyOfId]));
		}

		static getStoreRawInstancesObj<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T
		): Instances<IdKey, IdType, DOC> {
			const instances = config.getInstances();
			return instances!;
		}

		static getRawInstancesObj<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T
		): Record<IdType, DOC | undefined> {
			const instances = config.getInstances();
			const rawInstances: Record<IdType, DOC | undefined> = {} as any;
			for (const instanceId in instances) {
				rawInstances[instanceId as any] = instances[instanceId]!.info;
			}
			return rawInstances;
		}

		static getAllSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			getClassInstance?: false
		): DOC[];
		static getAllSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			getClassInstance: true
		): T[];
		static getAllSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			getClassInstance: boolean = false
		): T[] | DOC[] {
			const instances = config.getInstances();
			if (!instances) return [];
			const objs: (T | DOC)[] = [];
			for (const instanceId in instances) {
				const instance = !getClassInstance
					? instances[instanceId]!.info
					: new this(instances[instanceId]!.info);
				objs.push(instance);
			}
			return objs as T[] | DOC[];
		}

		public static subscribeChangeById<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance: false,
			cb: (currentDoc: DOC | undefined) => void
		): () => void;
		public static subscribeChangeById<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance: true,
			cb: (currentDoc: T | undefined) => void
		): () => void;
		public static subscribeChangeById<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			getClassInstance: boolean,
			cb: (currentDoc: T | DOC | undefined) => void
		): () => void {
			let lastInstances = config.getInstances();
			let lastInstance =
				lastInstances && lastInstances[id] && lastInstances[id]!.info;
			return config.store.subscribe(() => {
				let currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentInstance =
					currentInstances &&
					currentInstances[id] &&
					currentInstances[id]!.info;
				if (lastInstance !== currentInstance) {
					lastInstance = currentInstance;
					lastInstances = currentInstances;
					cb(
						currentInstance
							? !getClassInstance
								? currentInstance
								: new this(currentInstance)
							: undefined
					);
				}
			});
		}

		public static subscribeOneDocChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions,
			getClassInstance: false,
			cb: (currentDoc: DOC | undefined) => void
		): () => void;
		public static subscribeOneDocChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions,
			getClassInstance: true,
			cb: (currentDoc: T | undefined) => void
		): () => void;
		public static subscribeOneDocChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions = {},
			getClassInstance: boolean,
			cb: (currentDoc: T | DOC | undefined) => void
		): () => void {
			let lastInstances = config.getInstances();
			let lastInstance = (this as any).findOneSync(
				query,
				options,
				false
			) as DOC | undefined;
			return config.store.subscribe(() => {
				let currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				if (!currentInstances) {
					if (lastInstance !== undefined) {
						cb(undefined);
					}
					return;
				}
				const currentInstance = (this as any).findOneSync(
					query,
					options,
					false
				) as DOC | undefined;
				if (lastInstance !== currentInstance) {
					lastInstance = currentInstance;
					lastInstances = currentInstances;
					cb(
						currentInstance
							? !getClassInstance
								? currentInstance
								: new this(currentInstance)
							: undefined
					);
				}
			});
		}

		public static subscribeManyDocsChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions,
			getClassInstances: false,
			cb: (currentDoc: DOC[]) => void
		): () => void;
		public static subscribeManyDocsChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions,
			getClassInstances: true,
			cb: (currentDoc: T[]) => void
		): () => void;
		public static subscribeManyDocsChangeByQuery<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			query: Partial<DOC>,
			options: QueryOptions = {},
			getClassInstances: boolean,
			cb: (currentDoc: T[] | DOC[]) => void
		): () => void {
			let lastInstances = config.getInstances();
			let lastFoundInstances = (this as any).findManySync(
				query,
				options,
				false
			) as DOC[];
			return config.store.subscribe(() => {
				let currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentFoundInstances = (this as any).findManySync(
					query,
					options,
					false
				) as DOC[];
				let areSame =
					lastFoundInstances.length === currentFoundInstances.length;
				if (areSame) {
					for (let i = 0; i < lastFoundInstances.length; i++) {
						if (
							lastFoundInstances[i] !== currentFoundInstances[i]
						) {
							areSame = false;
							break;
						}
					}
				}
				if (!areSame) {
					lastFoundInstances = currentFoundInstances;
					lastInstances = currentInstances;
					cb(
						getClassInstances
							? currentFoundInstances
							: currentFoundInstances.map(e => new this(e))
					);
				}
			});
		}

		public static subscribeManyDocsChangeByIds<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstances: false,
			cb: (currentDoc: DOC[]) => void
		): () => void;
		public static subscribeManyDocsChangeByIds<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstances: true,
			cb: (currentDoc: T[]) => void
		): () => void;
		public static subscribeManyDocsChangeByIds<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			ids: IdType[],
			getClassInstances: boolean,
			cb: (currentDoc: T[] | DOC[]) => void
		): () => void {
			let lastInstances = config.getInstances();
			let lastFoundInstances = (this as any).findManyByIdsSync(
				ids,
				false
			) as DOC[];
			return config.store.subscribe(() => {
				let currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				const currentFoundInstances = (this as any).findManyByIdsSync(
					ids,
					false
				) as DOC[];
				let areSame =
					lastFoundInstances.length === currentFoundInstances.length;
				if (areSame) {
					for (let i = 0; i < lastFoundInstances.length; i++) {
						if (
							lastFoundInstances[i] !== currentFoundInstances[i]
						) {
							areSame = false;
							break;
						}
					}
				}
				if (!areSame) {
					lastFoundInstances = currentFoundInstances;
					lastInstances = currentInstances;
					cb(
						getClassInstances
							? currentFoundInstances
							: currentFoundInstances.map(e => new this(e))
					);
				}
			});
		}

		public static subscribeChange(cb: () => void): () => void {
			let lastInstances = config.getInstances();
			return config.store.subscribe(() => {
				let currentInstances = config.getInstances();
				if (currentInstances === lastInstances) return;
				cb();
			});
		}

		protected static updateByDocSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			doc: OptionalKeysOtherThan<DOC, IdKey>,
			extra?: IAnyObj,
			dispatchAction = true,
			instances?: Instances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			const document =
				config.timestamps && config.timestamps.updatedAt
					? { ...doc, [config.timestamps.updatedAt]: new Date() }
					: doc;
			let oldInstance: DOC | undefined;
			if (instances && instances[document[config.keyOfId]]) {
				oldInstance = instances[document[config.keyOfId]]!.info;
				(this as any).updateIndices(oldInstance, false);
			}
			if (oldInstance) {
				(this as any).updateIndices(
					{ ...oldInstance, ...document },
					true
				);
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.updateOne(
						document,
						extra
					)
				);
			}
		}

		static clearAllSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			dispatchAction = true
		) {
			(this as any).clearIndices();
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.clearAll()
				);
			}
		}

		static deleteByIdSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			id: IdType,
			dispatchAction = true,
			instances?: Instances<IdKey, IdType, DOC>
		) {
			if (!instances) instances = config.getInstances();
			if (instances && instances[id]) {
				(this as any).updateIndices(instances[id]!.info, false);
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.deleteOne(
						id
					)
				);
			}
		}

		static loadOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			doc: DOC,
			loadTime?: Date,
			extra?: IAnyObj,
			getClassInstance?: false,
			dispatchAction?: boolean,
			instances?: Instances<IdKey, IdType, DOC>
		): DOC;
		static loadOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			doc: DOC,
			loadTime: Date | undefined,
			extra: IAnyObj | undefined,
			getClassInstance: true,
			dispatchAction?: boolean,
			instances?: Instances<IdKey, IdType, DOC>
		): T;
		static loadOneSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			doc: DOC,
			loadTime?: Date,
			extra?: IAnyObj,
			getClassInstance: boolean = false,
			dispatchAction = true,
			instances?: Instances<IdKey, IdType, DOC>
		): T | DOC {
			if (!instances) instances = config.getInstances();
			let exists = false;
			if (instances && instances[doc[config.keyOfId]]) {
				exists = true;
			}
			const document = (this as any).addTimestampsToDoc(doc) as DOC;
			if (exists) {
				(this as any).updateByDocSync(
					document,
					extra,
					false,
					instances
				);
			} else {
				(this as any).updateIndices(document, true);
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.loadOne(
						document,
						loadTime,
						extra
					)
				);
			}
			if (!getClassInstance) return document;
			return new this(document);
		}

		static loadManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			docs: DOC[],
			loadTime?: Date,
			extras?: IAnyObj[],
			getClassInstance?: false,
			dispatchAction?: boolean,
			instances?: Instances<IdKey, IdType, DOC>
		): DOC[];
		static loadManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			docs: DOC[],
			loadTime: Date | undefined,
			extras: IAnyObj[] | undefined,
			getClassInstance: true,
			dispatchAction?: boolean,
			instances?: Instances<IdKey, IdType, DOC>
		): T[];
		static loadManySync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			docs: DOC[],
			loadTime?: Date,
			extras?: IAnyObj[],
			getClassInstance: boolean = false,
			dispatchAction = true,
			instances?: Instances<IdKey, IdType, DOC>
		): T[] | DOC[] {
			const objs: (T | DOC)[] = [];
			for (let i = 0; i < docs.length; ++i) {
				const document = (this as any).loadOneSync(
					docs[i],
					loadTime,
					extras ? extras[i] : undefined,
					false,
					false,
					instances
				) as DOC;
				objs.push(!getClassInstance ? document : new this(document));
			}
			if (dispatchAction) {
				((this as any) as typeof Model).dispatch(
					((this as any) as typeof Model).syncronousCrudActions.loadMany(
						docs,
						loadTime,
						extras
					)
				);
			}
			return objs as T[] | DOC[];
		}

		static loadManyFromStorageSync<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			obj: IReduxStateInstance<DOC>
		): void {
			// console.log(obj);
			if (!obj) return;
			type LoadMany = ILoadManyAction<
				IdKey,
				IdType,
				DOC,
				CRUDActions["loadMany"]
			>;
			const docs: DOC[] = [];
			const extras: IAnyObj[] = [];
			for (const key in obj) {
				const { info, ...rest } = obj[key]!;
				docs.push(info);
				extras.push(rest);
				(this as any).updateIndices(info, true);
			}
			((this as any) as typeof Model).dispatch(
				((this as any) as typeof Model).syncronousCrudActions.loadMany(
					docs,
					undefined,
					extras
				)
			);
			return;
		}

		static reducer<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			state: IReduxStateInstance<DOC> | undefined,
			action: Action<any>
		): IReduxStateInstance<DOC> {
			const newState = crudReducer(state, action as any);
			if (!config.storageSettings.spreadActionsToOtherTabs) {
				return newState;
			}
			const isActionOfAnotherTab =
				(action as any)[
					config.storageSettings.specialActionKeyOfOtherTabsActions ||
						defaultSpecialActionKeyOfOtherTabsActions
				] !== undefined;
			if (isActionOfAnotherTab) {
				if (action.type === config.syncronousCRUDActionTypes.loadOne) {
					const loadOneAction = action as ILoadOneAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["loadOne"]
					>;
					(this as any).loadOneSync(
						loadOneAction.info,
						loadOneAction.loadTime,
						loadOneAction.extra,
						false,
						false,
						state || {}
					);
				} else if (
					action.type === config.syncronousCRUDActionTypes.loadMany
				) {
					const loadManyAction = action as ILoadManyAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["loadMany"]
					>;
					(this as any).loadManySync(
						loadManyAction.infos,
						loadManyAction.loadTime,
						loadManyAction.extras,
						false,
						false,
						state || {}
					);
				} else if (
					action.type === config.syncronousCRUDActionTypes.deleteOne
				) {
					const deleteAction = action as IDeleteOneAction<
						IdKey,
						IdType,
						CRUDActions["deleteOne"]
					>;
					(this as any).deleteByIdSync(
						deleteAction[config.keyOfId],
						false,
						state || {}
					);
				} else if (
					action.type === config.syncronousCRUDActionTypes.deleteMany
				) {
					const deleteAction = action as IDeleteManyAction<
						IdType,
						CRUDActions["deleteMany"]
					>;
					(this as any).deleteManyByIdsSync(
						deleteAction.ids,
						false,
						state || {}
					);
				} else if (
					action.type === config.syncronousCRUDActionTypes.clearAll
				) {
					(this as any).clearAllSync(false);
				} else if (
					action.type === config.syncronousCRUDActionTypes.updateOne
				) {
					const updateAction = action as IUpdateOneAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["updateOne"]
					>;
					(this as any).updateByDocSync(
						updateAction.info,
						updateAction.extra,
						false,
						state || {}
					);
				} else if (
					action.type === config.syncronousCRUDActionTypes.updateMany
				) {
					const updateAction = action as IUpdateManyAction<
						IdKey,
						IdType,
						DOC,
						CRUDActions["updateMany"]
					>;
					(this as any).updateManyByDocsSync(
						updateAction.infos,
						updateAction.extras,
						false,
						state || {}
					);
				}
			}
			return newState;
		}

		protected static clearIndices<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T
		) {
			const me = (this as any) as typeof Model;
			for (let i = 0; i < me.indicesTable.length; ++i) {
				me.indicesTable[i] = {};
			}
		}

		protected static updateIndices<T extends Model<T> & DOC>(
			this: new (doc: OptionalKeys<DOC, IdKey>) => T,
			doc: DOC,
			isLoaded: boolean // else deleted
		) {
			if (!config.indices) return;
			let i = -1;
			for (const index of config.indices) {
				++i;
				let indexHolder = ((this as any) as typeof Model).indicesTable[
					i
				];

				let HowManyIncrement = 0;
				for (let j = 0; j < index.fields.length; ++j) {
					const indexKey = index.fields[j];
					if (doc[indexKey] === undefined) return;
					let newIndexHolder = indexHolder[doc[indexKey]];
					if (!isLoaded) {
						if (newIndexHolder === undefined) return;
					} else {
						if (
							!indexHolder[doc[indexKey]] &&
							(!index.unique || j < index.fields.length - 1)
						) {
							indexHolder[doc[indexKey]] = {};
						}
						newIndexHolder = indexHolder[doc[indexKey]];
					}
					if (j < index.fields.length - 1) {
						indexHolder = newIndexHolder;
					} else {
						if (isLoaded) {
							if (index.unique) {
								if (!indexHolder[doc[indexKey]]) {
									HowManyIncrement++;
								}
								indexHolder[doc[indexKey]] =
									doc[config.keyOfId];
							} else {
								if (
									!indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									]
								) {
									HowManyIncrement++;
								}
								indexHolder[doc[indexKey]][
									doc[config.keyOfId]
								] = true;
							}
						} else {
							if (index.unique) {
								if (indexHolder[doc[indexKey]]) {
									HowManyIncrement--;
									delete indexHolder[doc[indexKey]];
								}
							} else {
								if (
									indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									]
								) {
									HowManyIncrement--;
									delete indexHolder[doc[indexKey]][
										doc[config.keyOfId]
									];
								}
							}
						}
					}
				}

				indexHolder = ((this as any) as typeof Model).indicesTable[i];
				let j = 0;
				for (; j < index.fields.length; ++j) {
					const indexKey = index.fields[j];
					if (!index.unique || j !== index.fields.length) {
						indexHolder[HowMany as any] =
							(indexHolder[HowMany as any] || 0) +
							HowManyIncrement;
					}
					let oldCount =
						index.unique && j === index.fields.length - 1
							? indexHolder[doc[indexKey]]
								? 1
								: 0
							: indexHolder[doc[indexKey]][HowMany as any] || 0;
					if (!isLoaded && oldCount + HowManyIncrement === 0) {
						delete indexHolder[doc[indexKey]];
						break;
					}
					indexHolder = indexHolder[doc[indexKey]];
				}
				if (!index.unique && indexHolder && j === index.fields.length) {
					indexHolder[HowMany as any] =
						(indexHolder[HowMany as any] || 0) + HowManyIncrement;
				}
			}
		}
	}
	return Model;
}

class C<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes,
	State
> {
	getModel(this: any) {
		return modelWrapper<IdKey, IdType, DOC, CRUDActions, State>({} as any);
	}
}

export type IGenericModel<
	IdKey extends string,
	IdType extends string | number,
	DOC extends IDocument<IdKey, IdType>,
	CRUDActions extends ICRUDActionTypes,
	State
> = ReturnType<C<IdKey, IdType, DOC, CRUDActions, State>["getModel"]>;

export type IModel = ReturnType<typeof modelWrapper>;

export { modelWrapper };
