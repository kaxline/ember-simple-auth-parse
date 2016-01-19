import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default BaseAuthenticator.extend({
  store: Ember.inject.service(),

  restore: function(data) {
    data = data || {};

    var authenticator = this;

    var promise = new Ember.RSVP.Promise(function (resolve, reject) {

      if (data.sessionToken) {
        var adapter = authenticator.container.lookup('store:main').adapterFor('parseUser');

        adapter.ajax('https://api.parse.com/1/users/me', 'GET', {
          headers: {
            'X-Parse-Session-Token': data.sessionToken
          }
        }).then(function (response) {
          adapter.set('sessionToken', data.sessionToken);
          var userData = normalizeSessionData(response);
          resolve(userData);
        });
      } else {
        reject("Session token not found");
      }

    });

    return promise
  },

  authenticate: function(data) {
    data = data || {};

    var adapter = this.container.lookup('store:main').adapterFor('parseUser');

    var promise = new Ember.RSVP.Promise(function (resolve, reject) {
      adapter.ajax('https://api.parse.com/1/login', 'GET', {
        data: {
          username: data.identification,
          password: data.password
        }
      }).then(function (response, test) {
        adapter.set('sessionToken', response.sessionToken);
        var normalizedData = normalizeSessionData(response);
        resolve(normalizedData);
      }, function (response) {
        reject({message: "Incorrect username or password"});
      });
    });

    return promise;
  }
});

function normalizeSessionData(response) {
  var data = {
    sessionToken: response.sessionToken,
    userData: response
  };
  delete data.userData.sessionToken;
  return data;
}
