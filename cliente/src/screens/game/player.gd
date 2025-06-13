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
var walk_direction = 1 #1 o -1 para cambiar el signo de la velocidad al ser multiplicado por ella
var walljump_available = 2
var hola = false

func _ready() -> void:
	velocity.y += 100

func _physics_process(delta: float) -> void:
	
	if is_on_floor():
		walljump_available = 2
		hola = false
	
	var on_floor = is_on_floor()
	
	var on_wall = is_on_wall()
	
	if Input.is_action_just_released("jump"):
		hola = true
	
	if Input.is_action_pressed("walk_right") and Input.is_action_pressed("walk_left"):
		walk_direction = 0

	elif Input.is_action_pressed("walk_right"):
		if walljump_available > 1:
			if walk_direction != 1:
				speed = 0
				walk_direction = 1
			speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	elif Input.is_action_pressed("walk_left"):
		if walljump_available > 1:
			if walk_direction != -1:
				speed = 0
				walk_direction = -1
			speed = clamp(speed + (acceleration * delta), 0, walkspeed)
	else:
		speed = clamp(speed - (deceleration * delta), 0, walkspeed)

	if Input.is_action_pressed("jump"):
		if on_floor:
			velocity.y -= jump + velocity.y
			hola = false
		elif is_on_wall_only() and walljump_available > 0 and hola == true:
			velocity.y -= jump + velocity.y
			walljump_available -= 1
			print(get_wall_normal().x)
			if get_wall_normal().x > 0:
				walk_direction = 1
				velocity.x = walkspeed * walk_direction
			else:
				walk_direction = -1
				velocity.x = walkspeed * walk_direction
			hola = false
			
	velocity.x = speed * walk_direction
	
	if not on_floor:
		if velocity.y <= terminal_velocity:
			velocity.y += gravity
	
	move_and_slide()
