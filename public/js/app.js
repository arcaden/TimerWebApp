class TimerDash extends React.Component {
	constructor() {
		super();
		this.state = {
			timers: [],
		}
		this.createTimer = this.createTimer.bind(this)
		this.updateTimer = this.updateTimer.bind(this)
		this.handleCreateTimer = this.handleCreateTimer.bind(this)
		this.handleUpdateTimer = this.handleUpdateTimer.bind(this)
	}

	componentDidMount(){
		this.loadTimers()
		setInterval(this.loadTimers, 5000)
	}

	loadTimers = () => {
		client.getTimers((newTimers) => {
			this.setState({
				timers: newTimers
			})
		})
	}

	createTimer(timer){
		const t = helpers.newTimer(timer)
		this.setState({
			timers: this.state.timers.concat(t),
		})

		client.createTimer(t)
	}

	updateTimer(attr){
		this.setState({
			timers: this.state.timers.map((timer) => {
				if (timer.id === attr.id) {
					return Object.assign({}, timer, {
						title : attr.title,
						project: attr.project,
					})
				} else {
					return timer
				}
			})
		})
		client.updateTimer(attr)
	}

	handleUpdateTimer(attr){
		this.updateTimer(attr)
	}

	handleCreateTimer = (timer) => {
		return (this.createTimer(timer))
	}

	deleteTimer = (timerID) => {
		client.deleteTimer({id: timerID, })
		return (this.setState({
			timers: this.state.timers.filter((timer) => timer.id !== timerID),
		}))
	}

	handleDeleteClick = (timerID) => {
		this.deleteTimer(timerID)
	}

	handleStartClick = (timerID) => {
		this.startTimer(timerID)
	}

	handleStopClick = (timerID) => {
		this.stopTimer(timerID)
	}

	startTimer = (timerID) =>{
		const now = Date.now()

		this.setState({
			timers: this.state.timers.map((timer) => {
				if (timerID === timer.id) {
					return (Object.assign({},timer,{
						runningSince : now,
					}))
				} else {
					return timer
				}
			})
		})

		client.startTimer({
			id: timerID,
			start: now,
		})
	}

	stopTimer = (timerId) => {
		const now = Date.now()
		this.setState({
			timers: this.state.timers.map((timer) => {
				if (timer.id === timerId) {
					const lastElapsed = now - timer.runningSince;
					return Object.assign({}, timer, {
						elapsed: timer.elapsed + lastElapsed,
						runningSince: null,
					})
				} else {
					return timer
				}
			}),
		})
		client.stopTimer(
		    { id: timerId, stop: now }
		)
	}

	render(){
		return(
		    <div className='ui three column centered grid'>
			    <div className= 'column'>
				    <EditableTimerList
					  timers = {this.state.timers}
					  onFormSubmit = {this.handleUpdateTimer.bind(this)}
					  onTrash = {this.handleDeleteClick}
					  onStartClick = {this.handleStartClick}
					  onStopClick = {this.handleStopClick}
				    />
				    <ToggleableForm isOpen = {true} onFormSubmit ={this.handleCreateTimer.bind(this)} />
			    </div>
		    </div>
		)
	}
}

class EditableTimerList extends React.Component {
	constructor(props){
		super(props)
		this.handleFormSubmit = this.handleFormSubmit.bind(this)
	}

	handleFormSubmit(timer) {
		this.props.onFormSubmit(timer)
	}

	render() {
		const timers = this.props.timers.map( (timer) => {
			return <EditableTimer
			    id = {timer.id}
			    title = {timer.title}
			    project = {timer.project}
			    elapsed = {timer.elapsed}
			    runningSince = {timer.runningSince}
			    key = {'key: ' + timer.id}
			    onFormSubmit = {this.handleFormSubmit.bind(this)}
			    onTrashClick = {this.props.onTrash}
			    onStartClick = {this.props.onStartClick}
			    onStopClick={this.props.onStopClick}
			/>
		} )
		return(
		    <div id = 'timers'>
			    {timers}
		    </div>
		)
	}
}

class EditableTimer extends  React.Component {
	constructor(){
		super()
		this.handleEditClick = this.handleEditClick.bind(this)
		this.handleFormClose = this.handleFormClose.bind(this)
		this.openForm = this.openForm.bind(this)
		this.closeForm = this.closeForm.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}

	state = {
		editFormOpen: false
	}

	handleEditClick(){
		this.openForm()
	}
	handleFormClose(){
		this.closeForm()
	}

	onSubmit(timer){
		this.props.onFormSubmit(timer)
	}

	handleSubmit(timer){
		this.onSubmit(timer)
		this.closeForm()
	}

	closeForm(){
		this.setState({
			editFormOpen: false
		})
	}

	openForm(){
		this.setState({
			editFormOpen: true
		})
	}

	render(){
		if  (this.state.editFormOpen) {
			return (
			    <TimerForm
				    title = {this.props.title}
				    project = {this.props.project}
				    id = {this.props.id}
				    onFormSubmit = {this.handleSubmit.bind(this)}
				    handleClose = {this.closeForm.bind(this)}
				    />
			)
		} else {
			return (
			    <Timer
				  id = {this.props.id}
				  title = {this.props.title}
				  project = {this.props.project}
				  elapsed = {this.props.elapsed}
				  runningSince = {this.props.runningSince}
				  onEditClick = {this.handleEditClick}
				  onTrash={this.props.onTrashClick}
				  onStartClick = {this.props.onStartClick}
				  onStopClick = {this.props.onStopClick}
			    />
			)
		}
	}
}

class TimerForm extends React.Component {
	constructor(props){
		super(props)
			this.state = {
				title: this.props.title || '',
				project: this.props.title || '',
			}
		this.handleProjectChange = this.handleProjectChange.bind(this)
		this.handleTitleChange = this.handleTitleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleTitleChange(e){
		this.setState({
			title: e.target.value,
		})
	}

	handleProjectChange(e){
		this.setState({
			project: e.target.value,
		})
	}

	handleSubmit() {
		this.props.onFormSubmit({
			id: this.props.id,
			title: this.state.title,
			project: this.state.project,
		})
	}

	render() {
		let submitText
		if  (this.props.id != null) {
			submitText = 'Update'
		} else {
			submitText = 'Create'
		}
		return (
			<div className = 'ui centered card' >
				<div className='content'>
					<div className='ui form'>
						<div className='field'>
							<label> Title </label>
							<input type = 'text' value={this.state.title} onChange={this.handleTitleChange}/>
						</div>
						<div className='field'>
							<label> Project </label>
							<input type = 'text' value= {this.state.project} onChange={this.handleProjectChange}/>
						</div>
						<div className='two bottom attached buttons'>
							<button className='ui basic blue button' onClick={this.handleSubmit.bind(this)}>
								{submitText}
							</button>
							<button className='ui basic red button' onClick ={this.props.handleClose.bind(this)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class ToggleableForm extends React.Component {
	constructor(){
		super();
		this.state = {}
		this.handleFormOpen = this.handleFormOpen.bind(this)
		this.handleFormClose = this.handleFormClose.bind(this)
		this.handleFormSubmit = this.handleFormSubmit.bind(this)
	}

	componentDidMount(){
		this.setState({
			isOpen: true,
		})
	}

	handleFormOpen() {
		this.setState({
			isOpen: true,
		})
	}
	handleFormClose(){
		this.setState({
			isOpen: false,
		})
	}
	handleFormSubmit(timer){
		this.props.onFormSubmit(timer)
		this.handleFormClose()
	}

	render(){
		if (this.state.isOpen) {
			return (
			    <TimerForm  onFormSubmit ={this.handleFormSubmit.bind(this)} handleClose = {this.handleFormClose.bind(this)}/>
			)
		} else {
			return (
			    <div className= 'ui basic content center aligned segment' >
				    <button className='ui basic button icon'
							onClick={this.handleFormOpen}
				    >
					    <i className='plus icon' />
				    </button>
			    </div>
			)
		}
	}
}

class Timer extends React.Component {
	componentDidMount(){
		this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50)
	}

	componentWillUnmount(){
		clearInterval(this.forceUpdateInterval)
	}

	handleStartClick = () => {
		this.props.onStartClick(this.props.id)
	}

	handleTrashClick = () => {
		this.props.onTrash(this.props.id);
	}

	handleStopClick = () => {
		this.props.onStopClick(this.props.id);
	}

	render() {
		const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince)
		return (
		    <div className='ui centered card'>
			    <div className='content'>
				    <div className='header'>
					    {this.props.title}
				    </div>
				    <div className='meta'>
					    {this.props.project}
				    </div>
				    <div className='center aligned description'>
					    <h2>
						    {elapsedString}
					    </h2>
				    </div>
				    <div className='extra content'>
            <span className='right floated edit icon' onClick={this.props.onEditClick.bind(this)}>
              	<i className='edit icon' />
            </span>

		 <span className='right floated trash icon' onClick = {this.handleTrashClick}>
              	<i className='trash icon'  />
            </span>
				    </div>
			    </div>
			    <div>
				    <TimerActionButton
				    	timerIsRunning = {!!this.props.runningSince}
				    	onStartClick = {this.handleStartClick}
				    	onStopClick = {this.handleStopClick}
				    />
			    </div>
		    </div>
		);
	}
}

class TimerActionButton extends  React.Component {
	render(){
		if (this.props.timerIsRunning) {
			return(
			    <div className='ui bottom attached red basic button' onClick={this.props.onStopClick}>
				    Stop
			    </div>
			)
		} else {
			return(
			    <div className=' ui bottom attached blue basic button' onClick={this.props.onStartClick}>
				    Start
			    </div>
			)
		}
	}
}

ReactDOM.render(
    <TimerDash/>,
    document.getElementById('content')
)

/*

 */