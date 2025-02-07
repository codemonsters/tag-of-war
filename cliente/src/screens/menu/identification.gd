extends Node2D


var server_list = preload("res://screens/menu/sala_espera.tscn")
var create_account = preload("res://screens/menu/create_account.tscn")
var recuperar_contraseña = preload("res://screens/menu/recuperar_contraseña.tscn")

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ErrorMessageLength.visible = false
	$ErrorMessageUsed.visible = false
	$ErrorMessageUserAccount.visible = false
	$ErrorMessagePasswordAccount.visible = false


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
		get_parent().get_parent().connect_to_server()
		await get_tree().create_timer(1).timeout
		get_parent().get_parent().send_to_server(JSON.stringify(login_dict))
		get_parent().change_window(server_list)



func _on_btn_connect_account_pressed() -> void:
	pass # Replace with function body.


func _on_btn_create_account_pressed() -> void:
	get_parent().open_window(get_parent().create_account)


func _on_btn_password_pressed() -> void:
	get_parent().open_window(get_parent().recuperar_contraseña)
