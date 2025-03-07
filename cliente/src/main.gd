extends Node2D

# Escena que está cargada siempre, independientemente de si el jugador está en el menú o jugando
# El script instancia en current_screen la pantalla en la que está el juego en cada momento

@export var websocket_url = "ws://127.0.0.1:9090"

var server_list = preload("res://screens/menu/sala_espera_admin.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")
var wsc = WebSocketClient.new()
var fade_duration = 1.0
var screen_transition_duration = 1.0
var menu_scene = preload("res://screens/menu/menu_main.tscn")
var modal_window = preload("res://modal_window.tscn")

signal server_message_received(dict: Dictionary)

func _ready() -> void:
	get_node("ColorRect").set_color(Color(0, 0, 0, 0))
	change_screen(menu_scene)
	wsc.message_received.connect(on_message_received)
	wsc.connected_to_server.connect(on_connect)
	wsc.connection_closed.connect(on_connection_closed)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	wsc.poll()


func change_screen(scene, does_fade_out = true, does_screen_transition = true, screen_transition_direction = 1):
	remove_child(get_node("current_screen"))
	var s = scene.instantiate()
	s.name = "current_screen"
	add_child(s)
	if does_fade_out: fade_out()
	if does_screen_transition: screen_transition(s,screen_transition_direction)
	get_node("current_screen").screen_connect_to_server.connect(on_connect_to_server)
	get_node("current_screen").screen_send_to_server.connect(on_send_to_server)


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
	move_child($ColorRect, -1)
	get_node("ColorRect").set_color(Color(0, 0, 0, 1))
	var tween = get_tree().create_tween()
	tween.tween_property(get_node("ColorRect"), "modulate:a", 0, fade_duration)
	tween.play()
	await tween.finished
	tween.kill()
	move_child($ColorRect, 0)


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


func on_connect_to_server():
	wsc.connect_to_url(websocket_url)


func on_send_to_server(message: Variant):
	if wsc.socket.get_ready_state() == wsc.socket.STATE_OPEN:
		wsc.send(message)


func on_message_received(message: Variant):
	var message_dict = JSON.parse_string(message)
	server_message_received.emit(message_dict)


func on_connect():
	print("conectado")


func on_connection_closed():
	print("desconectado")
