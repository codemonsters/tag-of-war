extends Node2D


var server_list = preload("res://screens/menu/sala_espera_admin.tscn")
var regex = RegEx.new()

signal connect_to_server()
signal send_to_server(message: Variant)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$TxtAccountName.grab_focus()
	$ErrorMessageNameLength.visible = false
	$ErrorMessageNameInUse.visible = false
	$ErrorMessagePasswordLength.visible = false
	$ErrorMessageMail.visible = false
	var pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
	var result = regex.compile(pattern)
	get_parent().get_parent().server_message_recieved.connect(on_server_message_recieved)


func _on_btn_create_account_pressed() -> void:
	var Account_username = str($TxtAccountName.get_text())
	var Account_mail = str($TxtAccountMail.get_text())
	var Account_password = str($TxtAccountPassword.get_text())
	if str($TxtAccountName.get_text()).length() > 8 or str($TxtAccountName.get_text()).length() < 1: 
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
		connect_to_server.emit()
		await get_tree().create_timer(1).timeout
		send_to_server.emit(JSON.stringify(login_dict))
		get_parent().change_window(get_parent().lista_servidores)


func _on_btn_volver_pressed() -> void:
	get_parent().close_window()


func on_server_message_recieved(dict: Dictionary):
	if dict["cmd"] == "logged_in" and dict["success"]:
		print("logged in successfully")
