import decimal
import json
import uuid
from base64 import b64encode

from boto3.dynamodb.types import Binary

from app import app, dynamodb
from bson.json_util import dumps
from flask import request, Response
from boto3.dynamodb.conditions import Key

table = dynamodb.Table('Photos')


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return int(o)
        if isinstance(o, Binary):
            print(type(b64encode(o.value).decode('utf8')))
            return b64encode(o.value).decode('utf8')
        if isinstance(o, bytes):
            return o.decode()
        return super(DecimalEncoder, self).default(o)


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
        return Response(json.dumps(item, cls=DecimalEncoder), status=201, mimetype='application/json')
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
    return Response(json.dumps(all_photos, cls=DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos/<_id>', methods=['GET'])
def photo(_id):
    photo_found = find_photo(_id)
    return Response(json.dumps(photo_found, cls=DecimalEncoder), status=200, mimetype='application/json')


@app.route('/photos', methods=['PUT'])
def update_photo():
    _json = request.json
    _id = _json['_id']
    _content = _json['content']
    _user = _json['user_id']
    _done = _json['done']
    # validate the received values
    if _id:
        # save edits
        # mongo.db.photo.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
        #                           {'$set': {'title': _title,
        #                                     'content': _content,
        #                                     'done': _done,
        #                                     'user_id': _user
        #                                     }
        #                            })
        # updated_photo = dumps(find_photo(_id))
        # return Response(updated_photo, status=200, mimetype='application/json')
        return None
    else:
        return bad_request()


@app.route('/photos/<id>', methods=['DELETE'])
def delete_photo(id):
    # mongo.db.photo.delete_one({'_id': ObjectId(id)})
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
