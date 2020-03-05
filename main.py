import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', region_name='eu-west-3')

table = dynamodb.Table('Photos')

response = table.query(
    KeyConditionExpression=Key('PhotoID').eq(1)
)

for i in response['Items']:
    print(i['Blob'])
