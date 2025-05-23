_processCreateAndJoinRoomRequest = require("./process_create_and_join_room_request.js").processCreateAndJoinRoomRequest;
_processGetRoomDetailsRequest = require("./process_get_room_details_request.js").processGetRoomDetailsRequest;
_processGetRoomNamesRequest = require("./process_get_room_names_request.js").processGetRoomNamesRequest;
_processJoinRoomRequest = require("./process_join_room_request.js").processJoinRoomRequest;
_processKickFromCurrentRoomRequest = require("./process_kick_from_current_room_request.js").processKickFromCurrentRoomRequest
_processLeaveCurrentRoomRequest = require("./process_leave_current_room_request.js").processLeaveCurrentRoomRequest;
_processLoginRequest = require("./process_login_request.js").processLoginRequest;
_processSendMessageToCurrentRoom = require("./process_send_message_to_current_room.js").processSendMessageToCurrentRoomRequest;
_processStartMatch = require("./process_start_match.js").processStartMatchRequest;

const {ProtocolException} = require("../exceptions.js");

function processRequest(msg, peer, server) {
    let json = null;
    try {
        json = JSON.parse(msg);
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new ProtocolException("Message not in JSON format");
        }
    }

    const cmd = typeof(json['cmd']) === 'string' ? json['cmd'] : '';
    switch(cmd) {
        case 'create_and_join_room':
            console.debug('Peer wants to create a room');
            _processCreateAndJoinRoomRequest(json, peer, server);
            break;
        case 'get_room_details':
            console.debug('Peer wants to get room details');
            _processGetRoomDetailsRequest(json, peer, server);
            break;
        case 'get_room_names':
            console.debug('Peer wants to get room names');
            _processGetRoomNamesRequest(json, peer, server);
            break;
        case 'join_room':
            console.debug('Peer wants to join a room');
            _processJoinRoomRequest(json, peer, server);
            break;
        case 'kick_from_current_room':
            console.debug('Peer wants to kick a player from the current room');
            _processKickFromCurrentRoomRequest(json, peer, server);
            break;
        case 'leave_current_room':
            console.debug('Peer wants to leave the current room');
            _processLeaveCurrentRoomRequest(json, peer, server);
            break;
        case 'login':
            console.debug('Peer wants to log in');
            _processLoginRequest(json, peer, server);
            break;
        case 'send_message_to_current_room':
            console.debug('Peer wants to send a message to the current room');
            _processSendMessageToCurrentRoom(json, peer, server);
            break;
        case 'start_match':
            console.debug('Peer wants to start a new match');
            _processStartMatch(json, peer, server);
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
            throw new ProtocolException(`Unknown command: ${cmd}`, cmd);
    }
    //const type = typeof (json['type']) === 'number' ? Math.floor(json['type']) : -1;
}

module.exports = { processRequest };
