extends Node2D


@export var websocket_url = "ws://192.168.0.109:9090"

var server_list = preload("res://screens/menu/sala_espera.tscn")
var regex = RegEx.new()
var wsc = WebSocketClient.new()


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$TxtAccountName.grab_focus()
	$ErrorMessageNameLength.visible = false
	$ErrorMessageNameInUse.visible = false
	$ErrorMessagePasswordLength.visible = false
	$ErrorMessageMail.visible = false
	var pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
	var result = regex.compile(pattern)

	wsc.message_received.connect(on_message_received)
	wsc.connected_to_server.connect(on_connect)
	wsc.connection_closed.connect(on_connection_closed)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	wsc.poll()


func _on_btn_create_account_pressed() -> void:
	var Account_username = str($TxtAccountName.get_text())
	var Account_mail = str($TxtAccountMail.get_text())
	var Account_password = str($TxtAccountPassword.get_text())
	if str($TxtAccountName.get_text()).length() > 20 or str($TxtAccountName.get_text()).length() < 1: 
		Account_username = null
		$ErrorMessageNameLength.visible = true
	else:
		$ErrorMessageNameLength.visible = false
	if str($TxtAccountPassword.get_text()).length() > 20 or str($TxtAccountPassword.get_text()).length() < 6: 
		Account_password = null
		$ErrorMessagePasswordLength.visible = true
	else:
		$ErrorMessagePasswordLength.visible = false
	if regex.search($TxtAccountMail.get_text()) == null: 
		Account_mail = null
		$ErrorMessageMail.visible = true
	else:
		$ErrorMessageMail.visible = false
	if regex.search($TxtAccountMail.get_text()) != null and str($TxtAccountPassword.get_text()).length() < 20 and str($TxtAccountPassword.get_text()).length() > 6 and str($TxtAccountName.get_text()).length() < 20 and str($TxtAccountName.get_text()).length() > 1: 
		print("Todos los campos son correctos")
		var login_dict = {"cmd":"login", "data": {"username": Account_username}} #Cambiar una vez exista comando para crear cuenta
		wsc.connect_to_url(websocket_url)
		await get_tree().create_timer(1).timeout
		if wsc.socket.get_ready_state() == wsc.socket.STATE_OPEN:
			wsc.send(JSON.stringify(login_dict))
		get_parent().change_window(get_parent().lista_servidores)


func _on_btn_volver_pressed() -> void:
	get_parent().close_window()



func on_message_received(message: Variant):
	print(message)
	if message == "": #Actualizar cuando el server pueda responder que recibió los datos correctamente
		#get_parent().change_window(server_list)
		pass
	elif message == "": #Actualizar cuando el server pueda responder que el nombre de usuario ya existe
		$ErrorMessageNameInUse.visible = true


func on_connect():
	print("conectado")


func on_connection_closed():
	print("desconectado")

