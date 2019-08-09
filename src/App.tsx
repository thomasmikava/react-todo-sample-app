import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { IRootState } from './redux';
import { IStateGroups, IGroup } from './redux/reducers/groups';
import { addGroupAction } from './redux/actions/groups';
import GroupComponent from "./groups";

type IStateProps = ReturnType<typeof mapStateToProps>;
type IDispatchProps = typeof mapDispatchToProps;

class App extends React.Component<IStateProps & IDispatchProps, {}> {

	// onTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>, taskId: number) => {
	// 	this.setState({
	// 		tasks: this.state.tasks.map(task => (
	// 			task.id === taskId ? {...task, name: e.target.value} : task)
	// 		)
	// 	});
	// }

	// addNewTask = (groupId: number) => {
	// 	const newId = Math.max(...this.state.tasks.map(g => g.id), 0) + 1;
	// 	this.setState({
	// 		groups: this.state.groups.map(group => (
	// 			group.id !== groupId ? group : {
	// 				...group, taskIds: [...group.taskIds, newId]
	// 			})
	// 		),
	// 		tasks: [...this.state.tasks, { name: "", id: newId, isDone: false }]
	// 	});
	// }

	render() {
		console.log(this.props.groups);
		const groupElements: JSX.Element[] = [];
		for (const groupId in this.props.groups) {
			const group = this.props.groups[groupId]!;
			groupElements.push(
				<GroupComponent
					key={group.id}
					group={group}
				/>
			);
		}
		// return (<div>aa</div>);
		return (
			<div>
				{groupElements}
				<Button
					onClick={() => this.props.addGroup("")}
				>
					ჯგუფის დამატება
				</Button>
			</div>
		);
	}
}

const mapStateToProps = (state: IRootState) => ({
	groups: state.groups,
});

const mapDispatchToProps = {
	addGroup: addGroupAction
};

const connectedApp = connect(
	mapStateToProps, mapDispatchToProps
)(App);
export default connectedApp;

// interface ITaskProps {
// 	taskId: number;
// 	onTaskNameChange: (e: React.ChangeEvent<HTMLInputElement>, taskId: number) => void;
// }

// const Task: React.FC<ITaskProps> = React.memo((props) => {
// 	const tasks = useContext(TasksContext);
// 	const task = tasks.find(t => t.id === props.taskId);
// 	if (!task) return null;
// 	return (
// 		<div>
// 			<input
// 				placeholder="სახელი"
// 				value={task.name}
// 				onChange={(e) => props.onTaskNameChange(e, props.taskId)}
// 			/>
// 		</div>
// 	);
// });

class Button extends React.Component<{ onClick: () => void; }> {

	componentDidMount() {
		console.log("Button Mounted");
	}

	render() {
		console.log("Button rendered");
		return (
			<button
				onClick={this.props.onClick}
			>
				ჯგუფის დამატება
			</button>
		)
	}
}