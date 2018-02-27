function Wallet() {
    var __self__ = this;
    this._id = null;
    this._name = null;
    this._keyEncrypted = null;
    this._dataEncrypted = null;
    this._fingerprintEnabled = false;

    this._passwords = [];

    this.addPassword = function (password) {
        this._passwords.push(password);
        __self__.sort();
    };

    this.removePassword = function (password) {
        $.each(this._passwords, function (key, pass) {
            if (pass.getTitle() === password.getTitle()) {
                __self__._passwords[key] = null;
            }
        });

        __self__.sort();
    };

    this.sort = function () {
        var pass = [];
        $.each(__self__._passwords, function (key, value) {
            if (value) {
                pass.push(value);
            }
        });
        __self__._passwords = pass.sort(function (a, b) { return a.getTitle().toLowerCase() > b.getTitle().toLowerCase() ? 1 : b.getTitle().toLowerCase() > a.getTitle().toLowerCase() ? -1 : 0; });
    };

    this.usedUsernames = function () {
        var names = [];
        var keys = {}
        $.each(this._passwords, function (key, value) {
            if (value && value.getUsername() != "" && (!(value.getUsername() in keys))) {
                keys[value.getUsername()] = names.push({ name: value.getUsername(), count: 1}) - 1;
            } else if (value && value.getUsername() != "") {
                names[keys[value.getUsername()]].count += 1;
            }
        });

        names.sort(function (a, b) {
            return b.count - a.count;
        });
        return names;
    };

    this.name = function () {
        return this._name;
    };

    this.passwords = function () {
        return this._passwords;
    };

    this.decrypt = function (pass) {
        var decryptedKey = $.parseJSON(CryptoJS.AES.decrypt(this._keyEncrypted, pass).toString(CryptoJS.enc.Utf8));
        if (this._dataEncrypted) {
            var passDecrypted = $.parseJSON(CryptoJS.AES.decrypt(this._dataEncrypted, decryptedKey.key, { 'iv': decryptedKey.iv }).toString(CryptoJS.enc.Utf8));
            $.each(passDecrypted, function (key, item) {
                __self__._passwords.push(Password.fromDict(item));
            });
        }
        __self__.sort();
    };

    this.encrypt = function (pass) {
        var salt = CryptoJS.lib.WordArray.random(128 / 8);
        var iv = CryptoJS.lib.WordArray.random(128 / 8);
        var iters = 100;
        var key = CryptoJS.PBKDF2(pass, salt, { keySize: 1024 / 32, iterations: iters }).toString();
        this._keyEncrypted = CryptoJS.AES.encrypt(JSON.stringify({ 'key': key, 'salt': salt, 'iv': iv }), pass).toString();
        var passList = [];
        $.each(this._passwords, function (key, pass) {
            passList.push(pass.dict());
        });
        this._dataEncrypted = CryptoJS.AES.encrypt(JSON.stringify(passList), key, { 'iv': iv }).toString();
    };

    this.save = function (db, callback) {
        if (this._id) {
            db.query('UPDATE wallet SET name=?, encryptedKey=?, data=?, fingerprint_enabled = ? WHERE id_wallet=?', [this._name, this._keyEncrypted, this._dataEncrypted, this._fingerprintEnabled, this._id], callback);
        } else {
            db.query('INSERT INTO wallet (name, encryptedKey, data, fingerprint_enabled) VALUES (?,?,?,?)', [this._name, this._keyEncrypted, this._dataEncrypted, this._fingerprintEnabled], callback);
        }
    };
}

Wallet.load = function (id, name, keyEncrypted, dataEncrypted) {
    var w = new Wallet();
    w._id = id;
    w._name = name;
    w._keyEncrypted = keyEncrypted;
    w._dataEncrypted = dataEncrypted;
    return w;
};

Wallet.delete = function (db, id, callback) {
    db.query(
        'DELETE FROM wallet WHERE id_wallet = ?',
        [parseInt(id)],
        callback
    );
};