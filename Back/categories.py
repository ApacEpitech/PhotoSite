import decimal
import json

import DecimalEncoder
from app import *
from bson.json_util import dumps
from flask import request, Response
from boto3.dynamodb.conditions import Key
from flask_jwt_extended import jwt_required, create_access_token

table = dynamodb.Table('Categories')


@app.route('/categories', methods=['POST'])
@jwt_required
def add_category():
    _json = request.json
    _title = _json.get('title')
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
@jwt_required
def update_category():
    _json = request.json
    _title = _json.get('title')
    _id = _json.get('CategoryID')
    # validate the received values
    if _id and _title:
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
        return bad_request('CategoryID or title')


@app.route('/categories/<_id>', methods=['DELETE'])
@jwt_required
def delete_category(_id):
    table.delete_item(
        Key={'CategoryID': decimal.Decimal(_id)},
    )
    resp = ''
    return Response(resp, status=200, mimetype='application/json')



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
