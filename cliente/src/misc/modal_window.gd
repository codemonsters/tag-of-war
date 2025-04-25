extends Node2D
# Crea una ventana modal que pausa el juego mientras se muestra
#
# Caso de uso sencillo: show_modal_window("hola")
# Además, permite indicar la función que será ejecutada al cerrar la ventana:
# Se puede definir en línea: show_modal_window("hola",func(): print("hola"))
# O bien llamar a una función definida dentro del script
# (En este caso se ejecutaría una función llamada prueba()): show_modal_window("hola",prueba)


var _on_close: Callable

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	var button = $Button
	button.pressed.connect(self._button_pressed)
	_on_close.call()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _button_pressed():
	get_tree().paused = false
	get_parent().hide_modal_window()
