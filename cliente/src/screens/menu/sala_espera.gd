extends ColorRect

signal connect_to_server()
signal send_to_server(message: Variant)
signal change_in_player_list(button)
var valor_anterior = "LISTO"
var player_names = []

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	Globals.players_number = 0
	var room_details_dict = {"cmd": "get_room_details", "data": { "name": Globals.room_name }}
	send_to_server.emit(JSON.stringify(room_details_dict))
	$AloneTab.visible = false
	$GameDataRect/NumberPlayers.text = "Numero de jugadores:\n" + str(Globals.players_number)
	$GameDataRect/MapName.text = "Mapa:\n" + str(Globals.map_name)
	$GameDataRect/Gamemode.text = "Modo de juego:\n" + str(Globals.gamemode)
	get_parent().get_parent().server_message_recieved.connect(on_server_message_recieved)
	for child in $PlayerListRect/ScrollContainer/VBoxContainer.get_children():
		child.queue_free()
	for name in player_names:
		var button = Button.new()
		button.text = name
		$PlayerListRect/ScrollContainer/VBoxContainer.add_child(button)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if player_names.size() == 0:
		$AloneTab.visible = true
	else:
		$AloneTab.visible = false


func _on_leave_button_pressed() -> void:
	var leave_room_dict = {"cmd": "leave_current_room"}
	send_to_server.emit(JSON.stringify(leave_room_dict))


func on_server_message_recieved(dict: Dictionary):
	if dict["cmd"] == "match_started":
		Lobby.join_game(dict["data"]["host_ip"])
		get_parent().get_parent().change_screen(get_parent().get_parent().game_scene, true, true)
	elif dict["cmd"] == "leave_current_room" and dict["success"]:
		Globals.room_name = null
		get_parent().change_window(get_parent().server_list)
	elif dict["cmd"] == "player_joined_current_room":
		player_names.append(dict["data"]["username"])
		Globals.players_number += 1
	elif dict["cmd"] == "get_room_details" and dict["success"]:
		player_names.append(dict["data"]["owner"])
		player_names.append_array(dict["data"]["players"])
		Globals.players_number += len(dict["data"]["players"])
	elif dict["cmd"] == "player_kicked_from_current_room":
		if dict["data"]["username"] == Globals.username:
			Globals.room_name = null
			get_parent().change_window(get_parent().server_list)
			Globals.players_number = 0
		else:
			player_names.erase(dict["data"]["username"])
			Globals.players_number -= 1

func _on_listo_button_toggled(toggled_on: bool) -> void:
	if valor_anterior == "LISTO":
		$ListoButton.text = "NO LISTO"
		valor_anterior = "NO LISTO"
	else:
		$ListoButton.text = "LISTO"
		valor_anterior = "LISTO"
