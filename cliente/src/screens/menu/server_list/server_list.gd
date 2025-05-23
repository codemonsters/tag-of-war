extends Control

signal send_to_server(message: Variant)

#-- Variables

var empty_lobby = preload("res://screens/menu/server_list/empty_lobby.tscn")

#-- Funciones

func add_lobby(lobby_parameters: Dictionary = {}):
	var new = empty_lobby.instantiate()
	if lobby_parameters != {}:
		new.get_node("room_name").text = lobby_parameters["ServerName"]
		new.get_node("map").text = lobby_parameters["MapName"]
		new.get_node("mode").text = lobby_parameters["Gamemode"]
#		new.get_node("Time").text = lobby_parameters["Time"]
		new.get_node("number_of_players").text = lobby_parameters["Players"]
#		new.get_node("Ping").text = lobby_parameters["Ping"]
	new.send_to_server.connect(on_send_to_server)
	%Casual.add_child(new)

#-- Principal

func _ready() -> void:
	get_parent().get_parent().server_message_received.connect(on_server_message_received)
	var get_room_names = {"cmd":"get_rooms"}
	send_to_server.emit(JSON.stringify(get_room_names))


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "get_rooms":
		var lobby_list = dict["data"]["room_names"]
		for lobby in lobby_list:
			add_lobby(lobby)
	elif dict["cmd"] == "join_room":
		if dict["success"]:
			get_parent().change_window(get_parent().sala_espera_admin)
		else:
			Globals.room_name = null


func _on_create_room_pressed() -> void:
	get_parent().change_window(get_parent().create_game)


func on_send_to_server(message: Variant):
	send_to_server.emit(message)
