extends CharacterBody2D

@export var walkspeed = 320
##Pixels per second
@export var acceleration = 800
##Pixels per second
@export var deceleration = 640

@export var jump = 500
@export var gravity = 20
@export var terminal_velocity = 600

var speed = 0
var walk_direction = 1
var walljump_available = null

func _ready() -> void:
	velocity.y += 100

func _physics_process(delta: float) -> void:
	
	if is_on_floor():
		walljump_available = true
	
	var on_floor = is_on_floor()
	
	var on_wall = is_on_wall()
	
	if Input.is_action_pressed("walk_right"):
		if walk_direction == -1:
			speed = 0
			walk_direction = 1
		speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	elif Input.is_action_pressed("walk_left"):
		if walk_direction == 1:
			speed = 0
			walk_direction = -1
		speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	else:
		speed = clamp(speed - (deceleration * delta), 0, walkspeed)
	
	if Input.is_action_pressed("jump"):
		if on_floor and velocity.y == 0:
			velocity.y -= jump
		elif on_wall and walljump_available == true:
			velocity.y -= jump
			walljump_available = false
			
	velocity.x = speed * walk_direction
	
	if not on_floor:
		if velocity.y <= terminal_velocity:
			velocity.y += gravity
	
	move_and_slide()
