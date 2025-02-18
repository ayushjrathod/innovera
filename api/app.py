import ipaddress
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import socket
import netifaces
import ssl
import os
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from gevent import monkey
monkey.patch_all()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ptrick'

socketio = SocketIO(app,
                   cors_allowed_origins="*",
                   ping_timeout=60,
                   ping_interval=25,
                   max_http_buffer_size=1e8,
                   async_mode='gevent',
                   logger=True,
                   engineio_logger=True)

rooms = {}

def generate_self_signed_cert():
    # Generate key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    # Generate certificate
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"Development"),
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
    ])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        datetime.utcnow() + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([
            x509.DNSName("localhost"),
            x509.DNSName("*.localhost"),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
        ]),
        critical=False,
    ).sign(private_key, hashes.SHA256())

    # Write certificate and private key to files
    with open("cert.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    with open("key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))

    return cert, private_key

def get_ip_addresses():
    ip_addresses = []
    interfaces = netifaces.interfaces()
    for interface in interfaces:
        addrs = netifaces.ifaddresses(interface)
        if netifaces.AF_INET in addrs:
            for addr in addrs[netifaces.AF_INET]:
                ip = addr['addr']
                if not ip.startswith('127.'):
                    ip_addresses.append(ip)
    return ip_addresses

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/broadcast')
def broadcast():
    return render_template('broadcast.html')

@app.route('/view')
def view():
    return render_template('view.html')

@app.route('/check')
def check():
    return "Server is running!"

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Remove disconnected broadcaster from rooms
    for room_id, room_info in list(rooms.items()):
        if room_info.get('broadcaster') == request.sid:
            del rooms[room_id]
            emit('broadcaster_left', {'room': room_id}, broadcast=True)

@socketio.on('create')
def on_create(data):
    """Handler for room creation by broadcaster"""
    room = data.get('room')
    if room:
        rooms[room] = {'broadcaster': request.sid, 'viewers': set()}
        join_room(room)
        print(f"Room {room} created by {request.sid}")
        emit('room_created', {'room': room})

@socketio.on('join')
def on_join(data):
    """Handler for viewer joining a room"""
    room = data.get('room')
    if room not in rooms:
        emit('room_error', {'message': 'Room does not exist'})
        return
    
    join_room(room)
    rooms[room]['viewers'].add(request.sid)
    print(f"Viewer {request.sid} joined room {room}")
    
    # Notify broadcaster about new viewer
    emit('viewer_joined', 
         {'viewer_id': request.sid},
         room=rooms[room]['broadcaster'])

@socketio.on('offer')
def on_offer(data):
    """Handler for broadcaster sending offer to specific viewer"""
    room = data.get('room')
    offer = data.get('offer')
    viewer_id = data.get('viewer_id')
    
    if room in rooms and offer:
        print(f"Sending offer to viewer {viewer_id} in room {room}")
        emit('offer', 
             {'offer': offer},
             room=viewer_id)

@socketio.on('answer')
def on_answer(data):
    """Handler for viewer sending answer to broadcaster"""
    room = data.get('room')
    answer = data.get('answer')
    
    if room in rooms and answer:
        print(f"Sending answer to broadcaster in room {room}")
        emit('answer', 
             {'answer': answer, 'viewer_id': request.sid},
             room=rooms[room]['broadcaster'])

@socketio.on('ice_candidate')
def on_ice_candidate(data):
    """Handler for ICE candidates"""
    room = data.get('room')
    candidate = data.get('candidate')
    
    if room in rooms and candidate:
        if request.sid == rooms[room]['broadcaster']:
            viewer_id = data.get('viewer_id')
            emit('ice_candidate', 
                 {'candidate': candidate},
                 room=viewer_id)
        else:
            emit('ice_candidate',
                 {'candidate': candidate, 'viewer_id': request.sid},
                 room=rooms[room]['broadcaster'])

@socketio.on_error_default
def default_error_handler(e):
    print(f"SocketIO Error: {str(e)}")
    return "Error", 500

if __name__ == '__main__':
    
    if not (os.path.exists("cert.pem") and os.path.exists("key.pem")):
        print("Generating new SSL certificate...")
        generate_self_signed_cert()

    # Create SSL context with modern configuration
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain('cert.pem', 'key.pem')
    
    # Set secure SSL options
    ssl_context.options |= ssl.OP_NO_SSLv2
    ssl_context.options |= ssl.OP_NO_SSLv3
    ssl_context.options |= ssl.OP_NO_TLSv1
    ssl_context.options |= ssl.OP_NO_TLSv1_1
    
    # Set cipher configuration
    ssl_context.set_ciphers('ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256')
    
    # Enable HTTPS client verification
    ssl_context.verify_mode = ssl.CERT_OPTIONAL
    ip_addresses = get_ip_addresses()


    print("\nServer is running on the following addresses:")
    print("Local (same machine): https://localhost:5000")
    for ip in ip_addresses:
        print(f"LAN (other devices): https://{ip}:5000")

    print("\nTroubleshooting steps if devices can't connect:")
    print("1. Make sure all devices are on the same network")
    print("2. Try different IP addresses from above if one doesn't work")
    print("3. Accept the security certificate warning on each device")
    print("4. Check if your firewall is blocking port 5000")
    print("5. Try accessing /check route to verify server connection")

    try:
        from gevent.pywsgi import WSGIServer
        from geventwebsocket.handler import WebSocketHandler
        
        http_server = WSGIServer(
            ('0.0.0.0', 5000),
            app,
            handler_class=WebSocketHandler,
            ssl_context=ssl_context
        )
        
        print("Starting secure server...")
        http_server.serve_forever()
        
    except Exception as e:
        print(f"\nError starting server: {str(e)}")

