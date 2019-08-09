import { ADD_GROUP, DELETE_GROUP, CHANGE_GROUP_NAME } from "../action-types";

export function addGroupAction(name: string) {
    return {
        type: ADD_GROUP,
        name,
    } as const;
}
type addGroupAction = ReturnType<typeof addGroupAction>;

export function deleteGroupAction(id: number) {
    return {
        type: DELETE_GROUP,
        id,
    } as const;
}

type deleteGroupAction = ReturnType<typeof deleteGroupAction>;


export function changeGroupNameAction(id: number, name: string) {
    return {
        type: CHANGE_GROUP_NAME,
        id,
        name,
    } as const;
}

type changeGroupNameAction = ReturnType<typeof changeGroupNameAction>;

export type GroupsActionTypes = addGroupAction
    | deleteGroupAction
    | changeGroupNameAction;
