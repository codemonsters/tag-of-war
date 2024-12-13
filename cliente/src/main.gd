extends Node2D

# Escena que está cargada siempre, independientemente de si el jugador está en el menú o jugando
# El script instancia en current_screen la pantalla en la uqe está el juego en cada momento

var closing_function = hide_modal_window()
var menu_scene = preload("res://screens/menu/main.tscn")
var modal_window = preload("res://modal_window.tscn")

func _ready() -> void:
	change_screen(menu_scene)
	show_modal_window("hola")


func change_screen(scene):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)


func show_modal_window(text,button_text="Ok"):
	var m = modal_window.instantiate()
	m.name = "modal_window"
	m.get_node("Label").text = text
	m.get_node("Button").text = button_text
	get_tree().paused = true
	add_child(m)


func _on_modal_window_closed():
	#closing_function
	hide_modal_window()


func hide_modal_window():
	remove_child(get_node("modal_window"))
