extends Node2D

signal screen_connect_to_server()
signal screen_send_to_server(message: Variant)


func on_connect_to_server():
	screen_connect_to_server.emit()


func on_send_to_server(message: Variant):
	screen_send_to_server.emit(message)
