var registerBpmnJSPlugin = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;

var SnakeCaseIDsPlugin = require('./SnakeCaseIDsPlugin');
registerBpmnJSPlugin(SnakeCaseIDsPlugin);
