from json import dumps
from flask import Flask, request, Response
from flask_cors import CORS
from os import environ
from flask_jwt_extended import (JWTManager)
import boto3

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = environ.get('JWT_SECRET_KEY')
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.errorhandler(404)
def not_found(url):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url,
    }
    resp = dumps(message)
    return Response(resp, status=404, mimetype='application/json')


@app.errorhandler(400)
def bad_request(missing):
    message = {
        'status': 400,
        'message': 'Not Found: ' + str(missing),
    }
    resp = dumps(message)
    return Response(resp, status=400, mimetype='application/json')


@app.errorhandler(401)
def bad_request(error):
    message = {
        'status': 401,
        'message': 'Unauthorized',
        'error': error
    }
    resp = dumps(message)
    return Response(resp, status=401, mimetype='application/json')


dynamodb = boto3.resource('dynamodb', region_name='eu-west-3')
