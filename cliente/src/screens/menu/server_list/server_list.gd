extends Control

#-- Variables

var empty_lobby = preload("res://screens/menu/server_list/empty_lobby.tscn")

#-- Funciones

func add_lobby():
	var new = empty_lobby.instantiate()
	%Casual.add_child(new)

#-- Principal

func _ready() -> void:
	for i in range(34):
		add_lobby()
