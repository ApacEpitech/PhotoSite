import decimal
import json

import DecimalEncoder
from app import app, dynamodb
from bson.json_util import dumps
from flask import request, Response
from boto3.dynamodb.conditions import Key

table = dynamodb.Table('Photos')


@app.route('/categories', methods=['POST'])
def add_category():
    _json = request.json
    _title = _json['title']
    # validate the received values
    if _title:
        # save details
        item = {
            'CategoryID': decimal.Decimal(max_id() + 1),
            'title': _title
        }
        table.put_item(Item=item)
        return Response(json.dumps(item, cls=DecimalEncoder.DecimalEncoder), status=201, mimetype='application/json')
    else:
        return bad_request('Title')


@app.route('/categories', methods=['GET'])
def categories():
    all_categories = table.scan(
        ScanFilter={}
    )
    return Response(json.dumps(all_categories, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/categories/<_id>', methods=['GET'])
def category(_id):
    category_found = find_category(_id)
    return Response(json.dumps(category_found, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/categories', methods=['PUT'])
def update_category():
    _json = request.json
    _title = _json['title']
    _id = _json['CategoryID']
    # validate the received values
    if _id:
        # save edits
        table.update_item(
            Key={'CategoryID': decimal.Decimal(_id)},
            UpdateExpression="set title = :title",
            ExpressionAttributeValues={
                ':title': _title
            },
            ReturnValues="UPDATED_NEW"
        )
        return category(_id)
    else:
        return bad_request()


@app.route('/categories/<_id>', methods=['DELETE'])
def delete_category(_id):
    table.delete_item(
        Key={'CategoryID': decimal.Decimal(_id)},
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


@app.errorhandler(400)
def bad_request(missing):
    message = {
        'status': 404,
        'message': 'Not Found: ' + missing,
    }
    resp = dumps(message)
    return Response(resp, status=400, mimetype='application/json')


@app.errorhandler(401)
def bad_request():
    message = {
        'status': 401,
        'message': 'Bad request: ' + request.url,
    }
    resp = dumps(message)
    return Response(resp, status=401, mimetype='application/json')


def find_category(category_id):
    category_found = table.query(
        KeyConditionExpression=Key('CategoryID').eq(int(category_id))
    )
    return category_found


def max_id():
    _max = 0
    ids = table.scan(
        AttributesToGet=['CategoryID']
    )['Items']
    for _id in ids:
        if int(_id['CategoryID']) > _max:
            _max = int(_id['CategoryID'])
    return _max
