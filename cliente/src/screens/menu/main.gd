extends Node2D

var identification = preload("res://screens/menu/identification.tscn")


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	add_child(identification.instantiate())


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
