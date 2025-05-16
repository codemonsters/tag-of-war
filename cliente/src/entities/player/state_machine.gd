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
	if current_state:
		current_state.process(delta)
		
	if initial_state:
		initial_state.Enter()
		current_state= initial_state

func _physics_process(delta: float):
	if current_state:
		current_state.Physics_process(delta)

func on_child_transition(state, new_state_name):
	if state != current_state:
		return
	var new_state = state.get(new_state_name)
	if !new_state:
		return
	if current_state:
		current_state.Exit()
	new_state.enter()
	current_state = new_state
