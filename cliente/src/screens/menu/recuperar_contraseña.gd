extends ColorRect
var regex = RegEx.new()


func _ready() -> void:
	$TxtEnviarCorreo.grab_focus()
	$ErrorMessageMail.visible = false
	$LblCorreoEnviado.visible = false
	var pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
	var result = regex.compile(pattern)



func _process(delta: float) -> void:
	pass



func _on_btn_correo_enviado_pressed() -> void:
	var account_mail = str($TxtEnviarCorreo.get_text())
	if regex.search($TxtEnviarCorreo.get_text()) == null:
		account_mail = null
		$ErrorMessageMail.visible = true
	else:
		$ErrorMessageMail.visible = false
		$LblCorreoEnviado.visible = true
		



func _on_button_pressed() -> void:
	get_parent().change_window(get_parent().identification)
