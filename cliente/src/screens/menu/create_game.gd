extends Control


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	$CreateGame.visible = true
	$ChooseMap.visible = false


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass

func _on_button_next_pressed() -> void:
	$CreateGame.visible = false
	$ChooseMap.visible = true
	


func _on_button_go_back_pressed() -> void:
	$CreateGame.visible = true
	$ChooseMap.visible = false
