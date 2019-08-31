import { IAnyObj } from "./generics";

export function mergeRecursive<T1 extends IAnyObj, T2 extends IAnyObj>(
	object1: T1,
	object2: T2
): T1 & T2 {
	const obj1 = { ...object1 };
	const obj2 = { ...object2 };
	for (const p in obj2) {
		if (obj2.hasOwnProperty(p)) {
			try {
				// Property in destination object set; update its value.
				if (obj2[p].constructor === Object) {
					obj1[p] = mergeRecursive(obj1[p], obj2[p]);
				} else {
					obj1[p] = obj2[p] as any;
					if (obj1[p] === undefined) delete obj1[p];
				}
			} catch (e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p] as any;
				if (obj1[p] === undefined) delete obj1[p];
			}
		}
	}

	return obj1 as any;
}
