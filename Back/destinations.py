import decimal
import json

import DecimalEncoder
from app import *
from flask import request, Response
from boto3.dynamodb.conditions import Key
from flask_jwt_extended import jwt_required

table = dynamodb.Table('Destinations')
tablePhoto = dynamodb.Table('Photos')


@app.route('/destinations', methods=['POST'])
@jwt_required
def add_destination():
    _json = request.json
    _name = _json.get('name')
    # validate the received values
    if _name:
        # save details
        item = {
            'DestinationID': decimal.Decimal(max_id() + 1),
            'name': _name
        }
        table.put_item(Item=item)
        return Response(json.dumps(item, cls=DecimalEncoder.DecimalEncoder), status=201, mimetype='application/json')
    else:
        return bad_request('Name')


@app.route('/destinations', methods=['GET'])
def destinations():
    all_destinations = table.scan(
        ScanFilter={}
    )['Items']
    return Response(json.dumps(all_destinations, cls=DecimalEncoder.DecimalEncoder), status=200,
                    mimetype='application/json')


@app.route('/destinations/<_id>', methods=['GET'])
def destination(_id):
    destination_found = find_destination(_id)
    return Response(json.dumps(destination_found, cls=DecimalEncoder.DecimalEncoder), status=200,
                    mimetype='application/json')


@app.route('/destinations', methods=['PUT'])
@jwt_required
def update_destination():
    _json = request.json
    _name = _json.get('name')
    _id = _json.get('DestinationID')
    # validate the received values
    if _id and _name:
        # save edits
        table.update_item(
            Key={'DestinationID': decimal.Decimal(_id)},
            UpdateExpression="set name = :name",
            ExpressionAttributeValues={
                ':name': _name
            },
            ReturnValues="UPDATED_NEW"
        )
        return destination(_id)
    else:
        return bad_request('DestinationID or name')


@app.route('/destinations/<_id>', methods=['DELETE'])
@jwt_required
def delete_destinations(_id):
    photos = tablePhoto.scan(ScanFilter={'destination': {'AttributeValueList': [int(_id)],
                                                         'ComparisonOperator': 'EQ'}})['Items']
    if len(photos) == 0:
        table.delete_item(
            Key={'DestinationID': decimal.Decimal(_id)},
        )
        resp = ''
        return Response(resp, status=200, mimetype='application/json')
    else:
        resp = 'Photos are linked to this destination'
        return Response(resp, status=401, mimetype='application/json')


def find_destination(destination_id):
    destination_found = table.query(
        KeyConditionExpression=Key('DestinationID').eq(int(destination_id))
    )
    return destination_found


def max_id():
    _max = 0
    ids = table.scan(
        AttributesToGet=['DestinationID']
    )['Items']
    for _id in ids:
        if int(_id['DestinationID']) > _max:
            _max = int(_id['DestinationID'])
    return _max
