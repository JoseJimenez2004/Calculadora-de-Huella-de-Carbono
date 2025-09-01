from flask import Flask, request, jsonify, render_template
import psycopg2
from flask_cors import CORS
import bcrypt

app = Flask(__name__)
CORS(app)

# Conexión a PostgreSQL
try:
    conn = psycopg2.connect(
        host="localhost",
        database="ecocalculadora",
        user="postgres",
        password="bichojose2004",
        port=5432
    )
    cursor = conn.cursor()
    print("✅ Conexión a PostgreSQL exitosa")
except Exception as e:
    print("❌ Error de conexión a PostgreSQL:", e)


# Ruta raíz (HTML en navegador)
@app.route("/", methods=["GET"])
def index():
    return render_template(".html")


# Ruta de login (desde formulario o JSON)
@app.route('/login', methods=['POST'])
def login():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form  # <-- Para soportar formulario HTML también

    username = data['username']
    password = data['password'].encode('utf-8')

    cursor.execute("SELECT username, password FROM usuarios WHERE username = %s", (username,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"success": False, "message": "Usuario no encontrado"})

    stored_password = user[1].encode('utf-8')
    if bcrypt.checkpw(password, stored_password):
        return jsonify({"success": True, "message": f"Login exitoso. Bienvenido {username}"})
    else:
        return jsonify({"success": False, "message": "Contraseña incorrecta"})


# Ruta de registro (desde formulario o JSON)
@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form  # <-- Para soportar formulario HTML también

    username = data['username']
    email = data['email']
    password = data['password'].encode('utf-8')

    # Encriptar contraseña
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    try:
        cursor.execute(
            "INSERT INTO usuarios (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed.decode('utf-8'))
        )
        conn.commit()
        return jsonify({"success": True, "message": "Usuario registrado exitosamente"})
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"success": False, "message": "Usuario o email ya existe"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
