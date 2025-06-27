extends CharacterBody2D

@export var speed = 5.0
@export var input: PlayerInput

# Get the gravity from the project settings to be synced with RigidBody nodes.
var gravity = ProjectSettings.get_setting(&"physics/3d/default_gravity")

func _ready():
	position = Vector2(200, 200)
	
	if input == null:
		input = $Input

func _rollback_tick(delta, _tick, _is_fresh):
	# Add the gravity.
	if not is_on_floor():
		velocity.y -= gravity * delta

	var input_dir = input.movement
	print(input_dir)
	var direction = (Vector2(input_dir.x, input_dir.z)).normalized()
	if direction:
		velocity.x = direction.x * speed
		velocity.y = direction.y * speed
	else:
		velocity.x = move_toward(velocity.x, 0, speed)
		velocity.y = move_toward(velocity.y, 0, speed)

	# move_and_slide assumes physics delta
	# multiplying velocity by NetworkTime.physics_factor compensates for it
	velocity *= NetworkTime.physics_factor
	move_and_slide()
	velocity /= NetworkTime.physics_factor

# -------------------------------------------------------------------------------------------------




"""

@export var walkspeed = 320	# TODO: Eliminar en favor de speed? (speed lo introdujimos con Netfox)
##Pixels per second
@export var acceleration = 800
##Pixels per second
@export var deceleration = 640

@export var jump = 500
@export var gravity = 20
@export var terminal_velocity = 600

# var speed = 0	# 
var walk_direction = 1 #1 o -1 para cambiar el signo de la velocidad al ser multiplicado por ella
var walljump_available = 2
var hola = false
var crouch = false

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
		if on_floor and crouch == false:
			velocity.y -= jump + velocity.y
			hola = false
		elif is_on_wall_only() and walljump_available > 0 and hola == true and crouch == false:
			velocity.y -= jump + velocity.y
			walljump_available -= 1
			if get_wall_normal().x > 0:
				walk_direction = 1
				velocity.x = walkspeed * walk_direction
			else:
				walk_direction = -1
				velocity.x = walkspeed * walk_direction
			hola = false
			
	velocity.x = speed * walk_direction
	
	if Input.is_action_pressed("crouch") and is_on_floor():
		crouch = true
		$CollisionShape2D.shape.height = 31
		$CollisionShape2D.position = Vector2(0, 16.5)
		if $CollisionShape2D.
		$ColorRect.size = Vector2(32, 32)
		$ColorRect.position = Vector2(-16, 0)
	else:
		crouch = false
		$ColorRect.size = Vector2(32, 64)
		$ColorRect.position = Vector2(-16, -32)
		$CollisionShape2D.shape.height = 62
		$CollisionShape2D.position = Vector2(0, 1)
	
	if not on_floor:
		if velocity.y <= terminal_velocity:
			velocity.y += gravity
	
	move_and_slide()
"""
