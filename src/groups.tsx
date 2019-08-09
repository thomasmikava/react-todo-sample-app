import React from 'react';
import { connect } from 'react-redux';
import { IRootState } from './redux';
import { IGroup } from './redux/reducers/groups';
import { changeGroupNameAction } from './redux/actions/groups';

type IDispatchProps = typeof mapDispatchToProps;

const mapDispatchToProps = {
	changeName: changeGroupNameAction
};


interface IOwnProps {
	group: IGroup;
}

type IGroupComponentProps = IOwnProps & IDispatchProps;

class GroupComponent extends React.PureComponent<IGroupComponentProps> {

	onGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.props.changeName(this.props.group.id, e.target.value);
	}

	addNewTask = () => {
		// this.props.addNewTask(this.props.group.id);
	}

	render() {
        console.log(this.props);
		const { group } = this.props;
		return (
			<div>
				<input
					value={group.name}
					placeholder="ჯგუფის სახელი"
					onChange={this.onGroupNameChange}
				/>
				{/* {group.taskIds.map((taskId, j) => {
					return (
						<Task
							key={taskId}
							onTaskNameChange={this.props.onTaskNameChange}
							taskId={taskId}
						/>
					);
				})} */}
				<button onClick={this.addNewTask}>დავალების ჩამატება</button>
			</div>
		)
	}
}


const connectedApp = connect(
	null, mapDispatchToProps
)(GroupComponent);
export default connectedApp;