extends Node2D

var identification = preload("res://screens/menu/identification.tscn")
var server_list = preload("res://screens/menu/sala_espera_admin.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")

signal screen_connect_to_server()
signal screen_send_to_server(message: Variant)
signal server_message_received(dict: Dictionary)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	change_window(identification)
	get_parent().server_message_received.connect(on_server_message_received)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func change_window(scene):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
	get_node("current_screen").connect_to_server.connect(on_connect_to_server)
	get_node("current_screen").send_to_server.connect(on_send_to_server)

func open_window(scene):
	var n = scene.instantiate()
	n.name = "current_window"
	add_child(n)

func close_window():
	remove_child(get_node("current_window"))


func on_connect_to_server():
	screen_connect_to_server.emit()


func on_send_to_server(message: Variant):
	screen_send_to_server.emit(message)


func on_server_message_received(dict: Dictionary):
	server_message_received.emit(dict)
