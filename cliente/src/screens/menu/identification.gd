extends Node2D

@export var websocket_url = "ws://192.168.0.109/9090"

var server_list = preload("res://screens/menu/sala_espera.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var socket = WebSocketPeer.new()
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ErrorMessageLength.visible = false
	$ErrorMessageUsed.visible = false
	$ErrorMessageUserAccount.visible = false
	$ErrorMessagePasswordAccount.visible = false


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta: float) -> void:
#	pass


func _on_boton_invitado_pressed() -> void:
	$RectCoverGuest.visible = false
	$RectCoverAccount.visible = true
	$TxtGuestUser.grab_focus()

func _on_boton_cuenta_pressed() -> void:
	$RectCoverAccount.visible = false
	$RectCoverGuest.visible = true
	$TxtAccountUser.grab_focus()

func _on_btn_connect_guest_pressed() -> void:
	var Guest_username = str($TxtGuestUser.get_text())
	if str($TxtGuestUser.get_text()).length() > 20 or str($TxtGuestUser.get_text()).length() < 1: 
		Guest_username = null
		$ErrorMessageLength.visible = true
	else:
		var err = socket.connect_to_url(websocket_url)
		if err != OK:
			print("Unable to connect")
			set_process(false)
		else:
			pass
			#socket.send_text(Guest_username)
		get_parent().change_window(server_list)

func _on_btn_connect_account_pressed() -> void:
	pass # Replace with function body.
	

func _on_btn_create_account_pressed() -> void:
	get_parent().change_window(create_account)


func _process(_delta):
	# Call this in _process or _physics_process. Data transfer and state updates
	# will only happen when calling this function.
	socket.poll()

	# get_ready_state() tells you what state the socket is in.
	var state = socket.get_ready_state()

	# WebSocketPeer.STATE_OPEN means the socket is connected and ready
	# to send and receive data.
	if state == WebSocketPeer.STATE_OPEN:
		while socket.get_available_packet_count():
			print("Got data from server: ", socket.get_packet().get_string_from_utf8())

	# WebSocketPeer.STATE_CLOSING means the socket is closing.
	# It is important to keep polling for a clean close.
	elif state == WebSocketPeer.STATE_CLOSING:
		pass

	# WebSocketPeer.STATE_CLOSED means the connection has fully closed.
	# It is now safe to stop polling.
	elif state == WebSocketPeer.STATE_CLOSED:
		# The code will be -1 if the disconnection was not properly notified by the remote peer.
		var code = socket.get_close_code()
		print("WebSocket closed with code: %d. Clean: %s" % [code, code != -1])
		set_process(false) # Stop processing.


func _on_btn_password_pressed() -> void:
	get_parent().change_window(recuperar_contraseña)
