import { ADD_TASK, DELETE_TASK } from "../action-types";

export function addTaskAction(name: string) {
    return {
        type: ADD_TASK,
        name,
    } as const;
}
type addTaskAction = ReturnType<typeof addTaskAction>;

export function deleteTaskAction(id: number) {
    return {
        type: DELETE_TASK,
        id,
    } as const;
}

type deleteTaskAction = ReturnType<typeof deleteTaskAction>;

export type TasksActionTypes = addTaskAction | deleteTaskAction;
