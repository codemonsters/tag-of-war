extends Node2D

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	var button = $Button
	button.pressed.connect(self._button_pressed)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _button_pressed():
	get_tree().paused = false
	get_parent()._on_modal_window_closed()
	
