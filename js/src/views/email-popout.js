define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/email-popout.html',
  '../utils/animation',
], function ($, _, Backbone, emailPopoutTemplate, Animation) {

  var EmailPopout = Backbone.View.extend({

    el: '#email-popout-container',

    template: _.template(emailPopoutTemplate),

    events: {
      'click #popout-cancel-btn': 'hidePopout',
      'click #popout-submit-btn': 'sendEmail',
      'click #cc-btn': 'showCCInput',
      'click #cc-me-btn': 'addUserToCC',
      'focus #email-user-comment': 'toggleCommentModel',
      'blur #email-user-comment': 'toggleCommentModel',
      'keyup #email-user-comment': 'insertInputToMail'

    },

    initialize: function () {
      var incidentId = this.model.incidentId,
          workflowTypeId = this.model.workflowTypeId,
          emailService = this.model.emailService,
          emailInfo, callback;

      if (!(emailService && incidentId && workflowTypeId)) {
        throw new Error('EmailPopout initialize - Invalide Arugments');
      }

      callback = function (data) {
        this.$el.html(this.template(data));
        this.render();
      }.bind(this)
      
      emailService.getContent(incidentId, workflowTypeId, callback);
      this.model = emailInfo;
    },

    render: function () {
      this.commentTextArea = document.getElementById('email-user-comment');
      this.toAddressInput = document.getElementById('email-to-address');
      this.insertAndCacheCommentArea();
      this.showPopout();
    },

    insertAndCacheCommentArea: function() {
      this.userCommentArea = document.getElementById('emailAdditionComments');
      $(this.userCommentArea).html('<p>Sender Comment: <span id="user-comments"></span></p>');
      this.userComments = document.getElementById('user-comments');
    },

    hidePopout: function () {
      this.$el.fadeOut("fast");
    },

    showPopout: function () {
      this.$el.fadeIn("fast");
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
          $ccInputBox = this.$el.find('#email-cc-address');
          ccUsers = $ccInputBox.val(),
          currentUser = user.name + ' [' + user.emailAddress + ']'

      if (!(user && user.name && user.emailAddress)) {
        this.showAlert('Can not retrieve your information (name / email address).');
        return;
      }

      ccUsers = ccUsers.concat((ccUsers.length === 0 ? '' : ',') + currentUser);
      $ccInputBox.val(ccUsers);

      addBtn.setAttribute('disabled', 'true');
    },

    showAlert: function (message) {
      var $alertTag = this.$el.find('.error-message');
      $alertTag.append(message);
    }

  })

  return EmailPopout;
});