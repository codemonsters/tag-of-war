extends Node2D


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$ErrorMessageLength.visible = false
	$ErrorMessageUsed.visible = false


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_boton_invitado_pressed() -> void:
	$RectCoverGuest.visible = false
	$RectCoverAccount.visible = true
	$TxtGuestUser.grab_focus()

func _on_boton_cuenta_pressed() -> void:
	$RectCoverAccount.visible = false
	$RectCoverGuest.visible = true

func _on_btn_connect_guest_pressed() -> void:
	var Guest_username = str($TxtGuestUser.get_text())
	if str($TxtGuestUser.get_text()).length() > 20 or str($TxtGuestUser.get_text()).length() < 1: 
		Guest_username = null
		$ErrorMessageLength.visible = true
		
	
