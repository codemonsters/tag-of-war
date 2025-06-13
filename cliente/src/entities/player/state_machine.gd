extends Node

var states : Dictionary = {}
var current_state : State
@export var initial_state : State

func ready():
	for child in get_children():
		if child is State:
			states[child.name] = child
			child.Transition.connect(on_child_transition)

func _process(delta: float):
	if Input.is_action_pressed("walk_left"):
		$Run.run_direction = -1
		on_child_transition(current_state, "Run")
	if Input.is_action_pressed("walk_right"):
		$Run.run_direction = 1
		on_child_transition(current_state, "Run")
	if Input.is_action_pressed("jump"):
		on_child_transition(current_state, "Jump")
	if current_state:
		current_state.Process(delta)
		
	if initial_state:
		initial_state.Enter()
		current_state= initial_state

func _physics_process(delta: float):
	if current_state:
		current_state.Physics_process(delta)

func on_child_transition(state : State, new_state_name : String):
	if state != current_state:
		return
	var new_state = state.get(new_state_name)
	if !new_state:
		return
	if current_state:
		current_state.Exit()
	new_state.enter()
	current_state = new_state
