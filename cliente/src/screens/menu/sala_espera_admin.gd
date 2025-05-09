extends ColorRect

signal connect_to_server()
signal send_to_server(message: Variant)
signal change_in_player_list(button)
var valor_anterior = "LISTO"
var admin_name = "admin" + " (admin)"
var player_names = [admin_name]

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
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
		button.pressed.connect(self._on_button_pressed.bind(button))
		$PlayerListRect/ScrollContainer/VBoxContainer.add_child(button)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if player_names.size() == 0:
		$AloneTab.visible = true
	else:
		$AloneTab.visible = false


func _on_leave_button_pressed() -> void:
	pass # Replace with function body.


func on_server_message_recieved(dict: Dictionary):
	if dict["cmd"] == "":
		Lobby.join_game(dict["data"])

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
		player_names.erase(button.text)
		change_in_player_list.emit(button)

func _on_change_in_player_list(button) -> void:
	for child in $PlayerListRect/ScrollContainer/VBoxContainer.get_children():
		child.queue_free()
	for name in player_names:
		button = Button.new()
		button.text = name
		button.pressed.connect(self._on_button_pressed.bind(button))
		$PlayerListRect/ScrollContainer/VBoxContainer.add_child(button)


func _on_iniciar_partida_button_pressed() -> void:
	Lobby.create_game()
	var create_game_dict = {"cmd":"start_matchup"}
	send_to_server.emit(JSON.stringify(create_game_dict))
