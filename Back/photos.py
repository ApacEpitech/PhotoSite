import decimal
import json

import DecimalEncoder
from app import *
from flask import request, Response
from boto3.dynamodb.conditions import Key
from boto3 import client
from flask_jwt_extended import jwt_required
from PIL import Image
import io
import os
import base64

table = dynamodb.Table('Photos')
bucket = "apacphotosite"
cli = client('s3', region_name='eu-west-3')


def decode_img(msg):
    msg = msg.split(",", 1)[1]
    msg = base64.b64decode(msg)
    buf = io.BytesIO(msg)
    img = Image.open(buf)
    return img


@app.route('/photos', methods=['POST'])
@jwt_required
def add_photo():
    _json = request.json
    _category = _json.get('category')
    _destination = _json.get('destination')
    _description = _json.get('description')
    _title = _json.get('title')
    _binary = _json.get('binary')
    # validate the received values
    # save details
    image = decode_img(_binary)
    filename, file_extension = os.path.splitext(_title)
    _hashed_title = str(hash(filename)) + file_extension
    image.save(_hashed_title)
    cli.upload_file(_hashed_title, bucket, _hashed_title)
    os.remove(_hashed_title)
    item = {
        'PhotoID': decimal.Decimal(max_id() + 1),
        'category': _category,
        'destination': _destination,
        'description': _description,
        'url': "http://s3-eu-west-3.amazonaws.com/apacphotosite/" + _hashed_title
    }
    table.put_item(Item=item)
    return Response(json.dumps(item, cls=DecimalEncoder.DecimalEncoder), status=201, mimetype='application/json')


@app.route('/photos', methods=['GET'])
def get_all_photos():
    all_photos = table.scan(
        ScanFilter={}
    )['Items']
    return Response(json.dumps(all_photos, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos/filter', methods=['POST'])
def photos():
    _json = request.json
    scan = {}
    if _json:
        _categories = _json.get('categories')
        _destination = _json.get('destinations')
        _sub_categories = _json.get('sub_categories')
        if _categories:
            scan['category'] = {'AttributeValueList': _categories, 'ComparisonOperator': 'IN'}
        if _destination:
            scan['destination'] = {'AttributeValueList': _destination, 'ComparisonOperator': 'IN'}
        if _sub_categories:
            scan['sub_category'] = {'AttributeValueList': _sub_categories, 'ComparisonOperator': 'IN'}
    all_photos = table.scan(
        ScanFilter=scan
    )['Items']
    return Response(json.dumps(all_photos, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos/<_id>', methods=['GET'])
def photo(_id):
    photo_found = find_photo(_id)
    return Response(json.dumps(photo_found, cls=DecimalEncoder.DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos', methods=['PUT'])
@jwt_required
def update_photo():
    _json = request.json
    _category = _json.get('category')
    _sub_category = _json.get('sub_category')
    _destination = _json.get('destination')
    _description = _json.get('description')
    _id = _json.get('PhotoID')
    # validate the received values
    if _id and _category and _destination and _description:
        # save edits
        table.update_item(
            Key={'PhotoID': decimal.Decimal(_id)},
            UpdateExpression="set destination = :dest, description=:desc, category=:categ, sub_category = :sub_cat",
            ExpressionAttributeValues={
                ':dest': decimal.Decimal(_destination),
                ':desc': _description,
                'sub_cat': decimal.Decimal(_sub_category),
                ':categ': decimal.Decimal(_category)
            },
            ReturnValues="UPDATED_NEW"
        )
        return photo(_id)
    else:
        return bad_request("PhotoID, category, destination or description")


@app.route('/photos/<_id>', methods=['DELETE'])
@jwt_required
def delete_photo(_id):
    table.delete_item(
        Key={'PhotoID': decimal.Decimal(_id)},
    )
    resp = ''
    return Response(resp, status=200, mimetype='application/json')


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
