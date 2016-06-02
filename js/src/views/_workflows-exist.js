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

    tempate: `<a href="#" class="list-group-item <%= className %>">
                <h4 class="list-group-item-heading"><span class="index"><%= orderIndex %>.</span>@WorkflowName</h4>
                <span class="hint"></span>
                <input type="text" value="<%= participants %>">
              </a>`,

    events: {
      'click .delete-icon': 'deleteWorkflow',
      'click .save-btn': 'saveParticipants',
      'click .cancel-btn': 'undoParticipants',
    },

    initialize: function () {
      var changeCallback = this.showSaveCancelBtn.bind(this),
          tagitOptions = { afterTagAdded: changeCallback, afterTagRemoved: changeCallback };
      var participantNameInputTagit = new Tagit('.participant-name-input', tagitOptions);
      this.$el.find('.ui-autocomplete-input').attr('placeholder', '+');
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
        $indexInput.val($indexInput + increment);
      });
    },

    saveParticipants: function (e) {
      var $btnConatiner = $(e.target).parent(),
          $participantNameInput = $btnConatiner.siblings('.participant-name-input'),
          previousParticipants = $participantNameInput.attr('data-backup'),
          currentParticipants = $participantNameInput.val();



      $btnConatiner.fadeOut();
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