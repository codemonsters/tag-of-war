extends Control

signal send_to_server(message: Variant)

#-- Variables

var empty_lobby = preload("res://screens/menu/server_list/empty_lobby.tscn")

#-- Funciones

func add_lobby(lobby_parameters: Dictionary = {}):
	var new = empty_lobby.instantiate()
	if lobby_parameters != {}:
		new.get_node("ServerName").text = lobby_parameters["ServerName"]
		new.get_node("MapName").text = lobby_parameters["MapName"]
		new.get_node("Gamemode").text = lobby_parameters["Gamemode"]
		new.get_node("Time").text = lobby_parameters["Time"]
		new.get_node("Players").text = lobby_parameters["Players"]
		new.get_node("Ping").text = lobby_parameters["Ping"]
	new.send_to_server.connect(on_send_to_server)
	%Casual.add_child(new)

#-- Principal

func _ready() -> void:
	get_parent().get_parent().server_message_received.connect(on_server_message_received)
	var list_request = {"cmd":"list_request"}
	send_to_server.emit(JSON.stringify(list_request))
	for i in range(34):
		add_lobby()


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "":
		var lobby_list = dict[""]
		for lobby in lobby_list:
			add_lobby(lobby)


func _on_create_room_pressed() -> void:
	get_parent().change_window(get_parent().create_game)


func on_send_to_server(message: Variant):
	send_to_server.emit(message)
