extends Control

var gamemodes = ["Clásico", "Supervivencia", "Infectado"]
var gamemodes_index = 0
var gamemode_description = ["Cuando te pillan, el jugador que te pilló deja de \n
pillar, ahora pillas tú", "Si te pillan estás eliminado, gana el último que \n
quede vivo", "Si te pillan, ahora pillas tú y todos los que estuvieran pillados \n
antes"]


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$CreateGame.visible = true
	$ChooseMap.visible = false
	$Gamemode.text = gamemodes[gamemodes_index]
	$CreateGame/GamemodeDescriptionTxt.text = "Cuando te pillan, el jugador que \n  
	te pilló deja de pillar, ahora pillas tú"
	$Gamemode.visible = true
	
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_button_next_pressed() -> void:
	$CreateGame.visible = false
	$ChooseMap.visible = true
	$Gamemode.visible = false
	


func _on_button_go_back_pressed() -> void:
	$CreateGame.visible = true
	$ChooseMap.visible = false
	$Gamemode.visible = true


func _on_gamemode_pressed() -> void:

	if gamemodes_index == 2:
		gamemodes_index = 0
	else:
		gamemodes_index += 1
	$Gamemode.text = gamemodes[gamemodes_index]
	$CreateGame/GamemodeDescriptionTxt.text = gamemode_description[gamemodes_index]
