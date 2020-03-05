import decimal
import json

import DecimalEncoder
from app import app, dynamodb
from bson.json_util import dumps
from flask import request, Response
from boto3.dynamodb.conditions import Key

table = dynamodb.Table('Photos')


@app.route('/photos', methods=['POST'])
def add_photo():
    _json = request.json
    _category = _json['category']
    _destination = _json['destination']
    _description = _json['description']
    _binary = _json['binary']
    # validate the received values
    if _destination and _category and _binary:
        # save details
        item = {
            'PhotoID': decimal.Decimal(max_id() + 1),
            'category': _category,
            'destination': _destination,
            'description': _description,
            'binary': _binary.encode()
        }
        table.put_item(Item=item)
        return Response(json.dumps(item, cls=DecimalEncoder.DecimalEncoder), status=201, mimetype='application/json')
    else:
        return bad_request('Destination, binary or category')


@app.route('/photos', methods=['GET'])
def photos():
    _json = request.json
    _categories = _json['categories']
    _destination = _json['destinations']
    scan = {}

    if _categories and _destination:
        scan = {'Category': {
            'AttributeValueList': _categories,
            'ComparisonOperator': 'IN'},
            'Destination': {
                'AttributeValueList': _destination,
                'ComparisonOperator': 'IN'}
        }
    elif _destination:
        scan = {'Destination': {
            'AttributeValueList': _destination,
            'ComparisonOperator': 'IN'}}
    elif _categories:
        scan = {'Category': {
            'AttributeValueList': _categories,
            'ComparisonOperator': 'IN'}
        }
    else:
        bad_request('Categories or Destinations')

    all_photos = table.scan(
        ScanFilter=scan
    )
    return Response(json.dumps(all_photos, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos/<_id>', methods=['GET'])
def photo(_id):
    photo_found = find_photo(_id)
    return Response(json.dumps(photo_found, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos', methods=['PUT'])
def update_photo():
    _json = request.json
    _category = _json['category']
    _destination = _json['destination']
    _description = _json['description']
    _id = _json['PhotoID']
    # validate the received values
    if _id:
        # save edits
        table.update_item(
            Key={'PhotoID': decimal.Decimal(_id)},
            UpdateExpression="set destination = :dest, description=:desc, category=:categ",
            ExpressionAttributeValues={
                ':dest': decimal.Decimal(_destination),
                ':desc': _description,
                ':categ': decimal.Decimal(_category)
            },
            ReturnValues="UPDATED_NEW"
        )
        return photo(_id)
    else:
        return bad_request()


@app.route('/photos/<_id>', methods=['DELETE'])
def delete_photo(_id):
    table.delete_item(
        Key={'PhotoID': decimal.Decimal(_id)},
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


def find_photo(photo_id):
    photo_found = table.query(
        KeyConditionExpression=Key('PhotoID').eq(int(photo_id))
    )
    return photo_found


def max_id():
    _max = 0
    ids = table.scan(
        AttributesToGet=['PhotoID']
    )['Items']
    for _id in ids:
        if int(_id['PhotoID']) > _max:
            _max = int(_id['PhotoID'])
    return _max
