extends Node2D

var server_list = preload("res://screens/menu/server_list/server_list.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")
var connecting_as = "none"

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
	if str($TxtGuestUser.get_text()).length() > 8 or str($TxtGuestUser.get_text()).length() < 3: 
		Guest_username = null
		$ErrorMessageLength.visible = true
	else:
		connecting_as = "guest"
		Globals.username = Guest_username
		var login_dict = {"cmd":"login", "data": {"username": Guest_username}}
		#get_parent().change_window(server_list)
		connect_to_server.emit()
		await get_tree().create_timer(1).timeout
		send_to_server.emit(JSON.stringify(login_dict))


func _on_btn_connect_account_pressed() -> void:
	var account_username = str($TxtAccountUser.get_text())
	var account_password = str($TxtPassword.get_text())
	connecting_as = "account"
	Globals.username = account_username
	var login_dict = {"cmd":"login", "data": {"username": account_username, "password": account_password}}
	connect_to_server.emit()
	await get_tree().create_timer(1).timeout
	send_to_server.emit(JSON.stringify(login_dict))


func _on_btn_create_account_pressed() -> void:
	get_parent().open_window(get_parent().create_account)


func _on_btn_password_pressed() -> void:
	get_parent().open_window(get_parent().recuperar_contraseña)


func on_server_message_received(dict: Dictionary):
	if dict["cmd"] == "login":
		if dict["success"]:
			print("logged in successfully")
			connecting_as = "none"
			get_parent().change_window(server_list)
		elif connecting_as == "guest":
			Globals.username = null
			$ErrorMessageUsed.visible = true
			$ErrorMessageUsed.text = "Error: Invalid Username \n" + dict["data"]["details"]
		elif connecting_as == "account":
			Globals.username = null
			$ErrorMessageUserAccount.visible = true
			$ErrorMessagePasswordAccount.visible = true
