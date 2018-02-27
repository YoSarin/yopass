function Provider (dbName, tables) {

    var __self__ = this;

    this._dbName = dbName;
    this._tables = tables;
    this._readyList = [];
    this._ready = false;
    this._db = window.sqlitePlugin.openDatabase({ name: this._dbName, location: 1 });

    this.db = function () {
        return this._db;
    }

    this.query = function (q, params, success, error) {
        if (__self__._ready) {
            __self__._performQuery(q, params, success, error);
        } else {
            $(__self__).on('ready', function () {
                __self__._performQuery(q, params, success, error);
            });
        }
    }


    this._performQuery = function (q, params, succ, err) {
        var d = new Date();
        var start = d.getTime();
        var ident = Password.generate({flags: Password.flags.alnum(), len: 8});
        console.log('START', ident, q, params);
        __self__.db().transaction(function (tx) {
            tx.executeSql(
                q, params,
                function (db, result) {
                    var d = new Date();
                    var duration = d.getTime() - start;
                    console.log('OK', ident, "duration", duration, q, result);
                    if (succ) {
                        succ(db, result);
                    }
                },
                function (e) {
                    var d = new Date();
                    var duration = d.getTime() - start;
                    console.log('ERROR', ident, "duration", duration, q, e);
                    if (err) {
                        err(e);
                    }
                }
            );
        });
    }

    this.db().transaction(function (tx) {
        $.each(tables, function (key, item) {
            $(__self__).on('table_' + key + '_ready', function () {
                __self__._readyList.push(key);
                if (__self__._readyList.length == Object.keys(__self__._tables).length) {
                    __self__._ready = true;
                    $(__self__).trigger('ready');
                }
            });
            var columns = [];
            columns.push('id_' + key + ' integer primary key');
            $.each(item, function (column_name, definition) {
                columns.push(column_name + ' ' + definition);
            });
            var query = 'CREATE TABLE IF NOT EXISTS ' + key + ' (' + columns.join(', ') + ')';
            console.log('Creating table ' + key + ': ' + query);
            tx.executeSql(
                query,
                [],
                function (d, result) {
                    console.log('CREATE of ' + key + ' ok');
                    $(__self__).trigger('table_' + key + '_ready');
                }
            );
        });
    });

}