extends Control

var empty_room = load("res://menu/server_list/room.tscn")

# Funciones

func add_room() -> void:
	var new_room = empty_room.instantiate()
	%Casual.add_child(new_room)

# Principal

func _ready() -> void:
	for n in range(1, 5):
		print(n)
		add_room()
