extends Control

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
	$CreateGame.visible = true
	$ChooseMap.visible = false
	$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
	$CreateGame/GamemodeDescriptionTxt.text = clasico_descripcion
	$CreateGame/GamemodeNameTxt.text = gamemodes[gamemodes_index]
	
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_button_next_pressed() -> void:
	if $CreateGame.visible:
		$CreateGame.visible = false
		$ChooseMap.visible = true


func _on_button_go_back_pressed() -> void:
	if $ChooseMap.visible:
		$CreateGame.visible = true
		$ChooseMap.visible = false



	var tumama = """if gamemodes_index == 2:
		gamemodes_index = 0
	else:
		gamemodes_index += 1
	$Gamemode.text = gamemodes[gamemodes_index]
	$CreateGame/GamemodeDescriptionTxt.text = gamemode_description[gamemodes_index]"""


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
