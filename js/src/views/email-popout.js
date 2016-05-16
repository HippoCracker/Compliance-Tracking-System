define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/email-popout.html',
  '../utils/animation',
  '../utils/custom-tagit',
   'jquery.ui.tagit'
], function ($, _, Backbone, emailPopoutTemplate, Animation, Tagit) {

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
          callback;


      if (!(emailService && incidentId && workflowTypeId)) {
        throw new Error('EmailPopout initialize - Invalide Arugments');
      }

      callback = function (data) {
        this.model = data;
        this.$el.html(this.template(data));
        this.render();
      }.bind(this)

      emailService.getContent(incidentId, workflowTypeId, callback);
      this.emailService = emailService;
    },

    render: function () {
      this.commentTextArea = document.getElementById('email-user-comment');
      this.toAddressInput = document.getElementById('email-to-address');
      this.ccAddressInput = document.getElementById('email-cc-address');
      this.userCommentTextArea = document.getElementById('email-user-comment');

      var ccBeforeRemove = this.beforeRemoveUserFromCC.bind(this);
      this.ccAddressTagit = new Tagit('#email-cc-address', { beforeTagRemoved: ccBeforeRemove });
      this.toAddressTagit = new Tagit('#email-to-address');
      this.insertAndCacheCommentArea();
      this.showPopout();
    },

    insertAndCacheCommentArea: function () {
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

    displayAsTag: function(elem) {
      $(elem).tagit({
        allowSpaces: true,
        maxTags: 5,
        tagSource: function (request, response) {
          $.ajax({
            type: "POST",
            url: Backbone.siteRootUrl + 'Email/FetchEmailList',
            data: "{'nameStartsWith': '" + extractLast(request.term) + "'}",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
              response($.map(data, function (item) {
                // Show the name and e-mail in the DropDown
                //return item.Name + ' [' + item.Email + ']';
                return {
                  label: item,
                  value: item
                };
              }));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              //debugger;
              // XMLHttpRequest.responseText contains JSON like this 
              //   {"Message":"The exception message","StackTrace":"   at EmailLookup.GetData(String nameStartsWith) in ...","ExceptionType":"System.Exception"}
              // So just parse it out and display it!
              var err = jQuery.parseJSON(XMLHttpRequest.responseText);
              alert(err.Message);
            }
          }); // (end of ".ajax()")
        }
      });
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

      this.ccAddressTagit.add(currentUser);
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
          model = this.model;

      showResultFunc = _.partial(showResultFunc, _, [sendBtn]);
      
      if (isValid) {
        sendBtn.setAttribute('disabled', 'true');

        model.ToAddress = this.toAddressInput.value;
        model.CCAddress = this.ccAddressInput.value;
        model.UserMessageBody = this.userCommentTextArea.value;

        this.emailService.send(incidentId, model, showResultFunc);
      }
    },

    _validateForm: function() {
      var receiverNameAndEmails = this.toAddressInput.value;
      return receiverNameAndEmails.length > 0;
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