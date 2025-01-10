extends Node2D

# Escena que está cargada siempre, independientemente de si el jugador está en el menú o jugando
# El script instancia en current_screen la pantalla en la uqe está el juego en cada momento

var fade_duration = 1.0
var screen_transition_duration = 1.0
var menu_scene = preload("res://screens/menu/main.tscn")
var modal_window = preload("res://modal_window.tscn")

func _ready() -> void:
	change_screen(menu_scene)


func change_screen(scene, does_fade_out = true, does_screen_transition = true, screen_transition_direction = 1):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
	move_child(s, 0)
	if does_fade_out: fade_out()
	if does_screen_transition: screen_transition(s,screen_transition_direction)


func show_modal_window(text: String, on_close: Callable = func(): pass, button_text: String = "Ok"):
	var m = modal_window.instantiate()
	m.name = "modal_window"
	m.get_node("Label").text = text
	m.get_node("Button").text = button_text
	m._on_close = on_close
	get_tree().paused = true
	add_child(m)


func hide_modal_window():
	remove_child(get_node("modal_window"))


func fade_out():
	get_node("ColorRect").set_color(Color(0, 0, 0, 1))
	var tween = get_tree().create_tween()
	tween.tween_property(get_node("ColorRect"), "modulate:a", 0, fade_duration)
	tween.play()
	await tween.finished
	tween.kill()


func screen_transition(scene,direction):
	scene.position = Vector2(1280*direction, 0)
	var tween = create_tween()
	tween.tween_property(scene, "position", Vector2(-75*direction, 0), 0.5*screen_transition_duration)
	tween.tween_property(scene, "position", Vector2(75*direction, 0), 0.125*screen_transition_duration)
	tween.tween_property(scene, "position", Vector2(-50*direction, 0), 0.125*screen_transition_duration)
	tween.tween_property(scene, "position", Vector2(50*direction, 0), 0.125*screen_transition_duration)
	tween.tween_property(scene, "position", Vector2(0, 0), 0.125*screen_transition_duration)
	await tween.finished
	tween.kill()
