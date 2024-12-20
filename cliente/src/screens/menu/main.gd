extends Node2D

var identification = preload("res://screens/menu/identification.tscn")


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	change_screen(identification)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func change_screen(scene):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
