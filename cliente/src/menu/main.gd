extends Node2D

var identificacion = preload("res://menu/identificacion.tscn")


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	add_child(identificacion.instantiate())


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
