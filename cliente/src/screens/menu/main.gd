extends Node2D

var identification = preload("res://screens/menu/identification.tscn")
var server_list = preload("res://screens/menu/sala_espera.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")
var lista_servidores = preload("res://screens/menu/lista_servidores.tscn")

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	change_window(identification)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func change_window(scene):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
