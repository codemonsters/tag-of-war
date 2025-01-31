extends Node2D

@export var websocket_url = "ws://192.168.0.109:9090"
#@export var websocket_url = "ws://echo.websocket.org"

var server_list = preload("res://screens/menu/sala_espera.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")
var wsc = WebSocketClient.new()

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ErrorMessageLength.visible = false
	$ErrorMessageUsed.visible = false
	$ErrorMessageUserAccount.visible = false
	$ErrorMessagePasswordAccount.visible = false
	wsc.message_received.connect(on_message_received)
	wsc.connected_to_server.connect(on_connect)
	wsc.connection_closed.connect(on_connection_closed)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	wsc.poll()


func _on_boton_invitado_pressed() -> void:
	$RectCoverGuest.visible = false
	$RectCoverAccount.visible = true
	$TxtGuestUser.grab_focus()

func _on_boton_cuenta_pressed() -> void:
	$RectCoverAccount.visible = false
	$RectCoverGuest.visible = true
	$TxtAccountUser.grab_focus()
	$ErrorMessageLength.visible = false

func _on_btn_connect_guest_pressed() -> void:
	var Guest_username = str($TxtGuestUser.get_text())
	if str($TxtGuestUser.get_text()).length() > 20 or str($TxtGuestUser.get_text()).length() < 1: 
		Guest_username = null
		$ErrorMessageLength.visible = true
	else:
		var login_dict = {"cmd":"login", "data": {"username": Guest_username}}
		wsc.connect_to_url(websocket_url)
		await get_tree().create_timer(1).timeout
		if wsc.socket.get_ready_state() == wsc.socket.STATE_OPEN:
			wsc.send(JSON.stringify(login_dict))
		get_parent().change_window(server_list)


func _on_btn_connect_account_pressed() -> void:
	pass # Replace with function body.


func _on_btn_create_account_pressed() -> void:
	get_parent().open_window(get_parent().create_account)


func _on_btn_password_pressed() -> void:
	get_parent().open_window(get_parent().recuperar_contraseña)


func on_message_received(message: Variant):
	print(message)
	if message == "": #Actualizar cuando el server pueda responder que recibió los datos correctamente
		pass
		#get_parent().change_window(server_list)


func on_connect():
	print("conectado")


func on_connection_closed():
	print("desconectado")
