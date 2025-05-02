extends Node2D

### Config

##Pixels per tick
@export var walkspeed: float = 8
@export var gravity: float = 1

### Activos

var velocity_y: float = 0
var velocity_x: float = 0

func _physics_process(delta):
	
	print("Checks started")
	
	# AGONY
	# collisiones
	
	var down = false
	var up = false
	var right = false
	var left = false
	
	$Hipcast.target_position = Vector2.DOWN
	$Hipcast.force_shapecast_update()
	for i in $Hipcast.collision_result:
		if i["point"].y > position.y:
			down = true
	
	$Hipcast.target_position = Vector2.RIGHT
	$Hipcast.force_shapecast_update()
	for i in $Hipcast.collision_result:
		if i["point"].x > position.x:
			right = true
	
	$Hipcast.target_position = Vector2.LEFT
	$Hipcast.force_shapecast_update()
	for i in $Hipcast.collision_result:
		if i["point"].x <= position.x:
			left = true
	
	$Hipcast.target_position = Vector2.UP
	$Hipcast.force_shapecast_update()
	for i in $Hipcast.collision_result:
		if i["point"].y < position.y:
			up = true
	
	
	if Input.is_action_pressed("walk_left") and not left:
		position.x -= walkspeed
	if Input.is_action_pressed("walk_right") and not right:
		position.x += walkspeed
	
	if not down:
		#velocity_y += gravity
		position.y += gravity
