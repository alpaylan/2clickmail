from flask import Flask, request, jsonify, make_response, session
from pymongo import MongoClient
from bson import ObjectId
import base64
import os
from flask_cors import CORS, cross_origin
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import json
from Types import *
from dotenv import load_dotenv

load_dotenv()

from utils import *

app = Flask(__name__)
CORS(app, origins=os.getenv('PUBLIC_URL'), supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY')
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

# # Set up logging
# handler = RotatingFileHandler('twoclickmail.log', maxBytes=10000, backupCount=1)
# handler.setLevel(logging.INFO)
# app.logger.addHandler(handler)
# app.logger.setLevel(logging.INFO)

# Connect to the MongoDB server
client = MongoClient(os.getenv('MONGO_URL'))

# Create a new database called 'twoclickmail'
db = client['twoclickmail']

# Create a new collection called 'websites' within the 'twoclickmail' database
users_collection = db['users']
anonmails_collection = db['anonmails']
usermails_collection = db['usermails']


@app.route('/generate', methods=['POST'])
@cross_origin()
def generate_email():
    params = json.loads(request.form.get('params'))
    email = Email(params.get('to'), params.get('cc', []), params.get('bcc', []), params.get('subject'), params.get('body'))
    id = base64.urlsafe_b64encode(os.urandom(6)).decode('utf-8')
    print(f"Curr user: {current_user.is_authenticated}")
    if not current_user.is_authenticated:
        anonmails_collection.insert_one({
            '_id': id,
            'data': json_parse(email.__dict__),
        })
    else:
        usermails_collection.insert_one({
            '_id': id,
            'data': json_parse(email.__dict__),
            'user_id': current_user.id,
            'access': params.get('access', 'public'),
            'name': params.get('name')
        })

    # Return the id as JSON data
    response = make_response(jsonify({'id': id}), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route('/email', methods=['GET'])
@cross_origin()
def display_email():
    params = request.args
    request_type = params.get('type')
    value = params.get('value')
    mail = None

    if request_type == 'id':
        mail = anonmails_collection.find_one({'_id': value})
        if not mail:
            mail = usermails_collection.find_one({'_id': value, 'access': 'public'})
    elif request_type == 'name':
        if not mail:
            mail = usermails_collection.find_one({'name': value, 'access': 'public'})

    if mail:
        print(mail)
        if 'user_id' in mail:
            mail['user_id'] = str(mail['user_id'])
            
        response = make_response(mail, 200)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    else:
        return {'error': 'Website not found'}, 404

@app.route('/profile', methods=['GET'])
@cross_origin()
@login_required
def profile():
    print('hey')
    user = users_collection.find_one({'_id': current_user.id})
    print(list(users_collection.find({})))
    usermails = usermails_collection.find({"user_id": current_user.id})
    profileData = {
        'user': {
            'id': session['user_id'],
            'email': user['email'],
            'name': user.get('name'),
        },
        'emails': [{**mail, 'user_id': str(mail['user_id'])} for mail in usermails]
    }

    response = make_response(profileData, 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route('/my-emails')
@login_required
@cross_origin()
def profile_view_mail(id):
    usermail = usermails_collection.find_one({'_id': id, 'user_id': current_user.id})

    if usermail:
        return jsonify({'usermail': usermail['email']}), 200
    
    return jsonify({'error': 'not found'}), 404


@app.route('/action')
@login_required
@cross_origin()
def profile_update_mail(id, action):
    usermail = usermails_collection.find_one({'_id': id, 'user_id': current_user.id})

    if usermail:
        if action == 'delete':
            usermails_collection.delete_one({'_id': id, 'user_id': current_user.id})
        elif action == 'update':
            usermails_collection.update_one({'_id': id, 'user_id': current_user.id}, {'$setOnInsert': {'access': request.args.get('access'), 'name': request.args.get('name'), 'email': Email(request.args.get('recipients'), request.args.get('cc'), request.args.get('bcc'), request.args.get('subject'), request.args.get('content'))}})

        return jsonify({'message': 'success'}), 200
    
    return jsonify({'error': 'not found'}), 404


@login_manager.user_loader
def load_user(user_id):
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if user:
        return User(user['_id'], user['email'], user['password'])
    return None

    
@app.route('/register', methods=['POST'])
@cross_origin()
def register():
    # In a real application, get user data from the registration form
    email = request.form.get("email")
    password = request.form.get("password")

    # Check if the user already exists
    if users_collection.find_one({'email': email}):
        response = make_response(jsonify({"error": "User already exists"}), 400)
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    # Hash the password and create a new user
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    users_collection.insert_one({
        '_id': ObjectId(),
        'email': email,
        'password': hashed_password
    })

    response = make_response(jsonify({"message": "User registered successfully"}), 200)
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/login', methods=['POST', 'GET'])
@cross_origin()
def login():
    email = request.form.get("email")
    password = request.form.get("password")


    user = users_collection.find_one({'email': email})

    if user and bcrypt.check_password_hash(user['password'], password):
        login_user(User(user['_id'], user['email'], user['password']))
        print('Session:', session)
        session['user_id'] = str(user['_id'])
        response = make_response(jsonify({"message": "Logged in successfully"}), 200)
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/logout', methods=['POST'])
@cross_origin()
@login_required
def logout():
    logout_user()
    response = make_response(jsonify({"message": "Logged out successfully"}), 200)
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response




if __name__ == '__main__':
    app.run(debug=True)
