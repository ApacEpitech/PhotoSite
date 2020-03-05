import decimal
import json
from base64 import b64encode

from boto3.dynamodb.types import Binary


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return int(o)
        if isinstance(o, Binary):
            return b64encode(o.value).decode('utf8')
        if isinstance(o, bytes):
            return o.decode()
        return super(DecimalEncoder, self).default(o)