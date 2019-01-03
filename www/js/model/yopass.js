console.log("yopass.js");

function YoPass() {
    var __self__ = this;
    this._provider = new Provider(
        'YoPass', {
            'wallet': { 'name': 'text', 'encryptedKey': 'text', 'data': 'text' },
        },
        [
            {
                "version": 0.1,
                "commands": [
                    "ALTER TABLE wallet ADD COLUMN fingerprint_enabled boolean DEFAULT false;",
                ],
            },
            {
                "version": 0.2,
                "commands": [
                    "SELECT * FROM _metadata;",
                ],
            },
        ]
    );

    this.query = function (q, params, success, error) {
        __self__._provider.query(q, params, success, error);
    };
}

YoPass._db = null;

YoPass.DB = function () {
    if (!YoPass._db) {
        console.log("newly creating DB");
        YoPass._db = new YoPass();
    }
    return YoPass._db;
};
