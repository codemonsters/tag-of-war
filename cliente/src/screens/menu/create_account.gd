extends Node2D
var identification = preload("res://screens/menu/identification.tscn")

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass


func _on_btn_create_account_pressed() -> void:
	get_parent().change_screen(identification)
