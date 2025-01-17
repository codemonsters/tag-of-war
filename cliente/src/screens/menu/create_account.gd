extends Node2D
var lista_servidores = preload("res://screens/menu/lista_servidores.tscn")
var regex = RegEx.new()


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$TxtAccountName.grab_focus()
	$ErrorMessageNameLength.visible = false
	$ErrorMessagePasswordLength.visible = false
	$ErrorMessageMail.visible = false
	var pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
	var result = regex.compile(pattern)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


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
		get_parent().change_window(lista_servidores)
		
