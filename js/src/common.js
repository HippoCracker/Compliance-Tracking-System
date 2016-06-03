define([
  'jquery',     
  'underscore', 
  'backbone',
  'date-format'
], function ($, _, Backbone, dateFormat) {
  
  var common = {
    // **Important**
    // Workflow Type must matches backend Enums class WorkflowTypeEnum
    WORKFLOW_TYPE: {
      Closed: 5,

      Compliance: 6,

      Initiator: 7,

      WorkingGroup: 8,

      Legal: 9,

      CCO: 10,

      Distribution: 11
    },

    formatDate: function (date, format) {
      if (date === void 0) return "";
      if (date && typeof date === 'string') date = new Date(date);
      if (format === void 0) format = this.DATE_FORMAT.LiteralUSFormatDate;
      return date.format(format);
    },

    // Format Mask: http://blog.stevenlevithan.com/archives/date-time-format
    DATE_FORMAT: {
      LiteralUSFormatDate: 'mmm. dd yyyy'
    },

    CONTROLLER_ACTION: {
      DeleteWorkflow: 'participant/deleteworkflow',
      SaveParticipants: 'participant/saveparticipants'
    }
  }

  return common;
});


define({


});
