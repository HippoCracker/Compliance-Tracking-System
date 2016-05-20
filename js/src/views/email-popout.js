define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/email-popout.html',
  '../utils/animation',
  '../utils/custom-tagit',
], function ($, _, Backbone, emailPopoutTemplate, Animation, Tagit) {

  var EmailPopout = Backbone.View.extend({

    el: '#email-popout-container',

    template: _.template(emailPopoutTemplate),

    events: {
      'click #popout-cancel-btn': 'hidePopout',
      'click #popout-submit-btn': 'sendEmail',
      'click #cc-btn': 'showCCInput',
      'click #cc-me-btn': 'addUserToCC',
      'click #select-all-btn' : 'toggleCheckboxes',
      'focus #email-user-comment': 'toggleCommentModel',
      'blur #email-user-comment': 'toggleCommentModel',
      'keyup #email-user-comment': 'insertInputToMail'
    },

    initialize: function () {
      var emailService = this.model.emailService,
          data = this.model.data,
          $participantsTableContainer = $('#current-stage-detail-template'),
          callback;

      this.model = {};
      $participantsTableContainer.find('table').attr('class', 'checkbox-table');
      this.model.participantsTable = $participantsTableContainer.find('.table-container').html();

      if (!emailService || !data)
        throw new Error("Invalid parameters, must pass a model object contains EmailService and data");

      callback = function (result) {
        var model = this.model
        _.extend(model, result);
        this.$el.html(this.template(model));
        this.render();
      }.bind(this)

      emailService.getEmailContent(data, callback);
      this.emailService = emailService;

    },

    render: function () {
      this.commentTextArea = document.getElementById('email-user-comment');
      this.ccAddressInput = document.getElementById('email-cc-address');
      this.userCommentTextArea = document.getElementById('email-user-comment');
      this.$participantCheckboxes = this.$el.find('.row-checkbox-container input[type=checkbox]');

      var ccBeforeRemove = this.beforeRemoveUserFromCC.bind(this);
      this.ccAddressTagit = new Tagit('#email-cc-address', { beforeTagRemoved: ccBeforeRemove });
      this.insertAndCacheCommentArea();
      this.showPopout();
    },

    insertAndCacheCommentArea: function () {
      this.userCommentArea = document.getElementById('emailAdditionComments');
      $(this.userCommentArea).html('<p>Sender Comment: <span id="user-comments"></span></p>');
      this.userComments = document.getElementById('user-comments');
    },

    hidePopout: function () {
      this.$el.fadeOut();
    },

    showPopout: function () {
      this.$el.fadeIn();
    },

    toggleCommentModel: function (e) {
      var commentTextArea = e.target,
          $commentTextArea = $(commentTextArea),
          isFocus = $commentTextArea.is(':focus'),
          popout = document.getElementById('email-popout');

      if (isFocus) {
        Animation.move(popout, { top: 10 });
        Animation.dimension('#email-user-comment', { height: 120 });
        $('#emailAdditionComments').fadeIn();

      } else if ((commentTextArea.textLength || $commentTextArea.val()).length === 0) {
        Animation.move(popout, { top: 60 });
        Animation.dimension('#email-user-comment', { height: 60 });
        $('#emailAdditionComments').fadeOut();
      }

    },

    insertInputToMail: function (e) {
      var userInput = this.commentTextArea.value;
      console.log(userInput);
      this.userComments.innerHTML = userInput;
    },

    showCCInput: function (e) {
      $(e.target).fadeOut('fast');
      this.$el.find('#email-cc-container').fadeIn('fast');
    },

    addUserToCC: function (e) {
      var addBtn = e.target,
          user = Backbone.user,
          $ccInputBox = this.$el.find('#email-cc-address'),
          currentUser = user.name + ' [' + user.emailAddress + ']';

      if (!(user && user.name && user.emailAddress)) {
        this.showAlert('Can not retrieve your information (name / email address).');
        return;
      }

      addBtn.setAttribute('disabled', 'true');

      // Use this has error: cannot call methods on tagit prior to initialization
      // TODO: figure out why.
      //-----------------------
      //this.ccAddressTagit.add(currentUser);

      // Use update in custom-tagit
      this.ccAddressInput.value = this.ccAddressInput.value.concat(currentUser);
      this.ccAddressTagit.update();
    },

    beforeRemoveUserFromCC: function(event, ui) {
      var username = Backbone.user.name;
      if (ui.tagLabel.indexOf(username) >= 0) {
        this.$el.find('#cc-me-btn').removeAttr('disabled');
      }
      console.log(ui);
    },

    showAlert: function (message) {
      var $alertTag = this.$el.find('.error-message');
      $alertTag.append(message);
    },

    sendEmail: function (e) {
      var isValid = this._validateForm(),
          sendBtn = e.target,
          incidentId = Backbone.incident.incidentId,
          showResultFunc = this._showSendResult.bind(this),
          model = this.model,
          $checkboxes = this.$participantCheckboxes,
          toAddressArray = [],
          selectedCheckboxes = _.filter($checkboxes, function (checkbox) { return checkbox.checked == true });

      showResultFunc = _.partial(showResultFunc, _, [sendBtn]);
      
      if (isValid) {
        sendBtn.setAttribute('disabled', 'true');

        _.each(selectedCheckboxes, function (checkbox) {
          toAddressArray.push(checkbox.value);
        });

        model.ToAddress = toAddressArray.join(',');
        model.CCAddress = this.ccAddressInput.value;
        model.UserMessageBody = this.userCommentTextArea.value;

        this.emailService.send(incidentId, model, showResultFunc);
      }
    },

    toggleCheckboxes: function(e) {
      var $selectAllBtn = $(e.target),
          $checkboxes = this.$participantCheckboxes;

      if ($checkboxes.prop('checked')) {
        $checkboxes.each(function () {
          this.checked = false;
        });
      } else {
        $checkboxes.each(function () {
          this.checked = true
        });
      }
    },

    _validateForm: function () {
      return true;
    },

    _showSendResult: function (result, elems) {
      var $alertTag;

      _.each(elems, function (elem) {
        elem.removeAttribute('disabled');
      });

      $alertTag = this.$el.find('header > h4');
      $alertTag.html(result.message);

      if (result.success) {
        $alertTag.attr('class', 'text-success');
      } else {
        $alertTag.attr('class', 'text-danger');
      }
    },

  });

  return EmailPopout;
});