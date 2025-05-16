extends Control

signal send_to_server(message: Variant)

var sala_espera = preload("res://screens/menu/server_list/server_list.tscn")
var gamemodes = ["Clásico", "Supervivencia", "Infectado"]
var gamemodes_index = 0
var num_player = ["2", "3", "4"]
var num_player_index = 0

var clasico_descripcion = "Si te pillan, el jugador que te pilló deja de " \
+ "pillar, ahora pillas tú. Pierde el que está pillando cuando se acaba el tiempo."
var supervivencia_descripcion = "Si te pillan estás eliminado. Cuando se " \
+ "acaba el tiempo, ganan todos los que escapan que quedan vivos o, en el caso " \
+ "de que no quede ninguno, el que pilla."
var infectado_descripcion = "Si te pillan, pillas tú con todos los que " \
+ "estuvieran pillados antes."
var gamemode_description = [clasico_descripcion, supervivencia_descripcion, \
infectado_descripcion]

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ChooseMap/SelectName/ErrorMissingName.visible = false
	$CreateGame.visible = true
	$ChooseMap.visible = false
	$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
	$CreateGame/GamemodeDescriptionTxt.text = clasico_descripcion
	$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
	
	get_parent().get_parent().server_message_received.connect(on_server_message_received)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_button_next_pressed() -> void:
	if $CreateGame.visible:
		Globals.players_number = $CreateGame/PlayerNumTxt.text
		Globals.gamemode = $CreateGame/GamemodeNameTxt.text
		$CreateGame.visible = false
		$ChooseMap.visible = true
	else:
		$ChooseMap/SelectName/ErrorMissingName.visible = false
		if $ChooseMap/SelectName/RoomName.text != "":
			Globals.room_name = $ChooseMap/SelectName/RoomName.text
			var create_room_dict = {"cmd": "create_and_join_room", "data": {"name": Globals.room_name}}
			send_to_server.emit(JSON.stringify(create_room_dict))
		else:
			$ChooseMap/SelectName/ErrorMissingName.visible = true


func _on_button_go_back_pressed() -> void:
	if $ChooseMap.visible:
		$CreateGame.visible = true
		$ChooseMap.visible = false
	else:
		get_parent().change_window(get_parent().server_list)


func _on_left_arrow_txt_pressed() -> void:
	if gamemodes_index != 0:
		gamemodes_index -= 1
		$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
		$CreateGame/GamemodeDescriptionTxt.text = gamemode_description[gamemodes_index]

func _on_right_arrow_txt_pressed() -> void:
	if gamemodes_index != 2:
			gamemodes_index += 1
			$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
			$CreateGame/GamemodeDescriptionTxt.text = gamemode_description[gamemodes_index]

func _on_num_player_l_pressed() -> void:
	if num_player_index != 0:
		num_player_index -= 1
		$CreateGame/PlayerNumTxt.text = num_player[num_player_index]
		
func _on_num_player_r_pressed() -> void:
	if num_player_index != 2:
		num_player_index += 1
		$CreateGame/PlayerNumTxt.text = num_player[num_player_index]


func _on_button_pressed() -> void:
	if $ChooseMap/Map1.color != Color(0.1176, 0.1961, 0.1176):
		$ChooseMap/Map1.color = Color(0.1176, 0.1961, 0.1176)
	else:
		$ChooseMap/Map1.color = Color(0.1176, 0.1176, 0.1176)
	Globals.map_name = $ChooseMap/Map1/MapName.text


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "create_and_join_room":
		if dict["success"]:
			get_parent().change_window(get_parent().sala_espera_admin)
		else:
			printerr(dict["data"]["details"])
