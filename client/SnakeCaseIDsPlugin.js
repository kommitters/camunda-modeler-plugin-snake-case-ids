'use strict';

var removeDiacritics = require('diacritics').remove;
var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event'),
    domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query'),
    clear = require('min-dom/lib/clear');

function SnakeCaseIDsPlugin(elementRegistry, editorActions, canvas, modeling) {
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;

  var self = this;

  this.state = {
    open: false
  };

  editorActions.register({
    generateSnakeCaseIDs: function() {
      self.generateAndShow();
    }
  });

  this.addContainer(canvas.getContainer().parentNode);
}


SnakeCaseIDsPlugin.prototype.generateAndShow = function() {
  if (!this.state.open) {
    this.toggle();
  }
  this.generateIDs();
  this.showIDs();
};

SnakeCaseIDsPlugin.prototype.addContainer = function(container) {
  var self = this;
  var markup = '<div class="djs-popup djs-snake-case-ids"> \
    <div class="djs-snake-case-ids-container"> \
      <button class="generate-ids">Generate IDs</button> \
      <button class="rename-ids">Rename IDs</button> \
      <ul class="id-list"></ul> \
    </div> \
    <div class="djs-snake-case-ids-toggle">snake_case IDs</div> \
    </div>';
  this.element = domify(markup);

  container.appendChild(this.element);

  domEvent.bind(domQuery('.djs-snake-case-ids-toggle', this.element), 'click', function() {
    self.toggle();
  });
  domEvent.bind(domQuery('.generate-ids', this.element), 'click', function() {
    self.generateIDs();
    self.showIDs();
  });
  domEvent.bind(domQuery('.rename-ids', this.element), 'click', function() {
    self.retry = 0;
    self.renameIDs();
  });
};

SnakeCaseIDsPlugin.prototype.toggle = function() {
  if (this.state.open) {
    domClasses(this.element).remove('open');
    this.state.open = false;
  } else {
    domClasses(this.element).add('open');
    this.state.open = true;
  }
};

SnakeCaseIDsPlugin.prototype.generateIDs = function() {
  var self = this;
  var elements = this._elementRegistry._elements;
  this.technicalIds = {};
  Object.keys(elements).forEach(function(key) {
    if (elements[key].type != 'label') {
      var businessObject = elements[key].element.businessObject;
      if (businessObject != null && businessObject.name) {
        var technicalId = self._getSnakeCaseID(businessObject.name, businessObject.$type);
        self.technicalIds[businessObject.id] = technicalId;
      }
    }
  });
  this._verifyDuplicateIds();
};

SnakeCaseIDsPlugin.prototype._verifyDuplicateIds = function() {
  var self = this;
  var values = {};
  Object.keys(this.technicalIds).forEach(function(technicalId) {
    var newTechnicalId = self.technicalIds[technicalId];
    if (values[newTechnicalId] != null) {
      values[newTechnicalId] = values[newTechnicalId] + 1;
      self.technicalIds[technicalId] = self.technicalIds[technicalId] + '_' + values[newTechnicalId];
    } else {
      values[newTechnicalId] = 0;
    }
  });
};

SnakeCaseIDsPlugin.prototype.showIDs = function() {
  var self = this;
  var idList = domQuery('.id-list', this.element);
  clear(idList);

  if (this.technicalIds != null) {
    Object.keys(this.technicalIds).forEach(function(technicalId) {
      if (technicalId == self.technicalIds[technicalId]) {
        idList.append(domify('<li>' + technicalId + ' --> ' + self.technicalIds[technicalId] + '</li>'));
      } else {
        idList.append(domify('<li>' + technicalId + ' --> <span style="background-color:#ffbc00">' + self.technicalIds[technicalId] + '</span></li>'));
      }
    });
  }
};

SnakeCaseIDsPlugin.prototype.renameIDs = function() {
  var self = this;

  Object.keys(this.technicalIds).forEach(function(technicalId) {
    if (technicalId != self.technicalIds[technicalId] && self._elementRegistry.get(self.technicalIds[technicalId]) != null) {
      self.retry = self.retry + 1;
    } else {
      var element = self._elementRegistry.get(technicalId);
      var properties = {
        id: self.technicalIds[technicalId]
      };
      self._modeling.updateProperties(element, properties);
    }
  });

  if (self.retry > 0 && self.retry < 100) {
    this.renameIDs();
  }
};

SnakeCaseIDsPlugin.prototype._getSnakeCaseID = function(name, type) {
  name = removeDiacritics(name);
  name = name.replace(/[^\w\s]/gi, '');

  if (type === 'bpmn:Process') {
    name = this._toPascalCase(name);
    if (!isNaN(name.charAt(0))) {
      name = 'N' + name;
    }
    return name;
  }

  name = this._toSnakeCase(name);
  if (!isNaN(name.charAt(0))) {
    name = 'n_' + name;
  }

  return this._getPrefix(type) + name;
};

SnakeCaseIDsPlugin.prototype._toPascalCase = function(str) {
  var camel = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

SnakeCaseIDsPlugin.prototype._getPrefix = function(type) {
  var prefixMap = {
    'bpmn:UserTask':           'ut_',
    'bpmn:ServiceTask':        'st_',
    'bpmn:ScriptTask':         'sct_',
    'bpmn:BusinessRuleTask':   'brt_',
    'bpmn:ManualTask':         'mt_',
    'bpmn:SendTask':           'snt_',
    'bpmn:ReceiveTask':        'rt_',
    'bpmn:ExclusiveGateway':   'gw_',
    'bpmn:ParallelGateway':    'pgw_',
    'bpmn:ComplexGateway':     'cgw_',
    'bpmn:EventBasedGateway':  'ebgw_',
    'bpmn:StartEvent':         'se_',
    'bpmn:EndEvent':           'ee_',
    'bpmn:IntermediateCatchEvent': 'ice_',
    'bpmn:IntermediateThrowEvent': 'ite_',
    'bpmn:SubProcess':         'sp_',
    'bpmn:CallActivity':       'ca_',
    'bpmn:SequenceFlow':       'sf_'
  };
  return prefixMap[type] || '';
};

// Converts a string (words separated by spaces, or PascalCase/camelCase) to snake_case
SnakeCaseIDsPlugin.prototype._toSnakeCase = function(str) {
  return str
    .trim()
    .replace(/([A-Z])/g, ' $1')       // split PascalCase/camelCase on uppercase letters
    .replace(/[\s_]+/g, '_')           // collapse spaces and underscores
    .replace(/^_|_$/g, '')             // strip leading/trailing underscores
    .toLowerCase();
};


SnakeCaseIDsPlugin.$inject = ['elementRegistry', 'editorActions', 'canvas', 'modeling'];

module.exports = {
  __init__: ['snakeCaseIDsPlugin'],
  snakeCaseIDsPlugin: ['type', SnakeCaseIDsPlugin]
};
