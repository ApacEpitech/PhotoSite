from app import app, dynamodb
from bson.json_util import dumps
from flask import request, Response
from werkzeug.security import generate_password_hash, check_password_hash
from boto3.dynamodb.conditions import Key

table = dynamodb.Table('Users')


@app.route('/users', methods=['POST'])
def add_user():
    _json = request.json
    _email = _json.get('mail')
    _password = _json.get('password')
    user_found = table.query(
        KeyConditionExpression=Key('email').eq(_email)
    )
    if user_found:
        return unauthorized()
    # validate the received values
    if _email and _password:
        # do not save password as a plain text
        _hashed_password = generate_password_hash(_password)
        # save details
        item = {
            'email': _email,
            'password': _hashed_password
        }
        table.put_item(Item=item)
        return Response(dumps(item), status=201, mimetype='application/json')
    else:
        return not_found()


@app.route('/users', methods=['GET'])
def users():
    all_users = table.scan()['Items']
    resp = dumps(all_users)
    return resp


@app.route('/users/<email>', methods=['GET'])
def user(email):
    user_found = find_user(email)
    resp = dumps(user_found)
    return Response(resp, status=200, mimetype='application/json')


@app.route('/users/connect', methods=['POST'])
def user_connect():
    _json = request.json
    _email = _json.get('email')
    _password = _json.get('password')
    user_found = find_user(_email)
    if user_found and check_password_hash(user_found['password'], _password):
        resp = dumps(user_found)
        return Response(resp, status=200, mimetype='application/json')
    else:
        return unauthorized()


@app.route('/users', methods=['PUT'])
def update_user():
    _json = request.json
    _email = _json.get('email')
    _password = _json.get('pwd')
    # validate the received values
    if _email:
        if _password and _password != '':
            # do not save password as a plain text
            _hashed_password = generate_password_hash(_password)
            # save edits
            table.update_item(
                Key={'email': _email},
                UpdateExpression="set email = :email, password=:_hashed_password",
                ExpressionAttributeValues={
                    ':email': _email,
                    ':password': _hashed_password
                },
                ReturnValues="UPDATED_NEW"
            )
        updated_user = dumps(find_user(_email))
        return Response(dumps(updated_user), status=200, mimetype='application/json')
    else:
        return not_found()


@app.route('/users/<email>', methods=['DELETE'])
def delete_user(email):
    table.delete_item(
        Key={'email': email},
    )
    resp = ''
    return Response(resp, status=200, mimetype='application/json')


@app.errorhandler(404)
def not_found():
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url,
    }
    resp = dumps(message)
    return Response(resp, status=404, mimetype='application/json')


@app.errorhandler(403)
def unauthorized():
    message = {
        'status': 403,
        'message': 'Unauthorized: ' + request.url,
    }
    resp = dumps(message)

    return Response(resp, status=403, mimetype='application/json')


def find_user(email):
    user_found = table.query(
        KeyConditionExpression=Key('email').eq(email)
    )
    return user_found
