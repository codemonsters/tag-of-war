extends CharacterBody2D

@export var walkspeed = 320
##Pixels per second
@export var acceleration = 640
##Pixels per second
@export var deceleration = 640

@export var jump = 250
@export var gravity = 5
@export var terminal_velocity = 400

var speed = 0
var walk_direction = 1

func _ready() -> void:
	velocity.y += 100

func _physics_process(delta: float) -> void:
	
	var on_floor = is_on_floor()
	
	if Input.is_action_pressed("walk_right"):
		walk_direction = 1
		speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	elif Input.is_action_pressed("walk_left"):
		walk_direction = -1
		speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	else:
		speed = clamp(speed - (deceleration * delta), 0, walkspeed)
	
	if Input.is_action_pressed("jump") and on_floor:
		velocity.y -= jump
	
	velocity.x = speed * walk_direction
	
	if not on_floor:
		if velocity.y <= terminal_velocity:
			velocity.y += gravity
	
	move_and_slide()
