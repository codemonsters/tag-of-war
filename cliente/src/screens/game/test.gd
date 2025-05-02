extends Area2D

func _ready() -> void:
	print(get_overlapping_areas())
	print(get_overlapping_areas())


func _on_body_entered(body: Node2D) -> void:
	print(body)
