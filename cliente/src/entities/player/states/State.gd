extends Node
class_name State

signal Transition(current_state: State, new_state : State)

@export var animation_id : String
@export var animation_speed : float = 1

func Enter():
	pass
	
func Exit():
	pass
	
func Process(delta: float):
	pass

func Physics_process(delta: float):
	pass
