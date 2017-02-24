function Provider(dbName, tables) {

    var __self__ = this;

    __self__._dbName = dbName;
    __self__._tables = tables;
    __self__._readyList = [];
    __self__._ready = false;
    __self__._db = window.sqlitePlugin.openDatabase({ name: __self__._dbName, location: 2 });
    __self__._onReady = $.Callbacks();

    __self__.db = function () {
        return this._db;
    };

    __self__.query = function (q, params, success, error) {
        if (__self__._ready) {
            __self__._performQuery(q, params, success, error);
        } else {

            __self__._onReady.add(function () {
                console.log('onReady callback of ' + q + ' started');
                __self__._performQuery(q, params, success, error);
            });
        }
    };

    __self__._performQuery = function (q, params, succ, err) {
        var d = new Date();
        var start = d.getTime();
        var ident = Password.generate({ flags: Password.flags.alnum(), len: 8 });
        console.log('START', ident, q, params);

        trFail = function (error) { console.log('transaction failed: ' + error.message, error); };
        trSucc = function () { console.log('transaction OK'); };

        __self__.db().transaction(
            function (tx) {
                tx.executeSql(
                    q, params,
                    function (db, result) {
                        var d = new Date();
                        var duration = d.getTime() - start;
                        console.log('OK', ident, "duration", duration, q, result);
                        if (succ) {
                            succ(db, result);
                        }
                        return true;
                    },
                    function (e) {
                        var d = new Date();
                        var duration = d.getTime() - start;
                        console.log('ERROR', ident, "duration", duration, q, e);
                        if (err) {
                            err(e);
                        }
                        return false;
                    }
                );
            },
            trFail,
            trSucc
        );
    };

    // create tables if they don't exists
    __self__.db().transaction(
        function (tx) {
            $.each(tables, function (key, item) {
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
                        console.log('CREATE of ' + key + '(' + query + ') ok');
                    },
                    function (error) {
                        console.log('createDB query "' + query + '" failed', error);
                    }
                );
            });
        },
        function (error) {
            console.log('Creation failed: ', error);
        },
        function () {
            console.log('Creation done');
            __self__._ready = true;
            __self__._onReady.fire();
        }
    );
}