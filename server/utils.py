from bson.json_util import dumps, loads

def json_parse(obj):
    return loads(dumps(obj))