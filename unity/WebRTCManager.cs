using UnityEngine;
using Unity.WebRTC;
using NativeWebSocket;
using System.Text;
using System.Threading.Tasks;
using UnityEngine.UI;

[System.Serializable]
public class SocketMessage {
    public string type;
    public string room;
    public string viewer_id;
    // ...existing code: add additional fields as needed...
}

public class WebRTCManager : MonoBehaviour {
    private WebSocket webSocket;
    private RTCPeerConnection peerConnection;
    private MediaStream localStream;
    private string roomName = "unity-room";
    private bool isBroadcaster = false;

    [SerializeField]
    private Camera streamingCamera;

    [SerializeField]
    private RawImage remoteVideoImage;

    async void Start() {
        // Update the WebSocket URL if necessary (e.g., use "ws://localhost:5000" for local testing)
        webSocket = new WebSocket("ws://localhost:5000"); // Updated as needed

        webSocket.OnOpen += OnWebSocketOpen;
        webSocket.OnError += OnWebSocketError;
        webSocket.OnClose += OnWebSocketClose;
        webSocket.OnMessage += OnWebSocketMessage;

        await webSocket.Connect();
    }

    void Update() {
        // Ensure message queue dispatching for non-WebGL/Editor builds
        #if !UNITY_WEBGL || UNITY_EDITOR
        if (webSocket != null)
            webSocket.DispatchMessageQueue();
        #endif
    }

    private void OnWebSocketOpen() {
        Debug.Log("WebSocket connection open!");
        if (isBroadcaster)
            CreateRoom();
        else
            JoinRoom();
    }

    private void OnWebSocketError(string error) {
        Debug.Log("WebSocket error: " + error);
    }

    private void OnWebSocketClose(WebSocketCloseCode closeCode) {
        Debug.Log("WebSocket connection closed!");
    }

    private void OnWebSocketMessage(byte[] message) {
        string messageText = Encoding.UTF8.GetString(message);
        Debug.Log("Received message: " + messageText);
        SocketMessage json = JsonUtility.FromJson<SocketMessage>(messageText);

        switch (json.type) {
            case "room_created":
                HandleRoomCreated();
                break;
            case "viewer_joined":
                if (isBroadcaster)
                    CreateOffer(json.viewer_id);
                break;
            case "offer":
                HandleOffer(json);
                break;
            case "answer":
                HandleAnswer(json);
                break;
            case "ice_candidate":
                HandleIceCandidate(json);
                break;
            default:
                Debug.Log("Unhandled message type: " + json.type);
                break;
        }
    }

    private void SendMessage(object message) {
        string jsonString = JsonUtility.ToJson(message);
        if (webSocket.State == WebSocketState.Open)
            webSocket.SendText(jsonString);
    }

    private void CreateRoom() {
        var message = new {
            type = "create",
            room = roomName
        };
        SendMessage(message);
    }

    private void JoinRoom() {
        var message = new {
            type = "join",
            room = roomName
        };
        SendMessage(message);
    }

    private async void CreateOffer(string viewerId) {
        peerConnection = new RTCPeerConnection();
        if (isBroadcaster) {
            localStream = streamingCamera.CaptureStream(1280, 720);
            foreach (var track in localStream.GetTracks()) {
                peerConnection.AddTrack(track, localStream);
            }
        }

        // Create offer
        var offerOperation = peerConnection.CreateOffer();
        await WaitForSessionDescriptionOperation(offerOperation);
        RTCSessionDescription offer = offerOperation.Desc;

        // Set local description
        var setLocalDescOp = peerConnection.SetLocalDescription(ref offer);
        await WaitForSetSessionDescriptionOperation(setLocalDescOp);

        // Send offer message
        var message = new {
            type = "offer",
            room = roomName,
            offer = offer.sdp,
            viewer_id = viewerId
        };
        SendMessage(message);
    }

    private async Task WaitForSessionDescriptionOperation(RTCSessionDescriptionAsyncOperation operation) {
        while (!operation.IsDone) {
            await Task.Yield();
        }
    }

    private async Task WaitForSetSessionDescriptionOperation(RTCSetSessionDescriptionAsyncOperation operation) {
        while (!operation.IsDone) {
            await Task.Yield();
        }
    }

    private void HandleRoomCreated() {
        Debug.Log("Room was created successfully.");
    }

    private void HandleOffer(SocketMessage message) {
        Debug.Log("Handle offer received.");
        // ...existing code: process offer...
    }

    private void HandleAnswer(SocketMessage message) {
        Debug.Log("Handle answer received.");
        // ...existing code: process answer...
    }

    private void HandleIceCandidate(SocketMessage message) {
        Debug.Log("Handle ICE candidate received.");
        // ...existing code: process ICE candidate...
    }

    public void SetBroadcaster(bool shouldBroadcast) {
        isBroadcaster = shouldBroadcast;
    }

    public async void Connect() {
        if (webSocket.State != WebSocketState.Open) {
            await webSocket.Connect();
        }
    }

    private async void OnDestroy() {
        if (peerConnection != null) {
            peerConnection.Close();
            peerConnection = null;
        }
        if (localStream != null) {
            foreach (var track in localStream.GetTracks()) {
                track.Stop();
            }
            localStream = null;
        }
        if (webSocket != null) {
            await webSocket.Close();
            webSocket = null;
        }
    }
}
