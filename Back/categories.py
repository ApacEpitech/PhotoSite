from app import app, mongo
from bson.json_util import dumps
from bson.objectid import ObjectId
from flask import request, Response


@app.route('/categories', methods=['POST'])
def add_category():
    _json = request.json
    _title = _json['title']
    # validate the received values
    if _title:
        # save details
        category_id = mongo.db.category.insert({'title': _title,
                                          'content': '',
                                          'done': False})
        inserted_category = dumps(find_category(category_id))
        return Response(inserted_category, status=201, mimetype='application/json')
    else:
        return not_found()


@app.route('/categories', methods=['GET'])
def categories():
    _json = request.json
    _title = _json['title']
    all_categories = mongo.db.category.find()
    resp = dumps(all_categories)
    return resp


@app.route('/categories/<_id>', methods=['GET'])
def category(_id):
    category_found = find_category(_id)
    resp = dumps(category_found)
    return Response(resp, status=200, mimetype='application/json')


@app.route('/categories/users/<user_id>', methods=['GET'])
def categories_for_user(user_id):
    categories_found = mongo.db.category.find({'user_id': user_id})
    resp = dumps(categories_found)
    return Response(resp, status=200, mimetype='application/json')


@app.route('/categories', methods=['PUT'])
def update_category():
    _json = request.json
    _id = _json['_id']
    _title = _json['title']
    _content = _json['content']
    _user = _json['user_id']
    _done = _json['done']
    # validate the received values
    if _title and _id:
        # save edits
        mongo.db.category.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                  {'$set': {'title': _title,
                                            'content': _content,
                                            'done': _done,
                                            'user_id': _user
                                            }
                                   })
        updated_category = dumps(find_category(_id))
        return Response(updated_category, status=200, mimetype='application/json')
    else:
        return bad_request()


@app.route('/categories/<id>', methods=['DELETE'])
def delete_category(id):
    mongo.db.category.delete_one({'_id': ObjectId(id)})
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


@app.errorhandler(401)
def bad_request():
    message = {
        'status': 401,
        'message': 'Bad request: ' + request.url,
    }
    resp = dumps(message)
    return Response(resp, status=401, mimetype='application/json')


def find_category(category_id):
    category_found = mongo.db.category.find_one({'_id': ObjectId(category_id)})
    return category_found
