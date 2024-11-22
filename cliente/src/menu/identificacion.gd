extends Node2D


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_boton_invitado_pressed() -> void:
	$RectanguloTapaInvitado.visible = false
	$RectanguloTapaCuenta.visible = true
	$TxtUsuarioInvitado.grab_focus()

func _on_boton_cuenta_pressed() -> void:
	$RectanguloTapaCuenta.visible = false
	$RectanguloTapaInvitado.visible = true
