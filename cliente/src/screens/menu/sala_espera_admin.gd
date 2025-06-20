extends ColorRect

signal connect_to_server()
signal send_to_server(message: Variant)
signal change_in_player_list(button)
var valor_anterior = "LISTO"
var admin_name = Globals.username + " (admin)"
var player_names = [admin_name]

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	Globals.players_number = 1
	get_parent().get_parent().server_message_received.connect(on_server_message_received)
	$AloneTab.visible = false
	$GameDataRect/NumberPlayers.text = "Numero de jugadores:\n" + str(Globals.players_number)
	$GameDataRect/MapName.text = "Mapa:\n" + str(Globals.map_name)
	$GameDataRect/Gamemode.text = "Modo de juego:\n" + str(Globals.gamemode)
	for child in $PlayerListRect/ScrollContainer/VBoxContainer.get_children():
		child.queue_free()
	for name in player_names:
		var button = Button.new()
		button.text = name
		button.pressed.connect(self._on_button_pressed.bind(button))
		$PlayerListRect/ScrollContainer/VBoxContainer.add_child(button)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if player_names.size() == 0:
		$AloneTab.visible = true
	else:
		$AloneTab.visible = false


func _on_leave_button_pressed() -> void:
	var destroy_room_dict = {"cmd": "room_destroyed", "data": { "name": Globals.room_name}}
	send_to_server.emit(JSON.stringify(destroy_room_dict))
	Globals.room_name = null
	Globals.players_number = 0
	get_parent().change_window(get_parent().server_list)


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "start_match" and dict["success"]:
		get_parent().get_parent().change_screen(get_parent().get_parent().game_scene, true, true)
	elif dict["cmd"] == "player_joined_current_room":
		player_names.append(dict["data"]["username"])
		Globals.players_number += 1


func _on_listo_button_toggled(toggled_on: bool) -> void:
	if valor_anterior == "LISTO":
		$ListoButton.text = "NO LISTO"
		valor_anterior = "NO LISTO"
	else:
		$ListoButton.text = "LISTO"
		valor_anterior = "LISTO"
		
func _on_button_pressed(button: Button):
	if button.text == admin_name:
		pass
	else:
		var kick_player_dict = {"cmd": "kick_from_current_room", "data": { "username": button.text }}
		send_to_server.emit(JSON.stringify(kick_player_dict))
		player_names.erase(button.text)
		change_in_player_list.emit(button)
		Globals.players_number -= 1


func _on_change_in_player_list(button) -> void:
	for child in $PlayerListRect/ScrollContainer/VBoxContainer.get_children():
		child.queue_free()
	for name in player_names:
		button = Button.new()
		button.text = name
		button.pressed.connect(self._on_button_pressed.bind(button))
		$PlayerListRect/ScrollContainer/VBoxContainer.add_child(button)


func _on_iniciar_partida_button_pressed() -> void:
	var create_game_dict = {"cmd":"start_match"}
	$LANBootstrapper.host()
	send_to_server.emit(JSON.stringify(create_game_dict))
