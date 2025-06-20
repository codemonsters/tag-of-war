extends Node

func host():
	var host = "locahost"
	var port = 9191

	# Start host
	print("Starting host on port %s" % port)
	
	var peer = ENetMultiplayerPeer.new()
	if peer.create_server(port) != OK:
		print("Failed to listen on port %s" % port)

	get_tree().get_multiplayer().multiplayer_peer = peer
	print("Listening on port %s" % port)
	
	# Wait for server to start
	await Async.condition(
		func():
			return peer.get_connection_status() != MultiplayerPeer.CONNECTION_CONNECTING
	)

	if peer.get_connection_status() != MultiplayerPeer.CONNECTION_CONNECTED:
		OS.alert("Failed to start server!")
		return
	
	print("Server started")
	get_tree().get_multiplayer().server_relay = true
	
	# TODO: Comenzar cuenta atrás de 3 segundos, después ocultar SalaEspera y mostrar mapa para que empiece directamente la partida
	
	# NOTE: This is not needed when using NetworkEvents
	# However, this script also runs in multiplayer-simple where NetworkEvents
	# are assumed to be absent, hence starting NetworkTime manually
	NetworkTime.start()
