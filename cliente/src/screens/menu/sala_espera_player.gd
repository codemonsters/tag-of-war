extends ColorRect

signal connect_to_server()
signal send_to_server(message: Variant)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$GameDataRect/NumberPlayers.text = "Numero de jugadores:\n" + str(Globales.players_number)
	$GameDataRect/MapName.text = "Mapa:\n" + str(Globales.map_name)
	$GameDataRect/Gamemode.text = "Modo de juego:\n" + str(Globales.gamemode)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_leave_button_pressed() -> void:
	pass # Replace with function body.
