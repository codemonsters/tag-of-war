extends Node2D

var identification = preload("res://screens/menu/identification.tscn")
var sala_espera_admin = preload("res://screens/menu/sala_espera_admin.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")
var server_list = preload("res://screens/menu/server_list/server_list.tscn")
var create_game = preload("res://screens/menu/create_game.tscn")
var utilities = Utilities.new()

signal screen_connect_to_server()
signal screen_send_to_server(message: Variant)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	change_window(identification)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func change_window(scene):
	if get_node_or_null("current_screen") != null: remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
	if utilities.object_has_signal(get_node("current_screen"),"connect_to_server"):
		get_node("current_screen").connect_to_server.connect(on_connect_to_server)
	if utilities.object_has_signal(get_node("current_screen"),"send_to_server"):
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
