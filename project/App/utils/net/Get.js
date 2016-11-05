'use strict';

function GET(url, success, error) {
    console.log("getSend:", url);
    app.showWait();
    fetch(url,  {
        method: 'get',
        headers: {
            'apikey': '41a92c6e398afc79efd35252a630639b'
        },
    })
    .then((response) => response.json())
    .then((json) => {
        console.log("getRecv:", json);
        app.hideWait();
        success && success(json);
    })
    .catch((err) => {
        app.hideWait();
        if (!error||!error(err)) {
            Toast("网络出错");
        }
    });
}

module.exports = GET;
