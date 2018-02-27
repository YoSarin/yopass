function Password() {

    var __self__ = this;

    this._fields = {};
    this._defaultFields = Password.defaultFields

    this.addField = function (name) {
        __self__._fields[name] = '';
    };

    this.setValue = function (field, value) {
        __self__._fields[field] = value;
    };

    this.getTitle = function () {
        return __self__._fields['title'];
    };

    this.getUsername = function () {
        return __self__._fields['username'];
    };

    this.getPassword = function () {
        return __self__._fields['password'];
    };

    this.dict = function () {
        return __self__._fields;
    };

    $.each(__self__._defaultFields, function (key, item) {
        __self__.addField(item);
    });
}

Password.fromDict = function (dict) {
    p = new Password();
    $.each(Password.defaultFields, function (k, name) {
        if (name in dict) {
            p._fields[name] = dict[name];
        }
    });
    $.each(dict, function (name, value) {
        if (value.trim() !== "" && Password.defaultFields.indexOf(name) === -1) {
            p._fields[name] = value;
        }
    });
    return p;
};

Password.flags = {
    lowercase : 1,
    uppercase : 2,
    numbers   : 4,
    special   : 8,
    all: function () {
        return Password.flags.lowercase | Password.flags.uppercase | Password.flags.numbers | Password.flags.special;
    },
    noSpecial: function () {
        return Password.flags.lowercase | Password.flags.uppercase | Password.flags.numbers;
    },
    alnum: function () {
        return Password.flags.uppercase | Password.flags.numbers;
    }
};

Password.defaultFields = ['title', 'username', 'password'];

Password.generate = function (options) {
    var lowercase = 'abcdefghijklmnopqrstuvwxyz';
    var uppercase = lowercase.toUpperCase();
    var numbers = '0123456789';
    var special = '.-,!?<>\\/{}()_=+*%@&|#';

    var defaultOptions = { len: 15, flags: Password.flags.all(), safe: false };

    if (typeof options === 'undefined') {
        options = defaultOptions;
    } else {
        $.each(defaultOptions, function (key, value) {
            if (typeof options[key] === 'undefined') {
                options[key] = value;
            }
        });
    }

    var chars = '';
    chars += options.flags & Password.flags.lowercase ? lowercase : '';
    chars += options.flags & Password.flags.lowercase ? uppercase : '';
    chars += options.flags & Password.flags.numbers ? numbers : '';
    chars += options.flags & Password.flags.special ? special : '';
    if (options.safe) {
        chars = chars.replace(/0|O|o|I|l|1|\||S|5|s/g, '');
    }

    var password = '';
    for (var i = 0; i < options.len; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
};