import Ember from 'ember';
import DS from 'ember-data';
import SessionService from 'ember-simple-auth/services/session';

export default SessionService.extend({
  store: Ember.inject.service(),

  currentUser: Ember.computed('data.secure.userData', function () {

    var userData = this.get('data.authenticated.userData');

    if (Ember.isEmpty(userData)) {
      return null;
    } else {
      var model = this.get('store').modelFor('parse-user');
      var serializer = this.get('store').serializerFor(model);
      serializer.normalize(model, userData);
      serializer.extractRelationships(model, userData);

      var record = this.get('store').push('parse-user', userData);
      return record;
    }
  })
});