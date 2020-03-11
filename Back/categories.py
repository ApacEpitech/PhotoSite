import decimal
import json

import DecimalEncoder
from app import *
from flask import request, Response
from boto3.dynamodb.conditions import Key
from flask_jwt_extended import jwt_required

table = dynamodb.Table('Categories')


@app.route('/categories', methods=['POST'])
@jwt_required
def add_category():
    _json = request.json
    _title = _json.get('title')
    _parent = _json.get('parent')
    item = {}
    # validate the received values
    if _title:
        # save details
        item['CategoryID'] = decimal.Decimal(max_id() + 1)
        item['title'] = _title
        if _parent:
            item['parent'] = _parent
        table.put_item(Item=item)
        return Response(json.dumps(item, cls=DecimalEncoder.DecimalEncoder), status=201, mimetype='application/json')
    else:
        return bad_request('Title')


@app.route('/categories', methods=['GET'])
def categories():
    all_categories = table.scan(
        ScanFilter={}
    )['Items']
    categories_to_return = []
    main_cat = {}
    for cat in all_categories:
        if 'parent' in cat:
            if not int(cat.get('parent')) in main_cat:
                main_cat[int(cat.get('parent'))] = len(main_cat)
                categories_to_return.append({'CategoryID': cat.get('parent'), 'title': 'AAA', 'sub_categories': []})
            categories_to_return[main_cat[int(cat.get('parent'))]]['sub_categories'].append(
                {'CategoryID': cat['CategoryID'], 'title': cat.get('title')})
        else:
            if not int(cat['CategoryID']) in main_cat:
                main_cat[int(cat.get('CategoryID'))] = len(main_cat)
                categories_to_return.append({'CategoryID': cat['CategoryID'],
                                             'title': cat.get('title'),
                                             'sub_categories': []})
            else:
                categories_to_return[main_cat[int(cat.get('CategoryID'))]]['title'] = cat['title']
    return Response(json.dumps(categories_to_return, cls=DecimalEncoder.DecimalEncoder), status=200,
                    mimetype='application/json')


@app.route('/categories/<_id>', methods=['GET'])
def category(_id):
    return_var = {}
    category_found = find_category(_id)
    if category_found:
        category_found = category_found[0]
        return_var['title'] = category_found.get('title')
        return_var['sub_categories'] = []
        sub_categories_found = table.scan(
            ScanFilter={'parent': {'AttributeValueList': [int(_id)], 'ComparisonOperator': 'EQ'}}
        )['Items']
        for sub in sub_categories_found:
            return_var['sub_categories'].append({'CategoryID': sub['CategoryID'], 'title': sub.get('title')})
    return Response(json.dumps(return_var, cls=DecimalEncoder.DecimalEncoder), status=200,
                    mimetype='application/json')


@app.route('/categories', methods=['PUT'])
@jwt_required
def update_category():
    _json = request.json
    _title = _json.get('title')
    _id = _json.get('CategoryID')
    _parent = _json.get('parent')
    if _parent:
        update_expr = "set title = :title"
        expr_values = {':title': _title}
    else:
        update_expr = "set title = :title, parent = :parent"
        expr_values = {':title': _title, ':parent': _parent}
    # validate the received values
    if _id and _title:
        # save edits
        table.update_item(
            Key={'CategoryID': decimal.Decimal(_id)},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
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
    )['Items']
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
