extends Button

signal send_to_server(message: Variant)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_pressed() -> void:
	var join_room = {"cmd": "join_room", "data": { "name": get_node("ServerName").text}}
	send_to_server.emit(JSON.stringify(join_room))
