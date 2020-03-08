from categories import *
from photos import *
from users import *
from destinations import *


@app.route('/')
def run():
    return ''


if __name__ == "__main__":
    app.run(host='0.0.0.0')
