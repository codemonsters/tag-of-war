extends State

var run_direction : int
var speed : int
@export var walkspeed = 320
@export var acceleration = 800
@export var deceleration = 640
var a : int = 0

func Enter():
	pass
	
func Exit():
	pass
	
func Process(delta: float):
	pass

func Physics_process(delta: float):
	var a
	var speed : int = 100
	run_direction = 1
	speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	get_parent().get_parent().velocity.x = speed * run_direction
	get_parent().get_parent().move_and_slide()
