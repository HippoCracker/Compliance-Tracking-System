define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './page-alert',
  '../utils/custom-tagit',
  '../utils/animation',
], function ($, _, Backbone, common, PageAlert, Tagit, Animation) {

  var WorkflowExistView = Backbone.View.extend({

    el: '#exist-workflow-container',

    events: {
      'click .delete-icon': 'deleteWorkflow',
      'click .save-btn': 'saveParticipants',
      'click .cancel-btn': 'undoParticipants',
    },

    initialize: function () {
      var changeCallback = this.showSaveCancelBtn.bind(this),
          tagitOptions = { afterTagAdded: changeCallback, afterTagRemoved: changeCallback },
          participantNameInputTagit = new Tagit('.participant-name-input', tagitOptions);

      this.$el.find('.ui-autocomplete-input').attr('placeholder', '+');

      this.tagitOptions = tagitOptions;
    },

    render: function () {

    },

    deleteWorkflow: function (e) {
      var
        $listItemTag = $(e.target).closest('.list-group-item'),
        orderIndex = $listItemTag.find('.workflow-order').val(),
        incidentId = Backbone.incident.incidentId,
        url = Backbone.siteRootUrl + common.CONTROLLER_ACTION.DeleteWorkflow,
        data = { incidentId: incidentId, orderIndex: orderIndex },
        removeListTag = this.removeListTag.bind(this),
        refreshIndexAfterTag = this.refreshIndexAfterTag.bind(this);

      $.ajax({
        type: 'post',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
      }).done(function (data) {
        PageAlert.success(data.workflowName + ' workflow has removed');
        removeListTag($listItemTag);
        refreshIndexAfterTag($listItemTag, -1);
      }).fail(function (err) {
        PageAlert.error(err.message);
      });
    },

    addListTag: function (elem, order) {
      $elem = $(elem).css('display', 'none');

      var tagitOptions = this.tagitOptions;
      var listItem = this.$el.find('.list-group-item')[order -1];
      $(listItem).before($elem);
      var tag = this.$el.find('.list-group-item')[order - 1];
      new Tagit($(tag).find('.participant-name-input'), tagitOptions);
      Animation.toggleDown(tag);
      this.refreshIndexAfterTag(tag, 1);
    },

    removeListTag: function (elem) {
      Animation.toggleUp(elem);
      setTimeout($(elem).remove, 2000);
    },

    refreshIndexAfterTag: function (listItemElem, increment) {
      var
        listItemElems = $(listItemElem).nextAll(),
        $indexElems, $indexInput;

      _.each(listItemElems, function (elem) {
        $indexElems = $(elem).find('.index');
        $indexInput = $(elem).find('.workflow-order');
        $indexElems.text(Number($indexElems.text()) + increment);
        $indexInput.val(Number($indexInput.val()) + increment);
      });
    },

    saveParticipants: function (e) {
      var $btnConatiner = $(e.target).parent(),
          $participantNameInput = $btnConatiner.siblings('.participant-name-input'),
          currentParticipants = $participantNameInput.val(),
          incidentId = Backbone.incident.incidentId,
          orderIndex = $btnConatiner.siblings('.workflow-order').val(),
          data = { incidentId: incidentId, orderIndex: orderIndex, participants: currentParticipants },
          url = Backbone.siteRootUrl + common.CONTROLLER_ACTION.SaveParticipants;

      $.ajax({
        type: 'post',
        url: url,
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
      }).done(function (data) {
        PageAlert.success(data.message);
        $btnConatiner.fadeOut();
        $participantNameInput.attr('data-backup', currentParticipants);
      }).fail(function (err) {
        PageAlert.error(err.message);
      });
    },

    undoParticipants: function (e) {
      var $btnConatiner = $(e.target).parent(),
          $participantNameInput = $btnConatiner.siblings('.participant-name-input'),
          previousParticipants = $participantNameInput.attr('data-backup');

      new Tagit($participantNameInput).update(previousParticipants);
      $btnConatiner.fadeOut();
    },

    showSaveCancelBtn: function (event, ui) {
      var $participantInput = $(event.target),
          $btnContainer = $participantInput.siblings('.btn-container'),
          previousParticipants = $participantInput.attr('data-backup'),
          newParticipants = $participantInput.val();

      if (previousParticipants === newParticipants) {
        $btnContainer.css('display', 'none');
      } else {
        $btnContainer.css('display', 'inline-block');
      }
    }

  });

  return WorkflowExistView;
});