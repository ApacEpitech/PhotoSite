from flask import Flask
from pymongo import errors
from flask_cors import CORS
import boto3

app = Flask(__name__)
app.secret_key = ""
app.config["MONGO_URI"] = "mongodb://localhost:27017/todolist"
CORS(app, resources={r"/*": {"origins": "*"}})

try:
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-3')
except errors.ServerSelectionTimeoutError as err:
    # do whatever you need
    print(err)