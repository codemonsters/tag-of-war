extends ColorRect

signal connect_to_server()
signal send_to_server(message: Variant)
var valor_anterior = "LISTO"

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$GameDataRect/NumberPlayers.text = "Numero de jugadores:\n" + str(Globales.players_number)
	$GameDataRect/MapName.text = "Mapa:\n" + str(Globales.map_name)
	$GameDataRect/Gamemode.text = "Modo de juego:\n" + str(Globales.gamemode)
	#get_parent().get_parent().server_message_recieved.connect(on_server_message_recieved)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_leave_button_pressed() -> void:
	pass # Replace with function body.


func on_server_message_recieved(dict: Dictionary):
	pass

func _on_listo_button_toggled(toggled_on: bool) -> void:
	if valor_anterior == "LISTO":
		$ListoButton.text = "NO LISTO"
		valor_anterior = "NO LISTO"
	else:
		$ListoButton.text = "LISTO"
		valor_anterior = "LISTO"
