extends Node2D

var server_list = preload("res://screens/menu/sala_espera_admin.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")

signal connect_to_server()
signal send_to_server(message: Variant)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ErrorMessageLength.visible = false
	$ErrorMessageUsed.visible = false
	$ErrorMessageUserAccount.visible = false
	$ErrorMessagePasswordAccount.visible = false

	get_parent().get_parent().server_message_received.connect(on_server_message_received)


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
	if str($TxtGuestUser.get_text()).length() > 8 or str($TxtGuestUser.get_text()).length() < 1: 
		Guest_username = null
		$ErrorMessageLength.visible = true
	else:
		var login_dict = {"cmd":"login", "data": {"username": Guest_username}}
		connect_to_server.emit()
		await get_tree().create_timer(1).timeout
		send_to_server.emit(JSON.stringify(login_dict))
		get_parent().change_window(server_list)


func _on_btn_connect_account_pressed() -> void:
	pass # Replace with function body.


func _on_btn_create_account_pressed() -> void:
	get_parent().open_window(get_parent().create_account)


func _on_btn_password_pressed() -> void:
	get_parent().open_window(get_parent().recuperar_contraseña)


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "logged_in" and dict["success"]:
		print("logged in successfully")
